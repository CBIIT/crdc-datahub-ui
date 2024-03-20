import { FC, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { useSnackbar } from 'notistack';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from "../../graphql";
import GenericTable, { Column, FetchListing, TableMethods } from "../../components/DataSubmissions/GenericTable";
import { DataContentFilters, FilterForm } from '../../components/DataSubmissions/DataContentFilters';

type TODO = QCResult; // TODO: Type this when the real type is known

type Props = {
  submissionId: string;
  statistics: SubmissionStatistic[];
};

const columns: Column<TODO>[] = [
  {
    label: "TBD",
    renderValue: () => "TBD",
    field: "displayID",
    default: true
  },
];

const DataContent: FC<Props> = ({ submissionId, statistics }) => {
  const { enqueueSnackbar } = useSnackbar();

  const tableRef = useRef<TableMethods>(null);
  const filterRef = useRef<FilterForm>({ nodeType: "" });

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TODO[]>([]);
  const [prevListing, setPrevListing] = useState<FetchListing<TODO>>(null);
  const [totalData, setTotalData] = useState<number>(0);
  const [submissionQCResults] = useLazyQuery<SubmissionQCResultsResp>(SUBMISSION_QC_RESULTS, {
    variables: { id: submissionId },
    context: { clientName: 'backend' },
    fetchPolicy: 'cache-and-network',
  });

  const handleFetchData = async (fetchListing: FetchListing<TODO>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      enqueueSnackbar("Cannot fetch results. Submission ID is invalid or missing.", { variant: "error" });
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

    setPrevListing(fetchListing);
    setLoading(true);

    const { data: d, error } = await submissionQCResults({
      variables: {
        first,
        offset,
        sortDirection,
        orderBy,
        nodeTypes: [filterRef.current.nodeType],
      },
      context: { clientName: 'backend' },
      fetchPolicy: 'no-cache'
    });

    if (error || !d?.submissionQCResults) {
      enqueueSnackbar("Unable to retrieve node data.", { variant: "error" });
      setLoading(false);
      return;
    }

    setData(d.submissionQCResults.results);
    setTotalData(d.submissionQCResults.total);
    setLoading(false);
  };

  const handleFilterChange = (filters: FilterForm) => {
    filterRef.current = filters;
    tableRef.current?.setPage(0, true);
  };

  return (
    <>
      <DataContentFilters statistics={statistics} onChange={handleFilterChange} />
      <GenericTable
        ref={tableRef}
        columns={columns}
        data={data || []}
        total={totalData || 0}
        loading={loading}
        defaultRowsPerPage={20}
        defaultOrder="desc"
        setItemKey={(item, idx) => `${idx}_${item.batchID}_${item.submittedID}`}
        onFetchData={handleFetchData}
      />
    </>
  );
};

export default DataContent;
