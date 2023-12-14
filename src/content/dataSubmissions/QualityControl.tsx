import { useMemo, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { isEqual } from "lodash";
import { Box, Button, styled } from "@mui/material";
import { SUBMISSION_QC_RESULTS, submissionQCResultsResp } from "../../graphql";
import GenericTable, { Column, FetchListing, TableMethods } from "../../components/DataSubmissions/GenericTable";
import { FormatDate } from "../../utils";
import ErrorDialog from "./ErrorDialog";
import QCResultsContext from "./Contexts/QCResultsContext";

const StyledErrorDetailsButton = styled(Button)({
  display: "inline",
  color: "#0D78C5",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  padding: 0,
  textDecorationLine: "underline",
  textTransform: "none",
  "&:hover": {
    background: "transparent",
    textDecorationLine: "underline",
  },
});

const StyledNodeType = styled(Box)({
  display: "flex",
  alignItems: "center",
  textTransform: "capitalize"
});

const StyledSeverity = styled(Box)({
  minHeight: 76.5,
  display: "flex",
  alignItems: "center",
});

const columns: Column<QCResult>[] = [
  {
    label: "Type",
    renderValue: (data) => <StyledNodeType>{data?.nodeType}</StyledNodeType>,
    field: "nodeType",
  },
  {
    label: "Batch ID",
    renderValue: (data) => data?.batchID,
    field: "batchID",
  },
  {
    label: "Node ID",
    renderValue: (data) => data?.nodeID,
    field: "nodeID",
  },
  {
    label: "CRDC ID",
    renderValue: (data) => data?.CRDC_ID,
    field: "CRDC_ID",
  },
  {
    label: "Severity",
    renderValue: (data) => <StyledSeverity color={data?.severity === "Error" ? "#E25C22" : "#8D5809"}>{data?.severity}</StyledSeverity>,
    field: "severity",
  },
  {
    label: "Validated Date",
    renderValue: (data) => (data?.uploadedDate ? `${FormatDate(data.uploadedDate, "MM-DD-YYYY [at] hh:mm A")}` : ""),
    field: "uploadedDate",
    default: true
  },
  {
    label: "Reasons",
    renderValue: (data) => data?.description?.length > 0 && (
      <QCResultsContext.Consumer>
        {({ handleOpenErrorDialog }) => (
          <>
            <span>{data.description[0]?.title}</span>
            {" "}
            <StyledErrorDetailsButton
              onClick={() => handleOpenErrorDialog && handleOpenErrorDialog(data)}
              variant="text"
              disableRipple
              disableTouchRipple
              disableFocusRipple
            >
              See details
            </StyledErrorDetailsButton>
          </>
        )}
      </QCResultsContext.Consumer>
    ),
    field: "description",
    sortDisabled: true,
    sx: {
      minWidth: "260px",
    }
  },
];

const QualityControl = () => {
  const { submissionId } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>(null);
  const [data, setData] = useState<QCResult[]>([]);
  const [prevData, setPrevData] = useState<FetchListing<QCResult>>(null);
  const [totalData, setTotalData] = useState(0);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<QCResult | null>(null);
  const tableRef = useRef<TableMethods>(null);

  const [submissionQCResults] = useLazyQuery<submissionQCResultsResp>(SUBMISSION_QC_RESULTS, {
    variables: { id: submissionId },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleFetchQCResults = async (fetchListing: FetchListing<QCResult>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      setError("Invalid submission ID provided.");
      return;
    }
    if (!force && data?.length > 0 && isEqual(fetchListing, prevData)) {
      return;
    }

    setPrevData(fetchListing);

    try {
      setLoading(true);
      const { data: d, error } = await submissionQCResults({
        variables: {
          submissionID: submissionId,
          first,
          offset,
          sortDirection,
          orderBy
        },
        context: { clientName: 'backend' },
        fetchPolicy: 'no-cache'
      });
      if (error || !d?.submissionQCResults) {
        throw new Error("Unable to retrieve submission quality control results.");
        return;
      }
      setData(d.submissionQCResults.results);
      setTotalData(d.submissionQCResults.total);
    } catch (err) {
      setError(err?.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleOpenErrorDialog = (data: QCResult) => {
    setOpenErrorDialog(true);
    setSelectedRow(data);
  };

  const providerValue = useMemo(() => ({
    handleOpenErrorDialog
  }), [handleOpenErrorDialog]);

  return (
    <>
      <QCResultsContext.Provider value={providerValue}>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={data || []}
          total={totalData || 0}
          loading={loading}
          defaultRowsPerPage={20}
          setItemKey={(item, idx) => `${idx}_${item.batchID}_${item.nodeID}`}
          onFetchData={handleFetchQCResults}
        />
      </QCResultsContext.Provider>
      <ErrorDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header="Data Submission"
        title="Reasons"
        errors={selectedRow?.description?.map((error) => error.description)}
        uploadedDate={selectedRow?.uploadedDate}
      />
    </>
  );
};

export default QualityControl;
