import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  IconButton,
  Stack,
  Tabs,
  Typography,
  styled,
} from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar, VariantType } from "notistack";
import bannerPng from "../../assets/dataSubmissions/dashboard_banner.png";
import summaryBannerSvg from "../../assets/dataSubmissions/summary_banner.png";
import LinkTab from "../../components/DataSubmissions/LinkTab";
import MetadataUpload from "../../components/DataSubmissions/MetadataUpload";
import {
  LIST_BATCHES,
  SUBMISSION_ACTION,
  ListBatchesResp,
  SubmissionActionResp,
} from "../../graphql";
import DataSubmissionSummary from "../../components/DataSubmissions/DataSubmissionSummary";
import { FormatDate } from "../../utils";
import DataSubmissionActions from "./DataSubmissionActions";
import QualityControl from "./QualityControl";
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon_2.svg";
import ErrorDialog from "./ErrorDialog";
import BatchTableContext from "./Contexts/BatchTableContext";
import ValidationStatistics from "../../components/DataSubmissions/ValidationStatistics";
import ValidationControls from "../../components/DataSubmissions/ValidationControls";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import FileListDialog from "./FileListDialog";
import {
  ReleaseInfo,
  shouldDisableRelease,
  shouldDisableSubmit,
} from "../../utils/dataSubmissionUtils";
import usePageTitle from "../../hooks/usePageTitle";
import BackButton from "../../components/DataSubmissions/BackButton";
import SubmittedData from "./SubmittedData";
import { UserGuide } from "../../components/DataSubmissions/UserGuide";
import GenericTable, { Column } from "../../components/GenericTable";
import { DataUpload } from "../../components/DataSubmissions/DataUpload";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import { useSubmissionContext } from "../../components/Contexts/SubmissionContext";

const StyledBanner = styled("div")(({ bannerSrc }: { bannerSrc: string }) => ({
  background: `url(${bannerSrc})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top",
  width: "100%",
  height: "295px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  zIndex: 0,
}));

const StyledBannerContentContainer = styled(Container)(({ padding }: { padding?: string }) => ({
  "&.MuiContainer-root": {
    padding: padding || "58px 73px 75px",
    marginTop: "-295px",
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
  },
}));

const StyledCard = styled(Card)(() => ({
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  padding: 0,
  // boxShadow: "0px -5px 35px 0px rgba(53, 96, 160, 0.30)",
  "& .MuiCardContent-root": {
    padding: 0,
  },
  "& .MuiCardActions-root": {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    position: "relative",
  },
  "&.MuiPaper-root": {
    border: "1px solid #6CACDA",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    overflow: "visible",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    zIndex: 1,
    bottom: "50px",
    left: 0,
    pointerEvents: "none",
    backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(251,253,255, 1) 20%)",
    width: "100%",
    height: "260px",
  },
}));

const StyledMainContentArea = styled("div")(() => ({
  position: "relative",
  zIndex: 2,
  borderRadius: 0,
  padding: "21px 40px 0",
}));

const StyledCardActions = styled(CardActions)(() => ({
  "&.MuiCardActions-root": {
    paddingTop: "32px",
  },
}));

const StyledTabs = styled(Tabs)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  zIndex: 3,
  "& .MuiTabs-flexContainer": {
    justifyContent: "center",
  },
  "& .MuiTabs-indicator": {
    display: "none !important",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottom: "1.25px solid #6CACDA",
    zIndex: 1,
  },
}));

const StyledAlert = styled(Alert)({
  fontWeight: 400,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  scrollMarginTop: "64px",
});

const StyledWrapper = styled("div")({
  background: "#FBFDFF",
});

const StyledCardContent = styled(CardContent)({
  background: `url(${summaryBannerSvg})`,
  backgroundSize: "auto",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top",
});

const StyledRejectedStatus = styled("div")(() => ({
  color: "#B54717",
  fontWeight: 600,
}));

const StyledCopyWrapper = styled(Stack)(() => ({
  height: "42px",
  width: "fit-content",
  minWidth: "342px",
  padding: "11px 20px",
  borderRadius: "8px 8px 0px 0px",
  borderTop: "1.25px solid #6DADDB",
  borderRight: "1.25px solid #6DADDB",
  borderLeft: "1.25px solid #6DADDB",
  background: "#EAF5F8",
}));

const StyledCopyLabel = styled(Typography)(() => ({
  color: "#125868",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: 800,
  lineHeight: "19.6px",
  letterSpacing: "0.24px",
  textTransform: "uppercase",
}));

const StyledCopyValue = styled(Typography)(() => ({
  color: "#125868",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  letterSpacing: "0.32px",
}));

const StyledCopyIDButton = styled(IconButton)(() => ({
  color: "#000000",
  padding: 0,
  "&.MuiIconButton-root.Mui-disabled": {
    color: "#B0B0B0",
  },
}));

const StyledErrorDetailsButton = styled(Button)(() => ({
  color: "#0B6CB1",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  textDecorationLine: "underline",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
  "&:hover": {
    background: "transparent",
    textDecorationLine: "underline",
  },
}));

const StyledFileCountButton = styled(Button)(() => ({
  color: "#0B6CB1",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  textDecorationLine: "underline",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
  "&:hover": {
    background: "transparent",
    textDecorationLine: "underline",
  },
}));

const StyledFlowContainer = styled(Box)({
  padding: "27px 59px 59px 60px",
});

const columns: Column<Batch>[] = [
  {
    label: "Batch ID",
    renderValue: (data) => data.displayID,
    field: "displayID",
  },
  {
    label: "Upload Type",
    renderValue: (data) => (data?.type !== "metadata" ? "-" : data?.metadataIntention),
    field: "metadataIntention",
  },
  {
    label: "Batch Type",
    renderValue: (data) => <Box textTransform="capitalize">{data?.type}</Box>,
    field: "type",
  },
  {
    label: "File Count",
    renderValue: (data) => (
      <BatchTableContext.Consumer>
        {({ handleOpenFileListDialog }) => (
          <StyledFileCountButton
            onClick={() => handleOpenFileListDialog && handleOpenFileListDialog(data)}
            variant="text"
            disableRipple
            disableTouchRipple
            disableFocusRipple
          >
            {Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(data?.fileCount || 0)}
          </StyledFileCountButton>
        )}
      </BatchTableContext.Consumer>
    ),
    field: "fileCount",
  },
  {
    label: "Status",
    renderValue: (data) => (
      <Box textTransform="capitalize">
        {data.status === "Failed" ? (
          <StyledRejectedStatus>{data.status}</StyledRejectedStatus>
        ) : (
          data.status
        )}
      </Box>
    ),
    field: "status",
  },
  {
    label: "Uploaded Date",
    renderValue: (data) =>
      data?.createdAt ? `${FormatDate(data.createdAt, "MM-DD-YYYY [at] hh:mm A")}` : "",
    field: "createdAt",
    default: true,
    sx: {
      minWidth: "240px",
    },
  },
  {
    label: "Upload Errors",
    renderValue: (data) => (
      <BatchTableContext.Consumer>
        {({ handleOpenErrorDialog }) => {
          if (!data?.errors?.length) {
            return null;
          }

          return (
            <StyledErrorDetailsButton
              onClick={() => handleOpenErrorDialog && handleOpenErrorDialog(data)}
              variant="text"
              disableRipple
              disableTouchRipple
              disableFocusRipple
            >
              {data.errors?.length > 0
                ? `${data.errors.length} ${data.errors.length === 1 ? "Error" : "Errors"}`
                : ""}
            </StyledErrorDetailsButton>
          );
        }}
      </BatchTableContext.Consumer>
    ),
    field: "errors",
    sortDisabled: true,
  },
];

const URLTabs = {
  DATA_ACTIVITY: "data-activity",
  VALIDATION_RESULTS: "validation-results",
  SUBMITTED_DATA: "submitted-data",
};

const submissionLockedStatuses: SubmissionStatus[] = [
  "Submitted",
  "Released",
  "Completed",
  "Canceled",
  "Archived",
];

type Props = {
  submissionId: string;
  tab: string;
};

const DataSubmission: FC<Props> = ({ submissionId, tab = URLTabs.DATA_ACTIVITY }) => {
  usePageTitle(`Data Submission ${submissionId || ""}`);

  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { lastSearchParams } = useSearchParamsContext();
  const { data, error: submissionError, refetch: getSubmission } = useSubmissionContext();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [hasUploadingBatches, setHasUploadingBatches] = useState<boolean>(false);
  const [prevBatchFetch, setPrevBatchFetch] = useState<FetchListing<Batch>>(null);
  const [error, setError] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [openFileListDialog, setOpenFileListDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Batch | null>(null);
  const [startBatchPolling, setStartBatchPolling] = useState<
    ((pollInterval: number) => void) | null
  >(null);
  const [stopBatchPolling, setStopBatchPolling] = useState<(() => void) | null>(null);
  const dataSubmissionListPageUrl = `/data-submissions${
    lastSearchParams?.["/data-submissions"] ?? ""
  }`;

  const tableRef = useRef<TableMethods>(null);
  const isValidTab = tab && Object.values(URLTabs).includes(tab);

  const submitInfo: { disable: boolean; isAdminOverride: boolean } = useMemo(() => {
    const canSubmitRoles: User["role"][] = [
      "Submitter",
      "Organization Owner",
      "Data Curator",
      "Admin",
    ];
    if (!data?.getSubmission?._id || !canSubmitRoles.includes(user?.role) || hasUploadingBatches) {
      return { disable: true, isAdminOverride: false };
    }

    return shouldDisableSubmit(data.getSubmission, user?.role);
  }, [data?.getSubmission, user, hasUploadingBatches]);
  const releaseInfo: ReleaseInfo = useMemo(
    () => shouldDisableRelease(data?.getSubmission),
    [data?.getSubmission?.crossSubmissionStatus, data?.getSubmission?.otherSubmissions]
  );

  const onRetrievebatches = (data: ListBatchesResp) => {
    setBatches(data.listBatches.batches);
    setTotalBatches(data.listBatches.total);
    setHasUploadingBatches(data.fullStatusList.batches.some((b) => b.status === "Uploading"));
  };

  const [listBatches] = useLazyQuery<ListBatchesResp>(LIST_BATCHES, {
    notifyOnNetworkStatusChange: true,
    onCompleted: onRetrievebatches,
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [submissionAction] = useMutation<SubmissionActionResp>(SUBMISSION_ACTION, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleFetchBatches = async (fetchListing: FetchListing<Batch>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      setError("Invalid submission ID provided.");
      return;
    }
    if (!force && batches?.length > 0 && isEqual(fetchListing, prevBatchFetch)) {
      return;
    }

    setPrevBatchFetch(fetchListing);

    try {
      setLoading(true);
      const {
        data: newBatchFiles,
        error: batchFilesError,
        startPolling,
        stopPolling,
      } = await listBatches({
        variables: {
          submissionID: submissionId,
          first,
          offset,
          sortDirection,
          orderBy,
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (batchFilesError || !newBatchFiles?.listBatches) {
        setError("Unable to retrieve batch data.");
        return;
      }

      const hasUploading = newBatchFiles.fullStatusList?.batches?.some(
        (b) => b.status === "Uploading"
      );

      if (hasUploading) {
        setStartBatchPolling(() => startPolling);
        setStopBatchPolling(() => stopPolling);
      }

      // See onRetrievebatches for state updates
    } catch (err) {
      setError("Unable to retrieve batch data.");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionAction = async (action: SubmissionAction, reviewComment?: string) => {
    if (!submissionId) {
      return;
    }

    try {
      const { data: d, errors } = await submissionAction({
        variables: {
          submissionID: submissionId,
          action,
          comment: reviewComment,
        },
      });
      if (errors || !d?.submissionAction?._id) {
        throw new Error(`Error occurred while performing '${action}' submission action.`);
      }
      await getSubmission();
    } catch (err) {
      setError(err?.toString());
    }
  };

  const refreshBatchTable = () => {
    tableRef.current?.refresh();
  };

  const handleOnUpload = async (message: string, variant: VariantType) => {
    refreshBatchTable();
    enqueueSnackbar(message, { variant });

    const refreshStatuses: SubmissionStatus[] = ["New", "Withdrawn", "Rejected", "In Progress"];
    if (refreshStatuses.includes(data?.getSubmission?.status)) {
      await getSubmission();
    }
  };

  const handleCopyID = () => {
    if (!submissionId) {
      return;
    }
    navigator.clipboard.writeText(submissionId);
  };

  const handleOpenErrorDialog = (data: Batch) => {
    setOpenErrorDialog(true);
    setSelectedRow(data);
  };

  const handleOpenFileListDialog = (data: Batch) => {
    setOpenFileListDialog(true);
    setSelectedRow(data);
  };

  const providerValue = useMemo(
    () => ({
      handleOpenErrorDialog,
      handleOpenFileListDialog,
    }),
    [handleOpenErrorDialog]
  );

  useEffect(() => {
    if (!submissionId) {
      setError("Invalid submission ID provided.");
    } else if (submissionError) {
      setError("Unable to retrieve submission data.");
    }
  }, [submissionError]);

  useEffect(() => {
    if (!hasUploadingBatches && stopBatchPolling) {
      stopBatchPolling();
      getSubmission();

      setStartBatchPolling(null);
      setStopBatchPolling(null);
      return;
    }
    if (hasUploadingBatches && startBatchPolling) {
      startBatchPolling(1000);
    }
  }, [hasUploadingBatches, stopBatchPolling, startBatchPolling]);

  return (
    <StyledWrapper>
      <StyledBanner bannerSrc={bannerPng} />
      <StyledBannerContentContainer maxWidth="xl">
        <StyledCopyWrapper direction="row" spacing={1.625} alignItems="center">
          <StyledCopyLabel id="data-submission-id-label" variant="body1">
            SUBMISSION ID:
          </StyledCopyLabel>
          <StyledCopyValue id="data-submission-id-value" variant="body1">
            {submissionId}
          </StyledCopyValue>
          {submissionId && (
            <StyledCopyIDButton
              id="data-submission-copy-id-button"
              onClick={handleCopyID}
              aria-label="Copy ID"
            >
              <CopyIconSvg />
            </StyledCopyIDButton>
          )}
        </StyledCopyWrapper>
        <StyledCard>
          <StyledCardContent>
            {error && <StyledAlert severity="error">Oops! An error occurred. {error}</StyledAlert>}
            <DataSubmissionSummary dataSubmission={data?.getSubmission} />
            <ValidationStatistics
              dataSubmission={data?.getSubmission}
              statistics={data?.submissionStats?.stats}
            />
            <StyledFlowContainer>
              <UserGuide />
              <MetadataUpload
                submission={data?.getSubmission}
                readOnly={submissionLockedStatuses.includes(data?.getSubmission?.status)}
                onCreateBatch={refreshBatchTable}
                onUpload={handleOnUpload}
              />
              <DataUpload submission={data?.getSubmission} />
              <ValidationControls />
            </StyledFlowContainer>
            <StyledTabs value={isValidTab ? tab : URLTabs.DATA_ACTIVITY}>
              <LinkTab
                value={URLTabs.DATA_ACTIVITY}
                label="Data Activity"
                to={`/data-submission/${submissionId}/${URLTabs.DATA_ACTIVITY}`}
                selected={tab === URLTabs.DATA_ACTIVITY}
              />
              <LinkTab
                value={URLTabs.VALIDATION_RESULTS}
                label="Validation Results"
                to={`/data-submission/${submissionId}/${URLTabs.VALIDATION_RESULTS}`}
                selected={tab === URLTabs.VALIDATION_RESULTS}
              />
              <LinkTab
                value={URLTabs.SUBMITTED_DATA}
                label="Submitted Data"
                to={`/data-submission/${submissionId}/${URLTabs.SUBMITTED_DATA}`}
                selected={tab === URLTabs.SUBMITTED_DATA}
              />
            </StyledTabs>

            <StyledMainContentArea>
              {/* Primary Tab Content */}
              {tab === URLTabs.DATA_ACTIVITY && (
                <BatchTableContext.Provider value={providerValue}>
                  <GenericTable
                    ref={tableRef}
                    columns={columns}
                    data={batches || []}
                    total={totalBatches || 0}
                    loading={loading}
                    defaultRowsPerPage={20}
                    onFetchData={handleFetchBatches}
                    containerProps={{ sx: { marginBottom: "8px" } }}
                  />
                </BatchTableContext.Provider>
              )}
              {tab === URLTabs.VALIDATION_RESULTS && (
                <QualityControl
                  submission={data?.getSubmission}
                  refreshSubmission={getSubmission}
                />
              )}
              {tab === URLTabs.SUBMITTED_DATA && (
                <SubmittedData
                  submissionId={submissionId}
                  submissionName={data?.getSubmission?.name}
                />
              )}

              {/* Return to Data Submission List Button */}
              <BackButton
                navigateTo={dataSubmissionListPageUrl}
                text="Back to Data Submissions List"
              />
            </StyledMainContentArea>
          </StyledCardContent>
          <StyledCardActions>
            <DataSubmissionActions
              submission={data?.getSubmission}
              onAction={updateSubmissionAction}
              submitActionButton={{
                disable: submitInfo?.disable,
                label: submitInfo?.isAdminOverride ? "Admin Submit" : "Submit",
              }}
              releaseActionButton={releaseInfo}
              onError={(message: string) => enqueueSnackbar(message, { variant: "error" })}
            />
          </StyledCardActions>
        </StyledCard>
      </StyledBannerContentContainer>
      <ErrorDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header="Data Submission"
        title={`Batch ${selectedRow?.displayID || ""} Upload Errors`}
        errors={selectedRow?.errors}
        uploadedDate={data?.getSubmission?.createdAt}
      />
      <FileListDialog
        open={openFileListDialog}
        batch={selectedRow}
        onClose={() => setOpenFileListDialog(false)}
      />
    </StyledWrapper>
  );
};

export default DataSubmission;
