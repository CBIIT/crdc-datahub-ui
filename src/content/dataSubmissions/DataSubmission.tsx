import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Alert,
  AlertColor,
  Box,
  Card,
  CardActions,
  CardActionsProps,
  CardContent,
  Container,
  Stack,
  Tabs,
  styled,
} from "@mui/material";
import { isEqual } from "lodash";
import bannerSvg from "../../assets/dataSubmissions/dashboard_banner.svg";
import summaryBannerSvg from "../../assets/dataSubmissions/summary_banner.png";
import LinkTab from "../../components/DataSubmissions/LinkTab";
import DataSubmissionUpload from "../../components/DataSubmissions/DataSubmissionUpload";
import {
  GET_SUBMISSION,
  LIST_BATCHES,
  SUBMISSION_ACTION,
  GetSubmissionResp,
  ListBatchesResp,
  SubmissionActionResp,
} from "../../graphql";
import DataSubmissionSummary from "../../components/DataSubmissions/DataSubmissionSummary";
import GenericAlert, { AlertState } from "../../components/GenericAlert";
import GenericTable, { Column, FetchListing, TableMethods } from "../../components/DataSubmissions/GenericTable";
import { FormatDate } from "../../utils";
import DataSubmissionActions from "./DataSubmissionActions";
import QualityControl from "./QualityControl";

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
  zIndex: 0
}));

const StyledBannerContentContainer = styled(Container)(
  ({ padding }: { padding?: string }) => ({
    "&.MuiContainer-root": {
      padding: padding || "61px 73px 186px",
      marginTop: "-295px",
      width: "100%",
      height: "100%",
      position: "relative",
      zIndex: 1
    },
  })
);

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
    backgroundColor: "#FFFFFF",
    paddingTop: "34px",
    paddingBottom: "41px",
    position: "relative"
  },
  "&.MuiPaper-root": {
    border: "1px solid #6CACDA"
  },
  "&::after": {
    content: '""',
    position: "absolute",
    zIndex: 1,
    bottom: 48,
    left: 0,
    pointerEvents: "none",
    backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(251,253,255, 1) 20%)",
    width: "100%",
    height: "218px",
  },
}));

const StyledMainContentArea = styled("div")(() => ({
  borderRadius: 0,
  background: "#FFFFFF",
  minHeight: "300px",
  padding: "21px 40px 0",
}));

const StyledCardActions = styled(CardActions, {
  shouldForwardProp: (prop) => prop !== "isVisible"
})<CardActionsProps & { isVisible: boolean; }>(({ isVisible }) => ({
  visibility: isVisible ? "visible" : "hidden"
}));

const StyledTabs = styled(Tabs)(() => ({
  position: 'relative',
  "& .MuiTabs-flexContainer": {
    justifyContent: "center"
  },
  "& .MuiTabs-indicator": {
    display: "none !important"
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottom: '1.25px solid #6CACDA',
    zIndex: 1,
  },
}));

const StyledAlert = styled(Alert)({
  fontWeight: 400,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  scrollMarginTop: "64px"
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
  color: "#E25C22",
  fontWeight: 600
}));

const columns: Column<Batch>[] = [
  {
    label: "Upload Type",
    value: (data) => data?.metadataIntention,
    field: "metadataIntention",
  },
  {
    label: "Batch Type",
    value: (data) => <Box textTransform="capitalize">{data?.type}</Box>,
    field: "type",
  },
  {
    label: "File Count",
    value: (data) => Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(data?.fileCount || 0),
    field: "fileCount",
  },
  {
    label: "Status",
    value: (data) => (data.status === "Rejected" ? <StyledRejectedStatus>{data.status}</StyledRejectedStatus> : data.status),
    field: "status",
  },
  {
    label: "Uploaded Date",
    value: (data) => (data?.createdAt ? `${FormatDate(data.createdAt, "MM-DD-YYYY [at] hh:mm A")}` : ""),
    field: "createdAt",
    default: true,
    minWidth: "240px"
  },
  /* TODO: Error Count removed for MVP2-M2. Will be re-added in the future */
];

const URLTabs = {
  DATA_UPLOAD: "data-upload",
  QUALITY_CONTROL: "quality-control"
};

const submissionLockedStatuses: SubmissionStatus[] = ["Submitted", "Released", "Completed", "Canceled", "Archived"];

const DataSubmission = () => {
  const { submissionId, tab } = useParams();

  const [dataSubmission, setDataSubmission] = useState<Submission>(null);
  const [batchFiles, setBatchFiles] = useState<Batch[]>([]);
  const [totalBatchFiles, setTotalBatchFiles] = useState<number>(0);
  const [prevBatchFetch, setPrevBatchFetch] = useState<FetchListing<Batch>>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [changesAlert, setChangesAlert] = useState<AlertState>(null);
  const tableRef = useRef<TableMethods>(null);
  const isValidTab = tab && Object.values(URLTabs).includes(tab);

  const [getSubmission] = useLazyQuery<GetSubmissionResp>(GET_SUBMISSION, {
    variables: { id: submissionId },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [listBatches] = useLazyQuery<ListBatchesResp>(LIST_BATCHES, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [submissionAction] = useMutation<SubmissionActionResp>(SUBMISSION_ACTION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleFetchBatchFiles = async (fetchListing: FetchListing<Batch>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      setError("Invalid submission ID provided.");
      return;
    }
    if (!force && batchFiles?.length > 0 && isEqual(fetchListing, prevBatchFetch)) {
      return;
    }

    setPrevBatchFetch(fetchListing);

    try {
      setLoading(true);
      const { data: newBatchFiles, error: batchFilesError } = await listBatches({
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
      if (batchFilesError || !newBatchFiles?.listBatches) {
        setError("Unable to retrieve batch data.");
        return;
      }
      setBatchFiles(newBatchFiles.listBatches.batches);
      setTotalBatchFiles(newBatchFiles.listBatches.total);
    } catch (err) {
      setError("Unable to retrieve batch data.");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionAction = async (action: SubmissionAction) => {
    if (!submissionId) {
      return;
    }

    try {
      const { data: d, errors } = await submissionAction({
        variables: {
          submissionID: submissionId,
          action
        }
      });
      if (errors || !d?.submissionAction?._id) {
        throw new Error(`Error occurred while performing '${action}' submission action.`);
        return;
      }
      setDataSubmission((prevSubmission) => ({ ...prevSubmission, ...d.submissionAction }));
    } catch (err) {
      setError(err?.toString());
    }
  };

  const getDataSubmission = async () => {
    try {
      const { data: newDataSubmission, error } = await getSubmission();
      if (error || !newDataSubmission?.getSubmission) {
        throw new Error("Unable to retrieve Data Submission.");
        return;
      }
      setDataSubmission(newDataSubmission.getSubmission);
    } catch (err) {
      setError(err?.toString());
    }
  };

  useEffect(() => {
    if (!submissionId) {
      setError("Invalid submission ID provided.");
      return;
    }
    (async () => {
      if (!dataSubmission?._id) {
        await getDataSubmission();
      }
    })();
  }, [submissionId]);

  const refreshBatchTable = () => {
    tableRef.current?.refresh();
  };

  const handleOnUpload = async (message: string, severity: AlertColor) => {
    refreshBatchTable();
    setChangesAlert({ message, severity });
    setTimeout(() => setChangesAlert(null), 10000);

    const preInProgressStatuses: SubmissionStatus[] = ["New", "Withdrawn", "Rejected"];
    // createBatch will update the status to 'In Progress'
    if (preInProgressStatuses.includes(dataSubmission?.status)) {
      await getDataSubmission();
    }
  };

  return (
    <StyledWrapper>
      <GenericAlert open={!!changesAlert} severity={changesAlert?.severity} key="data-submission-alert">
        <span>
          {changesAlert?.message}
        </span>
      </GenericAlert>
      <StyledBanner bannerSrc={bannerSvg} />
      <StyledBannerContentContainer maxWidth="xl">
        <StyledCard>
          <StyledCardContent>
            {error && (
              <StyledAlert severity="error">
                Oops! An error occurred.
                {" "}
                {error}
              </StyledAlert>
            )}
            <DataSubmissionSummary dataSubmission={dataSubmission} />

            {/* TODO: Widgets removed for MVP2-M2. Will be re-added in the future */}

            <StyledTabs value={isValidTab ? tab : URLTabs.DATA_UPLOAD}>
              <LinkTab
                value={URLTabs.DATA_UPLOAD}
                label="Data Upload"
                to={`/data-submission/${submissionId}/${URLTabs.DATA_UPLOAD}`}
                selected={tab === URLTabs.DATA_UPLOAD}
              />
              <LinkTab
                value={URLTabs.QUALITY_CONTROL}
                label="Quality Control"
                to={`/data-submission/${submissionId}/${URLTabs.QUALITY_CONTROL}`}
                selected={tab === URLTabs.QUALITY_CONTROL}
              />
            </StyledTabs>

            <StyledMainContentArea>
              {tab === URLTabs.DATA_UPLOAD ? (
                <Stack direction="column" justifyContent="center">
                  <DataSubmissionUpload
                    submitterID={dataSubmission?.submitterID}
                    readOnly={submissionLockedStatuses.includes(dataSubmission?.status)}
                    onUpload={handleOnUpload}
                  />
                  <GenericTable
                    ref={tableRef}
                    columns={columns}
                    data={batchFiles || []}
                    total={totalBatchFiles || 0}
                    loading={loading}
                    onFetchData={handleFetchBatchFiles}
                  />
                </Stack>
              ) : <QualityControl submitterID={dataSubmission?.submitterID} />}
            </StyledMainContentArea>
          </StyledCardContent>
          <StyledCardActions isVisible={tab === URLTabs.DATA_UPLOAD}>
            <DataSubmissionActions
              submission={dataSubmission}
              onAction={updateSubmissionAction}
            />
          </StyledCardActions>
        </StyledCard>
      </StyledBannerContentContainer>
    </StyledWrapper>
  );
};

export default DataSubmission;
