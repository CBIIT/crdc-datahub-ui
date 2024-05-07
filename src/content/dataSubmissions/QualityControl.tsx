import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { isEqual } from "lodash";
import { Box, Button, FormControl, MenuItem, Select, Stack, styled } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  LIST_BATCHES,
  LIST_NODE_TYPES,
  ListBatchesResp,
  ListNodeTypesResp,
  SUBMISSION_QC_RESULTS,
  SubmissionQCResultsResp,
} from "../../graphql";
import GenericTable, { Column } from "../../components/DataSubmissions/GenericTable";
import { FormatDate, capitalizeFirstLetter } from "../../utils";
import ErrorDialog from "./ErrorDialog";
import QCResultsContext from "./Contexts/QCResultsContext";
import { ExportValidationButton } from "../../components/DataSubmissions/ExportValidationButton";
import DeleteAllOrphanFilesButton from "../../components/DataSubmissions/DeleteAllOrphanFilesButton";
import DeleteOrphanFileButton from "../../components/DataSubmissions/DeleteOrphanFileButton";

type FilterForm = {
  /**
   * The node type to filter by.
   *
   * @default "All"
   */
  nodeType: string;
  batchID: number | "All";
  severity: QCResult["severity"] | "All";
};

const StyledErrorDetailsButton = styled(Button)({
  display: "inline",
  color: "#0B6CB1",
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
  textTransform: "capitalize",
});

const StyledSeverity = styled(Box)({
  minHeight: 76.5,
  display: "flex",
  alignItems: "center",
});

const StyledBreakAll = styled(Box)({
  wordBreak: "break-all",
});

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: "19px",
  paddingLeft: "24px",
});

const StyledFormControl = styled(FormControl)({
  margin: "10px",
  marginRight: "15px",
  minWidth: "250px",
});

const StyledInlineLabel = styled("label")({
  padding: "0 10px",
  fontWeight: "700",
});

const StyledIssuesTextWrapper = styled(Box)({
  whiteSpace: "nowrap",
  wordBreak: "break-word",
});

const baseTextFieldStyles = {
  borderRadius: "8px",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    padding: "10px",
    height: "20px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D",
    boxShadow:
      "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .Mui-disabled": {
    cursor: "not-allowed",
  },
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiMenuItem-root.Mui-selected": {
    background: "#3E7E6D !important",
    color: "#FFFFFF !important",
  },
  "& .MuiMenuItem-root:hover": {
    background: "#D5EDE5",
  },
};

const StyledSelect = styled(Select)(baseTextFieldStyles);

const columns: Column<QCResult>[] = [
  {
    label: "Batch ID",
    renderValue: (data) => <StyledBreakAll>{data?.displayID}</StyledBreakAll>,
    field: "displayID",
    default: true,
  },
  {
    label: "Node Type",
    renderValue: (data) => <StyledNodeType>{data?.type}</StyledNodeType>,
    field: "type",
  },
  {
    label: "Submitted Identifier",
    renderValue: (data) => <StyledBreakAll>{data?.submittedID}</StyledBreakAll>,
    field: "submittedID",
    sx: {
      width: "20%",
    },
  },
  {
    label: "Severity",
    renderValue: (data) => (
      <StyledSeverity color={data?.severity === "Error" ? "#B54717" : "#8D5809"}>
        {data?.severity}
      </StyledSeverity>
    ),
    field: "severity",
  },
  {
    label: "Validated Date",
    renderValue: (data) =>
      data?.validatedDate ? `${FormatDate(data?.validatedDate, "MM-DD-YYYY [at] hh:mm A")}` : "",
    field: "validatedDate",
  },
  {
    label: "Issues",
    renderValue: (data) =>
      (data?.errors?.length > 0 || data?.warnings?.length > 0) && (
        <QCResultsContext.Consumer>
          {({ submission, handleDeleteOrphanFile, handleOpenErrorDialog }) => (
            <Stack direction="row">
              <StyledIssuesTextWrapper>
                <span>
                  {data.errors?.length > 0 ? data.errors[0].title : data.warnings[0]?.title}.
                </span>{" "}
                <StyledErrorDetailsButton
                  onClick={() => handleOpenErrorDialog && handleOpenErrorDialog(data)}
                  variant="text"
                  disableRipple
                  disableTouchRipple
                  disableFocusRipple
                >
                  See details.
                </StyledErrorDetailsButton>
              </StyledIssuesTextWrapper>
              {submission?.fileErrors?.length > 0 &&
                submission.fileErrors.find(
                  (fileError) => fileError.submittedID === data.submittedID
                ) && (
                  <DeleteOrphanFileButton
                    submissionId={submission?._id}
                    submittedId={data?.submittedID}
                    onDeleteFile={handleDeleteOrphanFile}
                  />
                )}
            </Stack>
          )}
        </QCResultsContext.Consumer>
      ),
    sortDisabled: true,
    sx: {
      width: "38%",
    },
  },
];

// CSV columns used for exporting table data
export const csvColumns = {
  "Batch ID": (d: QCResult) => d.displayID,
  "Node Type": (d: QCResult) => d.type,
  "Submitted Identifier": (d: QCResult) => d.submittedID,
  Severity: (d: QCResult) => d.severity,
  "Validated Date": (d: QCResult) => FormatDate(d?.validatedDate, "MM-DD-YYYY [at] hh:mm A", ""),
  Issues: (d: QCResult) => {
    const value = d.errors[0].description ?? d.warnings[0]?.description;

    // NOTE: The ErrorMessage descriptions contain non-standard double quotes
    // that don't render correctly in Excel. This replaces them with standard double quotes.
    return value.replaceAll(/[“”‟〞＂]/g, `"`);
  },
};

type Props = {
  submission: Submission;
};

const QualityControl: FC<Props> = ({ submission }: Props) => {
  const { submissionId } = useParams();
  const { watch, control } = useForm<FilterForm>();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<QCResult[]>([]);
  const [prevData, setPrevData] = useState<FetchListing<QCResult>>(null);
  const [totalData, setTotalData] = useState(0);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<QCResult | null>(null);
  const tableRef = useRef<TableMethods>(null);

  const errorDescriptions =
    selectedRow?.errors?.map((error) => `(Error) ${error.description}`) ?? [];
  const warningDescriptions =
    selectedRow?.warnings?.map((warning) => `(Warning) ${warning.description}`) ?? [];
  const allDescriptions = [...errorDescriptions, ...warningDescriptions];

  const [submissionQCResults] = useLazyQuery<SubmissionQCResultsResp>(SUBMISSION_QC_RESULTS, {
    variables: { id: submissionId },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const { data: batchData } = useQuery<ListBatchesResp>(LIST_BATCHES, {
    variables: {
      submissionID: submissionId,
      first: -1,
      offset: 0,
      partial: true,
      orderBy: "displayID",
      sortDirection: "asc",
    },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const { data: nodeTypes } = useQuery<ListNodeTypesResp>(LIST_NODE_TYPES, {
    variables: { _id: submissionId },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleFetchQCResults = async (fetchListing: FetchListing<QCResult>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      enqueueSnackbar("Invalid submission ID provided.", { variant: "error" });
      return;
    }
    if (!force && data?.length > 0 && isEqual(fetchListing, prevData)) {
      return;
    }

    setPrevData(fetchListing);

    try {
      setLoading(true);

      const nodeType = watch("nodeType");
      const batchID = watch("batchID");
      const { data: d, error } = await submissionQCResults({
        variables: {
          submissionID: submissionId,
          first,
          offset,
          sortDirection,
          orderBy,
          nodeTypes: !nodeType || nodeType === "All" ? undefined : [watch("nodeType")],
          batchIDs: !batchID || batchID === "All" ? undefined : [watch("batchID")],
          severities: watch("severity") || "All",
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (error || !d?.submissionQCResults) {
        throw new Error("Unable to retrieve submission quality control results.");
      }
      setData(d.submissionQCResults.results);
      setTotalData(d.submissionQCResults.total);
    } catch (err) {
      enqueueSnackbar(err?.toString(), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrphanFile = (success: boolean) => {
    if (!success) {
      return;
    }
    tableRef.current?.refresh();
  };

  const handleOpenErrorDialog = (data: QCResult) => {
    setOpenErrorDialog(true);
    setSelectedRow(data);
  };

  const providerValue = useMemo(
    () => ({
      submission,
      handleDeleteOrphanFile,
      handleOpenErrorDialog,
    }),
    [submission, handleDeleteOrphanFile, handleOpenErrorDialog]
  );

  useEffect(() => {
    tableRef.current?.setPage(0, true);
  }, [watch("nodeType"), watch("batchID"), watch("severity")]);

  useEffect(() => {
    tableRef.current?.refresh();
  }, [submission?.metadataValidationStatus, submission?.fileValidationStatus]);

  return (
    <>
      <StyledFilterContainer>
        <StyledInlineLabel htmlFor="nodeType-filter">Node Type</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="nodeType"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                defaultValue="All"
                value={field.value || "All"}
                MenuProps={{ disablePortal: true }}
                inputProps={{ id: "nodeType-filter" }}
              >
                <MenuItem value="All">All</MenuItem>
                {nodeTypes?.listSubmissionNodeTypes?.map((nodeType) => (
                  <MenuItem key={nodeType} value={nodeType}>
                    {nodeType}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          />
        </StyledFormControl>
        <StyledInlineLabel htmlFor="batchID-filter">Batch ID</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="batchID"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                defaultValue="All"
                value={field.value || "All"}
                MenuProps={{ disablePortal: true }}
                inputProps={{ id: "batchID-filter" }}
              >
                <MenuItem value="All">All</MenuItem>
                {batchData?.listBatches?.batches?.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.displayID}
                    {` (${FormatDate(batch.createdAt, "MM/DD/YYYY")})`}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          />
        </StyledFormControl>
        <StyledInlineLabel htmlFor="severity-filter">Severity</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                defaultValue="All"
                value={field.value || "All"}
                MenuProps={{ disablePortal: true }}
                inputProps={{ id: "severity-filter" }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Error">Error</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
              </StyledSelect>
            )}
          />
        </StyledFormControl>
      </StyledFilterContainer>
      <QCResultsContext.Provider value={providerValue}>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={data || []}
          total={totalData || 0}
          loading={loading}
          defaultRowsPerPage={20}
          defaultOrder="desc"
          position="both"
          setItemKey={(item, idx) => `${idx}_${item.batchID}_${item.submittedID}`}
          onFetchData={handleFetchQCResults}
          AdditionalActions={
            <Stack direction="row" alignItems="center" gap="8px" marginRight="37px">
              <ExportValidationButton
                submission={submission}
                fields={csvColumns}
                disabled={totalData <= 0}
              />
              <DeleteAllOrphanFilesButton
                submissionId={submissionId}
                disabled={!submission?.fileErrors?.length}
              />
            </Stack>
          }
          containerProps={{ sx: { marginBottom: "8px" } }}
        />
      </QCResultsContext.Provider>
      <ErrorDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header={null}
        title={`Validation Issues for ${capitalizeFirstLetter(
          selectedRow?.type
        )} Node ID ${selectedRow?.submittedID}.`}
        errors={allDescriptions}
        errorCount={`${allDescriptions?.length || 0} ${
          allDescriptions?.length === 1 ? "ISSUE" : "ISSUES"
        }`}
      />
    </>
  );
};

export default QualityControl;
