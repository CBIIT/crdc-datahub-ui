import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { cloneDeep, isEqual } from "lodash";
import { Box, Button, FormControl, MenuItem, Stack, styled } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  LIST_BATCHES,
  ListBatchesInput,
  ListBatchesResp,
  SUBMISSION_QC_RESULTS,
  SUBMISSION_STATS,
  SubmissionQCResultsResp,
  SubmissionStatsInput,
  SubmissionStatsResp,
} from "../../graphql";
import GenericTable, { Column } from "../../components/GenericTable";
import { FormatDate, compareNodeStats, titleCase } from "../../utils";
import ErrorDetailsDialog from "../../components/ErrorDetailsDialog";
import QCResultsContext from "./Contexts/QCResultsContext";
import { ExportValidationButton } from "../../components/DataSubmissions/ExportValidationButton";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import { useSubmissionContext } from "../../components/Contexts/SubmissionContext";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";
import TruncatedText from "../../components/TruncatedText";

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
  display: "flex",
  alignItems: "center",
});

const StyledBreakAll = styled(Box)({
  wordBreak: "break-all",
});

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "21px",
  paddingLeft: "26px",
  paddingRight: "35px",
});

const StyledFormControl = styled(FormControl)({
  minWidth: "231px",
});

const StyledInlineLabel = styled("label")({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "19.6px",
  paddingRight: "10px",
});

const StyledIssuesTextWrapper = styled(Box)({
  whiteSpace: "nowrap",
  wordBreak: "break-word",
});

const StyledDateTooltip = styled(StyledTooltip)(() => ({
  cursor: "pointer",
}));

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  nodeType: false,
  batchID: false,
  severity: false,
};

const columns: Column<QCResult>[] = [
  {
    label: "Batch ID",
    renderValue: (data) => <StyledBreakAll>{data?.displayID}</StyledBreakAll>,
    field: "displayID",
    default: true,
    sx: {
      width: "122px",
    },
  },
  {
    label: "Node Type",
    renderValue: (data) => (
      <StyledNodeType>
        <TruncatedText text={data?.type} maxCharacters={15} disableInteractiveTooltip={false} />
      </StyledNodeType>
    ),
    field: "type",
  },
  {
    label: "Submitted Identifier",
    renderValue: (data) => (
      <TruncatedText
        text={data?.submittedID}
        maxCharacters={15}
        disableInteractiveTooltip={false}
      />
    ),
    field: "submittedID",
  },
  {
    label: "Severity",
    renderValue: (data) => (
      <StyledSeverity color={data?.severity === "Error" ? "#B54717" : "#8D5809"}>
        {data?.severity}
      </StyledSeverity>
    ),
    field: "severity",
    sx: {
      width: "148px",
    },
  },
  {
    label: "Validated Date",
    renderValue: (data) =>
      data.validatedDate ? (
        <StyledDateTooltip
          title={FormatDate(data.validatedDate, "M/D/YYYY h:mm A")}
          placement="top"
        >
          <span>{FormatDate(data.validatedDate, "M/D/YYYY")}</span>
        </StyledDateTooltip>
      ) : (
        ""
      ),
    field: "validatedDate",
    sx: {
      width: "193px",
    },
  },
  {
    label: "Issues",
    renderValue: (data) =>
      (data?.errors?.length > 0 || data?.warnings?.length > 0) && (
        <QCResultsContext.Consumer>
          {({ handleOpenErrorDialog }) => (
            <Stack direction="row">
              <StyledIssuesTextWrapper>
                <TruncatedText
                  text={`${data.errors?.[0]?.title || data.warnings?.[0]?.title}.`}
                  maxCharacters={15}
                  wrapperSx={{ display: "inline" }}
                  labelSx={{ display: "inline" }}
                  disableInteractiveTooltip={false}
                />{" "}
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
            </Stack>
          )}
        </QCResultsContext.Consumer>
      ),
    sortDisabled: true,
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
    const value = d.errors[0]?.description ?? d.warnings[0]?.description;

    // NOTE: The ErrorMessage descriptions contain non-standard double quotes
    // that don't render correctly in Excel. This replaces them with standard double quotes.
    return value.replaceAll(/[“”‟〞＂]/g, `"`);
  },
};

const QualityControl: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: submissionData } = useSubmissionContext();
  const { watch, control } = useForm<FilterForm>({
    defaultValues: {
      batchID: "All",
      nodeType: "All",
      severity: "All",
    },
  });
  const {
    _id: submissionId,
    metadataValidationStatus,
    fileValidationStatus,
  } = submissionData?.getSubmission || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<QCResult[]>([]);
  const [prevData, setPrevData] = useState<FetchListing<QCResult>>(null);
  const [totalData, setTotalData] = useState(0);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<QCResult | null>(null);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);
  const nodeTypeFilter = watch("nodeType");
  const batchIDFilter = watch("batchID");
  const severityFilter = watch("severity");
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

  const { data: batchData } = useQuery<ListBatchesResp<true>, ListBatchesInput>(LIST_BATCHES, {
    variables: {
      submissionID: submissionId,
      first: -1,
      offset: 0,
      partial: true,
      orderBy: "displayID",
      sortDirection: "asc",
    },
    context: { clientName: "backend" },
    skip: !submissionId,
    fetchPolicy: "cache-and-network",
  });

  const { data: submissionStats } = useQuery<SubmissionStatsResp, SubmissionStatsInput>(
    SUBMISSION_STATS,
    {
      variables: { id: submissionId },
      context: { clientName: "backend" },
      skip: !submissionId,
      fetchPolicy: "cache-and-network",
    }
  );

  const nodeTypes = useMemo<string[]>(
    () =>
      cloneDeep(submissionStats?.submissionStats?.stats)
        ?.filter((stat) => stat.error > 0 || stat.warning > 0)
        ?.sort(compareNodeStats)
        ?.map((stat) => stat.nodeName),
    [submissionStats?.submissionStats?.stats]
  );

  const handleFetchQCResults = async (fetchListing: FetchListing<QCResult>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
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
          orderBy,
          nodeTypes: !nodeTypeFilter || nodeTypeFilter === "All" ? undefined : [nodeTypeFilter],
          batchIDs: !batchIDFilter || batchIDFilter === "All" ? undefined : [batchIDFilter],
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

  const handleOpenErrorDialog = (data: QCResult) => {
    setOpenErrorDialog(true);
    setSelectedRow(data);
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  const Actions = useMemo<React.ReactNode>(
    () => (
      <Stack direction="row" alignItems="center" gap="8px" marginRight="37px">
        <ExportValidationButton
          submission={submissionData?.getSubmission}
          fields={csvColumns}
          disabled={totalData <= 0}
        />
      </Stack>
    ),
    [submissionData?.getSubmission, totalData]
  );

  const providerValue = useMemo(
    () => ({
      handleOpenErrorDialog,
    }),
    [handleOpenErrorDialog]
  );

  useEffect(() => {
    if (!touchedFilters.nodeType && !touchedFilters.batchID && !touchedFilters.severity) {
      return;
    }
    tableRef.current?.setPage(0, true);
  }, [nodeTypeFilter, batchIDFilter, severityFilter]);

  useEffect(() => {
    tableRef.current?.refresh();
  }, [metadataValidationStatus, fileValidationStatus]);

  return (
    <>
      <StyledFilterContainer>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <StyledInlineLabel htmlFor="batchID-filter">Batch ID</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="batchID"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                  MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                  inputProps={{ id: "batchID-filter" }}
                  data-testid="quality-control-batchID-filter"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("batchID");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {batchData?.listBatches?.batches?.map((batch) => (
                    <MenuItem key={batch._id} value={batch._id} data-testid={batch._id}>
                      {batch.displayID}
                      {` (${FormatDate(batch.createdAt, "MM/DD/YYYY")})`}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <StyledInlineLabel htmlFor="nodeType-filter">Node Type</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="nodeType"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                  MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                  inputProps={{ id: "nodeType-filter" }}
                  data-testid="quality-control-nodeType-filter"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("nodeType");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {nodeTypes?.map((nodeType) => (
                    <MenuItem key={nodeType} value={nodeType} data-testid={`nodeType-${nodeType}`}>
                      {nodeType.toLowerCase()}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <StyledInlineLabel htmlFor="severity-filter">Severity</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                  MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                  inputProps={{ id: "severity-filter" }}
                  data-testid="quality-control-severity-filter"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("severity");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Error">Error</MenuItem>
                  <MenuItem value="Warning">Warning</MenuItem>
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </Stack>
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
          noContentText="No validation issues found. Either no validation has been conducted yet, or all issues have been resolved."
          setItemKey={(item, idx) => `${idx}_${item.batchID}_${item.submittedID}`}
          onFetchData={handleFetchQCResults}
          AdditionalActions={Actions}
          containerProps={{ sx: { marginBottom: "8px" } }}
        />
      </QCResultsContext.Provider>
      <ErrorDetailsDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header={null}
        title="Validation Issues"
        nodeInfo={`For ${titleCase(selectedRow?.type)}${
          selectedRow?.type?.toLocaleLowerCase() !== "data file" ? " Node" : ""
        } ID ${selectedRow?.submittedID}`}
        errors={allDescriptions}
        errorCount={`${allDescriptions?.length || 0} ${
          allDescriptions?.length === 1 ? "ISSUE" : "ISSUES"
        }`}
      />
    </>
  );
};

export default React.memo(QualityControl);
