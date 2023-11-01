import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
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
import LinkTab from "../../components/DataSubmissions/LinkTab";
import DataSubmissionUpload from "../../components/DataSubmissions/DataSubmissionUpload";
import { GET_SUBMISSION, GetSubmissionResp, LIST_BATCHES, ListBatchesResp } from "../../graphql";
import DataSubmissionSummary from "../../components/DataSubmissions/DataSubmissionSummary";
import GenericAlert from "../../components/GenericAlert";
import PieChart from "../../components/DataSubmissions/PieChart";
import DataSubmissionBatchTable, { Column, FetchListing, TableMethods } from "../../components/DataSubmissions/DataSubmissionBatchTable";
import { FormatDate } from "../../utils";
import DataSubmissionActions from "./DataSubmissionActions";
import QualityControl from "./QualityControl";

const dummyChartData = [
  { label: 'Group A', value: 12, color: "#DFC798" },
  { label: 'Group B', value: 28, color: "#137E87" },
  { label: 'Group C', value: 30, color: "#99A4E4" },
  { label: 'Group D', value: 30, color: "#CB2809" },
];

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

const StyledChartArea = styled("div")(() => ({
  height: "253.42px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "visible",
  "& div": {
    overflow: "visible",
    margin: "0 auto",
    marginLeft: "30px",
    marginRight: "30px"
  }
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

const StyledRejectedStatus = styled("div")(() => ({
  color: "#E25C22",
  fontWeight: 600
}));

const StyledErrorCount = styled("div")(() => ({
  color: "#0D78C5",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "25px",
  textDecorationLine: "underline",
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
  {
    label: "Error Count",
    value: (data) => (
      <StyledErrorCount>
        {data.errors?.length > 0 ? `${data.errors.length} ${data.errors.length === 1 ? "Error" : "Errors"}` : ""}
      </StyledErrorCount>
    ),
    field: "errors",
  },
];

type AlertState = {
  message: string;
  severity: AlertColor;
};

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
  const [error, setError] = useState(false);
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

  const handleFetchBatchFiles = async (fetchListing: FetchListing<Batch>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!submissionId) {
      setError(true);
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
        setError(true);
        return;
      }
      setBatchFiles(newBatchFiles.listBatches.batches);
      setTotalBatchFiles(newBatchFiles.listBatches.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    (async () => {
      if (!dataSubmission?._id) {
        const { data: newDataSubmission, error } = await getSubmission();
        if (error || !newDataSubmission?.getSubmission) {
          setError(true);
          return;
        }
        setDataSubmission(newDataSubmission.getSubmission);
      }
    })();
  }, [submissionId]);

  const refreshBatchTable = () => {
    tableRef.current?.refresh();
  };

  const handleOnDataSubmissionChange = (dataSubmission: Submission) => {
    setDataSubmission(dataSubmission);
  };

  const handleOnUpload = (message: string, severity: AlertColor) => {
    refreshBatchTable();
    setChangesAlert({ message, severity });
    setTimeout(() => setChangesAlert(null), 10000);
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
          <CardContent>
            {error && <StyledAlert severity="error">Oops! An error occurred. Unable to retrieve Data Submission.</StyledAlert>}
            <DataSubmissionSummary dataSubmission={dataSubmission} />
            <StyledChartArea>
              <Stack direction="row" justifyContent="center" sx={{ width: "960px", textAlign: "center" }}>
                <PieChart
                  label="Study"
                  series={[
                    {
                      innerRadius: 40,
                      outerRadius: 55,
                      data: [{ label: "inner", value: 1, color: "#9FD1D6" }],
                    },
                    {
                      innerRadius: 55,
                      outerRadius: 75,
                      data: dummyChartData,
                      highlighted: { additionalRadius: 5 },
                      highlightScope: { faded: 'none', highlighted: 'item' },
                    },
                  ]}
                  margin={{ right: 5 }}
                  width={150}
                  height={150}
                  legend={{ hidden: true }}
                  tooltip={{ trigger: 'none' }}
                  sx={{ rotate: "270deg", overflow: "visible" }}
                />
                <PieChart
                  label="Study"
                  series={[
                    {
                      innerRadius: 40,
                      outerRadius: 55,
                      data: [{ label: "inner", value: 1, color: "#9FD1D6" }],
                    },
                    {
                      innerRadius: 55,
                      outerRadius: 75,
                      data: dummyChartData,
                      highlighted: { additionalRadius: 5 },
                      highlightScope: { faded: 'none', highlighted: 'item' },
                    },
                  ]}
                  margin={{ right: 5 }}
                  width={150}
                  height={150}
                  legend={{ hidden: true }}
                  tooltip={{ trigger: 'none' }}
                  sx={{ rotate: "270deg", overflow: "visible" }}
                />
                <PieChart
                  label="Study"
                  series={[
                    {
                      innerRadius: 40,
                      outerRadius: 55,
                      data: [{ label: "inner", value: 1, color: "#9FD1D6" }],
                    },
                    {
                      innerRadius: 55,
                      outerRadius: 75,
                      data: dummyChartData,
                      highlighted: { additionalRadius: 5 },
                      highlightScope: { faded: 'none', highlighted: 'item' },
                    },
                  ]}
                  margin={{ right: 5 }}
                  width={150}
                  height={150}
                  legend={{ hidden: true }}
                  tooltip={{ trigger: 'none' }}
                  sx={{ rotate: "270deg", overflow: "visible" }}
                />
                <PieChart
                  label="Study"
                  series={[
                    {
                      innerRadius: 40,
                      outerRadius: 55,
                      data: [{ label: "inner", value: 1, color: "#9FD1D6" }],
                    },
                    {
                      innerRadius: 55,
                      outerRadius: 75,
                      data: dummyChartData,
                      highlighted: { additionalRadius: 5 },
                      highlightScope: { faded: 'none', highlighted: 'item' },
                    },
                  ]}
                  margin={{ right: 5 }}
                  width={150}
                  height={150}
                  legend={{ hidden: true }}
                  tooltip={{ trigger: 'none' }}
                  sx={{ rotate: "270deg", overflow: "visible" }}
                />
              </Stack>
            </StyledChartArea>

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
                  <DataSubmissionBatchTable
                    ref={tableRef}
                    columns={columns}
                    data={batchFiles || []}
                    total={totalBatchFiles || 0}
                    loading={loading}
                    onFetchData={handleFetchBatchFiles}
                  />
                </Stack>
              ) : <QualityControl />}
            </StyledMainContentArea>
          </CardContent>
          <StyledCardActions isVisible={tab === URLTabs.DATA_UPLOAD}>
            <DataSubmissionActions
              dataSubmission={dataSubmission}
              onDataSubmissionChange={handleOnDataSubmissionChange}
            />
          </StyledCardActions>
        </StyledCard>
      </StyledBannerContentContainer>
    </StyledWrapper>
  );
};

export default DataSubmission;
