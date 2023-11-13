import { useEffect, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Stack, Typography, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { LIST_LOGS, ListLogsResp } from "../../graphql";
import GenericAlert, { AlertState } from "../../components/GenericAlert";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import GenericTable, { Column, TableMethods } from "../../components/DataSubmissions/GenericTable";
import { FormatDate } from "../../utils";

const StyledDownloadButton = styled(LoadingButton)({
  display: "flex",
  height: "44px",
  padding: "10px 25px",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  borderRadius: "8px",
  border: "1.5px solid #FFF",
  background: "#005EA2",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&:hover": {
    background: "#005EA2",
    color: "#FFF",
  },
  "&.Mui-disabled": {
    border: "1.5px solid #FFF",
    background: "#BBB",
    color: "#FFF",
  },
});

const StyledDownloadLabel = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  color: "#083A50",
  textAlign: "right",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  textTransform: "capitalize",
});

const StyledValidationMessage = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  color: "#083A50",
  textAlign: "center",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "23px",
});

const testData = [
  {
    _id: "c4366aaa-8adf-41e9-9432-864b2101231d",
    nodeType: "Participant",
    batchID: "123a5678-8adf-41e9-9432-864b2108191d",
    nodeID: "123a5678-8adf-41e9-9432-864b2108191d",
    crdcID: "123a5678-8adf-41e9-9432-864b2108191d",
    severity: "error",
    description: "Incorrect control vocabulary.",
    updatedAt: "2023-11-08T19:39:15.469Z",
    submittedDate: "2023-11-08T19:39:15.469Z",
    createdAt: "2023-11-08T19:39:15.469Z",
  },
  {
    _id: "c4366aab-8adf-41e9-9432-864b2101231d",
    nodeType: "Participant",
    batchID: "123a5678-8adf-41e9-9432-864b2108191d",
    nodeID: "123a5678-8adf-41e9-9432-864b2108191d",
    crdcID: "123a5678-8adf-41e9-9432-864b2108191d",
    severity: "error",
    description: "Missing required field.",
    submittedDate: "2023-11-07T19:39:15.469Z",
    createdAt: "2023-11-07T19:39:15.469Z",
    updatedAt: "2023-11-07T19:39:15.469Z"
  },
  {
    _id: "c4366aac-8adf-41e9-9432-864b2101231d",
    nodeType: "Participant",
    batchID: "123a5678-8adf-41e9-9432-864b2108191d",
    nodeID: "123a5678-8adf-41e9-9432-864b2108191d",
    crdcID: "123a5678-8adf-41e9-9432-864b2108191d",
    severity: "error",
    description: "Value not in the range.",
    submittedDate: "2023-11-06T19:39:15.469Z",
    createdAt: "2023-11-06T19:39:15.469Z",
    updatedAt: "2023-11-06T19:39:15.469Z"
  },
];

const columns: Column<any>[] = [
  {
    label: "Type",
    value: (data) => data?.nodeType,
    field: "nodeType",
  },
  {
    label: "Batch ID",
    value: (data) => data?.batchID,
    field: "batchID",
  },
  {
    label: "Node ID",
    value: (data) => data?.nodeID,
    field: "nodeID",
  },
  {
    label: "CRDC ID",
    value: (data) => data?.crdcID,
    field: "crdcID",
  },
  {
    label: "Severity",
    value: (data) => data?.severity,
    field: "severity",
  },
  {
    label: "Submitted Date",
    value: (data) => (data?.submittedDate ? `${FormatDate(data.submittedDate, "MM-DD-YYYY [at] hh:mm A")}` : ""),
    field: "submittedDate",
    default: true
  },
  {
    label: "Description",
    value: (data) => data?.description,
    field: "description",
  },
];

type Props = {
  submitterID: string;
};

const QualityControl = ({ submitterID }: Props) => {
  const { submissionId } = useParams();
  const { user } = useAuthContext();

  const [files, setFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [changesAlert, setChangesAlert] = useState<AlertState>(null);
  const [data, setData] = useState(testData);
  const [totalData, setTotalData] = useState(testData.length);
  const metadataLogs = files.filter((file) => file.uploadType === "metadata");
  const fileLogs = files.filter((file) => file.uploadType === "file");
  const alertTimeoutRef = useRef(null);
  const isSubmissionOwner = submitterID === user?._id;
  const tableRef = useRef<TableMethods>(null);

  const [listLogs] = useLazyQuery<ListLogsResp>(LIST_LOGS, {
    variables: { submissionID: submissionId },
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!submissionId || !isSubmissionOwner) {
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data: d, error } = await listLogs();
        if (error || !d?.listLogs) {
          throw new Error("Unexpected network error");
        }

        setFiles(d.listLogs.logFiles);
      } catch (err) {
        updateAlert({
          message: "Unable to retrieve logs",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId, submitterID, user]);

  const updateAlert = (alert: AlertState) => {
    if (!alert?.message || !alert?.severity) {
      return;
    }

    setChangesAlert({
      message: alert.message,
      severity: alert.severity,
    });
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => setChangesAlert(null), 10000);
  };

  const downloadFiles = async (uploadType: UploadType) => {
    setIsDownloading(true);

    const downloadPromises = files
      .filter((file) => file.uploadType === uploadType)
      .map(async (file) => {
        const fileName = file.fileName || `${uploadType}_logs`;
        try {
          const res = await fetch(file.downloadUrl);
          if (!res?.ok) {
            throw new Error("Unexpected network error");
          }
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          throw new Error(error);
        }
      });

    const results = await Promise.allSettled(downloadPromises);
    const errors = results?.filter((result) => result.status === 'rejected');

    if (errors?.length > 0) {
      updateAlert({
        message: `Failed to download ${errors.length} log(s)`,
        severity: "error",
      });
    }

    setIsDownloading(false);
  };

  return (
    <>
      <GenericAlert
        open={!!changesAlert}
        severity={changesAlert?.severity}
        key="submission-quality-control-changes-alert"
      >
        <span>{changesAlert?.message}</span>
      </GenericAlert>
      <GenericTable
        ref={tableRef}
        columns={columns}
        data={data || []}
        total={totalData || 0}
        loading={loading}
        onFetchData={() => {}}
      />
      <Stack
        direction="column"
        alignItems="center"
        paddingTop="66px"
        spacing={5.5}
      >
        <Stack direction="column" spacing={3}>
          <Stack
            direction="row"
            spacing={2.625}
            justifyContent="end"
            alignItems="center"
          >
            <StyledDownloadLabel
              variant="body1"
              textAlign="end"
              sx={{ color: !fileLogs?.length ? "#AAA" : "083A50" }}
            >
              Files Validation Results
            </StyledDownloadLabel>
            <StyledDownloadButton
              onClick={() => downloadFiles("file")}
              loading={loading || isDownloading}
              disabled={!fileLogs?.length}
            >
              Download
            </StyledDownloadButton>
          </Stack>
          <Stack
            direction="row"
            spacing={2.625}
            justifyContent="end"
            alignItems="center"
          >
            <StyledDownloadLabel
              variant="body1"
              textAlign="end"
              sx={{ color: !metadataLogs?.length ? "#AAA" : "083A50" }}
            >
              Metadata Validation Results
            </StyledDownloadLabel>
            <StyledDownloadButton
              onClick={() => downloadFiles("metadata")}
              loading={loading || isDownloading}
              disabled={!metadataLogs?.length}
            >
              Download
            </StyledDownloadButton>
          </Stack>
        </Stack>
        <StyledValidationMessage variant="body2">
          {files?.length > 0 ? (
            "If your submission has failed validation, please fix all errors and resubmit"
          ) : (
            <>
              Validation results are not yet available. You will be notified via
              email when
              <br />
              your submission has been validated and results are ready or you to
              download.
            </>
          )}
        </StyledValidationMessage>
      </Stack>
    </>
  );
};

export default QualityControl;
