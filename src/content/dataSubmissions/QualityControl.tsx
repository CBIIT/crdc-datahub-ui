import { useLazyQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Button, Stack, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { LIST_LOGS, ListLogsResp } from "../../graphql";

const StyledDownloadButton = styled(Button)({
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

const QualityControl = () => {
  const { submissionId } = useParams();

  const [filesValidationUrl, setFilesValidationUrl] = useState(null);
  const [metadataValidationUrl, setMetadataValidationUrl] = useState(null);

  const [listLogs] = useLazyQuery<ListLogsResp>(LIST_LOGS, {
    variables: { submissionID: submissionId },
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    (async () => {
      const { data: d, error } = await listLogs();
      if (error || !d?.listLogs) {
        return;
      }
      console.log(d.listLogs);
      setMetadataValidationUrl(d.listLogs);
    })();
  }, [submissionId]);

  return (
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
            sx={{ color: !filesValidationUrl?.length ? "#AAA" : "083A50" }}
          >
            Files Validation Results
          </StyledDownloadLabel>
          <StyledDownloadButton disabled={!filesValidationUrl?.length}>
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
            sx={{ color: !filesValidationUrl?.length ? "#AAA" : "083A50" }}
          >
            Metadata Validation Results
          </StyledDownloadLabel>
          <StyledDownloadButton disabled={!metadataValidationUrl?.length}>
            Download
          </StyledDownloadButton>
        </Stack>
      </Stack>
      <StyledValidationMessage variant="body2">
        {filesValidationUrl?.length || metadataValidationUrl?.length ? (
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
  );
};

export default QualityControl;
