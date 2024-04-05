import { FC, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { GET_SUBMISSION_NODES, GetSubmissionNodesResp } from "../../graphql";
import GenericTable, {
  Column,
  FetchListing,
  TableMethods,
} from "../../components/DataSubmissions/GenericTable";
import {
  SubmittedDataFilters,
  FilterForm,
} from "../../components/DataSubmissions/SubmittedDataFilters";
import { safeParse } from "../../utils";

type T = Pick<SubmissionNode, "nodeType" | "nodeID"> & {
  props: Record<string, string>;
};

type Props = {
  submissionId: string;
};

const SubmittedData: FC<Props> = ({ submissionId }) => {
  const { enqueueSnackbar } = useSnackbar();

  const tableRef = useRef<TableMethods>(null);
  const filterRef = useRef<FilterForm>({ nodeType: "" });
  const prevFilterRef = useRef<FilterForm>({ nodeType: "" });
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column<T>[]>([]);
  const [data, setData] = useState<T[]>([]);
  const [prevListing, setPrevListing] = useState<FetchListing<T>>(null);
  const [totalData, setTotalData] = useState<number>(0);

  const [getSubmissionNodes] = useLazyQuery<GetSubmissionNodesResp>(GET_SUBMISSION_NODES, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      enqueueSnackbar("Cannot fetch results. Submission ID is invalid or missing.", {
        variant: "error",
      });
      return;
    }
    if (!force && data?.length > 0 && isEqual(fetchListing, prevListing)) {
      return;
    }
    if (!filterRef.current.nodeType) {
      setData([]);
      setTotalData(0);
      return;
    }
    if (abortControllerRef.current && prevListing) {
      abortControllerRef.current.abort();
    }

    setPrevListing(fetchListing);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { data: d, error } = await getSubmissionNodes({
      variables: {
        _id: submissionId,
        first,
        offset,
        sortDirection,
        orderBy,
        nodeType: filterRef.current.nodeType,
      },
      context: { fetchOptions: { signal: abortController.signal } },
    });

    if (abortController.signal.aborted) {
      return;
    }

    if (error || !d?.getSubmissionNodes || !d?.getSubmissionNodes?.properties?.length) {
      enqueueSnackbar("Unable to retrieve node data.", { variant: "error" });
      setLoading(false);
      return;
    }

    // Only update columns if the nodeType has changed
    if (prevFilterRef.current.nodeType !== filterRef.current.nodeType) {
      setTotalData(d.getSubmissionNodes.total);
      setColumns(
        d.getSubmissionNodes.properties.map((prop: string, index: number) => ({
          label: prop,
          renderValue: (d) => d?.props?.[prop] || "",
          // NOTE: prop is not actually a keyof T, but it's a value of prop.props
          field: prop as unknown as keyof T,
          default: index === 0 ? true : undefined,
        }))
      );

      prevFilterRef.current = filterRef.current;
    }

    setData(
      d.getSubmissionNodes.nodes.map((node) => ({
        nodeType: node.nodeType,
        nodeID: node.nodeID,
        props: safeParse(node.props),
      }))
    );
    setLoading(false);
  };

  const handleFilterChange = (filters: FilterForm) => {
    filterRef.current = filters;
    tableRef.current?.setPage(0, true);
  };

  return (
    <>
      <SubmittedDataFilters submissionId={submissionId} onChange={handleFilterChange} />
      <GenericTable
        ref={tableRef}
        columns={columns}
        data={data || []}
        total={totalData || 0}
        loading={loading}
        defaultRowsPerPage={20}
        defaultOrder="desc"
        horizontalScroll
        setItemKey={(item, idx) => `${idx}_${item.nodeID}_${item.nodeID}`}
        onFetchData={handleFetchData}
      />
    </>
  );
};

export default SubmittedData;
