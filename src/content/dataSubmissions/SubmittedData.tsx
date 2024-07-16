import React, { FC, useMemo, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { Button, Stack, styled } from "@mui/material";
import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
} from "../../graphql";
import GenericTable, { Column } from "../../components/GenericTable";
import {
  SubmittedDataFilters,
  FilterForm,
} from "../../components/DataSubmissions/SubmittedDataFilters";
import { moveToFrontOfArray, safeParse } from "../../utils";
import { ExportNodeDataButton } from "../../components/DataSubmissions/ExportNodeDataButton";
import DataViewDetailsDialog from "../../components/DataSubmissions/DataViewDetailsDialog";

const StyledFirstColumnButton = styled(Button)(() => ({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "25px",
  color: "#0B6CB1",
  padding: 0,
  margin: 0,
  textDecoration: "underline",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

type T = Pick<SubmissionNode, "nodeType" | "nodeID" | "status"> & {
  props: Record<string, string>;
};

type Props = {
  submissionId: string;
  submissionName: string;
};

const SubmittedData: FC<Props> = ({ submissionId, submissionName }) => {
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
  const [selectedRow, setSelectedRow] = useState<T>(null);

  const [getSubmissionNodes] = useLazyQuery<GetSubmissionNodesResp, GetSubmissionNodesInput>(
    GET_SUBMISSION_NODES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const renderFirstColumnValue = (d: T, prop: string): React.ReactNode => (
    <StyledFirstColumnButton variant="text" onClick={() => onClickFirstColumn(d)} disableRipple>
      {d?.props?.[prop] || ""}
    </StyledFirstColumnButton>
  );

  const onClickFirstColumn = (data: T) => {
    setSelectedRow(data);
  };

  const handleCloseDialog = () => {
    setSelectedRow(null);
  };

  const handleSetupColumns = (rawColumns: string[], keyColumn: string) => {
    if (!rawColumns?.length) {
      setLoading(false);
    }

    // move the keyColumn to the front of array, if it exists in rawColumns
    const columnsClone = moveToFrontOfArray([...rawColumns], keyColumn);

    const cols: Column<T>[] = columnsClone.map((prop: string, idx: number) => ({
      label: prop,
      renderValue: (d) =>
        (idx === 0 ? renderFirstColumnValue(d, prop) : d?.props?.[prop] || "") as React.ReactNode,
      // NOTE: prop is not actually a keyof T, but it's a value of prop.props
      fieldKey: prop,
      default: idx === 0 ? true : undefined,
    }));

    cols.push({
      label: "Status",
      renderValue: (d) => d?.status || "",
      field: "status",
    });

    if (isEqual(cols, columns)) {
      return;
    }

    setColumns(cols || []);
  };

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
      handleSetupColumns(d.getSubmissionNodes.properties, d.getSubmissionNodes.IDPropName);
      setTotalData(d.getSubmissionNodes.total);

      prevFilterRef.current = filterRef.current;
    }

    setData(
      d.getSubmissionNodes.nodes.map((node) => ({
        nodeType: node.nodeType,
        nodeID: node.nodeID,
        props: safeParse(node.props),
        status: node.status,
      }))
    );
    setLoading(false);
  };

  const handleFilterChange = (filters: FilterForm) => {
    filterRef.current = filters;
    tableRef.current?.setPage(0, true);
  };

  const Actions = useMemo<React.ReactNode>(
    () => (
      <Stack direction="row" alignItems="center" gap="8px" marginRight="37px">
        <ExportNodeDataButton
          submission={{ _id: submissionId, name: submissionName }}
          nodeType={filterRef.current.nodeType}
          disabled={loading || !data?.length}
        />
      </Stack>
    ),
    [submissionId, submissionName, filterRef.current.nodeType, loading, data.length]
  );

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
        position="both"
        AdditionalActions={Actions}
        setItemKey={(item, idx) => `${idx}_${item.nodeID}_${item.nodeID}`}
        onFetchData={handleFetchData}
        containerProps={{ sx: { marginBottom: "8px" } }}
        tableProps={{ sx: { whiteSpace: "nowrap" } }}
      />
      <DataViewDetailsDialog
        submissionID={submissionId}
        nodeType={selectedRow?.nodeType}
        nodeID={selectedRow?.nodeID}
        open={!!selectedRow}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default React.memo<Props>(SubmittedData, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
