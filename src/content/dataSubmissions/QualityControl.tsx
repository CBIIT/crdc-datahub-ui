import { useEffect, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";
import { Stack, Typography, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { LIST_LOGS, ListLogsResp } from "../../graphql";
import GenericAlert, { AlertState } from "../../components/GenericAlert";
import { useAuthContext } from "../../components/Contexts/AuthContext";

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

type Props = {
  submitterID: string;
};

const QualityControl = ({ submitterID }: Props) => {
  const { submissionId } = useParams();
  const { user } = useAuthContext();

  const [files, setFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [changesAlert, setChangesAlert] = useState<AlertState>(null);
  const metadataLogs = files.filter((file) => file.uploadType === "metadata");
  const fileLogs = files.filter((file) => file.uploadType === "file");
  const alertTimeoutRef = useRef(null);
  const isSubmissionOwner = submitterID === user?._id;

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
        setChangesAlert({
          message: "Unable to retrieve logs",
          severity: "error",
        });
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(
          () => setChangesAlert(null),
          10000
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId, submitterID, user]);

  const downloadFiles = async (uploadType: UploadType) => {
    const zip = new JSZip();
    const filesToDownload = files.filter(
      (file) => file.uploadType === uploadType
    );

    await Promise.all(
      filesToDownload.map(async (file) => {
        const response = await fetch(file.downloadUrl);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      })
    );

    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, `${uploadType}_logs.zip`);
    });
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
              loading={loading}
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
              loading={loading}
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
