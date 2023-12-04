import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Card,
  CardActions,
  CardActionsProps,
  CardContent,
  Container,
  IconButton,
  Stack,
  Tabs,
  Typography,
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
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon_2.svg";
import ErrorDialog from "./ErrorDialog";
import BatchTableContext from "./Contexts/BatchTableContext";

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
      padding: padding || "58px 73px 186px",
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
    border: "1px solid #6CACDA",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
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
    color: "#B0B0B0"
  }
}));

const StyledErrorDetailsButton = styled(Button)(() => ({
  color: "#0D78C5",
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

const testData: ErrorMessage[][] = [
  [
    {
      title: "Incorrect control vocabulary.",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget duis at tellus at urna condimentum mattis. Eget nunc scelerisque viverra mauris in aliquam sem.",
    },
    {
      title: "Missing required field.",
      description: "Elit eget gravida cum sociis natoque. Risus quis varius quam quisque id diam vel quam. Senectus et netus et malesuada fames ac turpis egestas. Scelerisque eu ultrices vitae auctor eu augue ut.",
    },
    {
      title: "Value not in the range.",
      description: "Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Nec ullamcorper sit amet risus. Faucibus in ornare quam viverra orci sagittis. Venenatis urna cursus eget nunc.",
    },
  ],
  [
    {
      title: "Missing required field.",
      description: "Elit eget gravida cum sociis natoque. Risus quis varius quam quisque id diam vel quam. Senectus et netus et malesuada fames ac turpis egestas. Scelerisque eu ultrices vitae auctor eu augue ut.",
    },
  ],
  [
    {
      title: "Value not in the range.",
      description: "Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Nec ullamcorper sit amet risus. Faucibus in ornare quam viverra orci sagittis. Venenatis urna cursus eget nunc.",
    },
    {
      title: "Incorrect control vocabulary.",
      description: "Elit eget gravida cum sociis natoque. Risus quis varius quam quisque id diam vel quam. Senectus et netus et malesuada fames ac turpis egestas. Scelerisque eu ultrices vitae auctor eu augue ut.",
    },
  ]
];

const columns: Column<Batch>[] = [
  {
    label: "Upload Type",
    renderValue: (data) => data?.metadataIntention,
    field: "metadataIntention",
  },
  {
    label: "Batch Type",
    renderValue: (data) => <Box textTransform="capitalize">{data?.type}</Box>,
    field: "type",
  },
  {
    label: "File Count",
    renderValue: (data) => Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(data?.fileCount || 0),
    field: "fileCount",
  },
  {
    label: "Status",
    renderValue: (data) => (data.status === "Rejected" ? <StyledRejectedStatus>{data.status}</StyledRejectedStatus> : data.status),
    field: "status",
  },
  {
    label: "Uploaded Date",
    renderValue: (data) => (data?.createdAt ? `${FormatDate(data.createdAt, "MM-DD-YYYY [at] hh:mm A")}` : ""),
    field: "createdAt",
    default: true,
    minWidth: "240px"
  },
  {
    label: "Error Count",
    renderValue: (data) => data?.errors?.length > 0 && (
      <BatchTableContext.Consumer>
        {({ handleOpenErrorDialog }) => (
          <StyledErrorDetailsButton
            onClick={() => handleOpenErrorDialog && handleOpenErrorDialog(data?._id)}
            variant="text"
            disableRipple
            disableTouchRipple
            disableFocusRipple
          >
            {data.errors?.length > 0 ? `${data.errors.length} ${data.errors.length === 1 ? "Error" : "Errors"}` : ""}
          </StyledErrorDetailsButton>
        )}
      </BatchTableContext.Consumer>
    ),
    field: "errors",
  },
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
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string>(null);
  const tableRef = useRef<TableMethods>(null);
  const isValidTab = tab && Object.values(URLTabs).includes(tab);
  const selectedData = batchFiles?.find((item) => item._id === selectedRow);

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
      /* TODO: REMOVE - TESTING PURPOSES ONLY */
      const dummyBatches: Batch[] = newBatchFiles.listBatches.batches.map((batch, idx) => (testData[idx] ? ({ ...batch, status: "Upload Failed", errors: testData[idx] }) : { ...batch, status: "Uploaded" }));
      /* =============== */
      setBatchFiles(dummyBatches);
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

  const handleCopyID = () => {
    if (!submissionId) {
      return;
    }
    navigator.clipboard.writeText(submissionId);
  };

  const handleOpenErrorDialog = (id: string) => {
    setOpenErrorDialog(true);
    setSelectedRow(id);
  };

  const providerValue = useMemo(() => ({
    handleOpenErrorDialog
  }), [handleOpenErrorDialog]);

  return (
    <StyledWrapper>
      <GenericAlert open={!!changesAlert} severity={changesAlert?.severity} key="data-submission-alert">
        <span>
          {changesAlert?.message}
        </span>
      </GenericAlert>
      <StyledBanner bannerSrc={bannerSvg} />
      <StyledBannerContentContainer maxWidth="xl">
        <StyledCopyWrapper direction="row" spacing={1.625} alignItems="center">
          <StyledCopyLabel id="data-submission-id-label" variant="body1">SUBMISSION ID:</StyledCopyLabel>
          <StyledCopyValue id="data-submission-id-value" variant="body1">{submissionId}</StyledCopyValue>
          {submissionId && (
            <StyledCopyIDButton id="data-submission-copy-id-button" onClick={handleCopyID}>
              <CopyIconSvg />
            </StyledCopyIDButton>
          )}
        </StyledCopyWrapper>
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
                <BatchTableContext.Provider value={providerValue}>
                  <>
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
                  </>
                </BatchTableContext.Provider>
              ) : <QualityControl />}
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
      <ErrorDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header="Data Submission"
        title="Error Count"
        errors={selectedData?.errors}
        uploadedDate={dataSubmission?.createdAt}
      />
    </StyledWrapper>
  );
};

export default DataSubmission;
