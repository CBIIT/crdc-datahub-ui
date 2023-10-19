import {
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { FC, useState } from "react";
import SubmissionHeaderProperty, {
  StyledValue,
} from "./SubmissionHeaderProperty";
import Tooltip from "./Tooltip";
import summaryBannerSvg from "../../assets/dataSubmissions/summary_banner.png";
import { ReactComponent as EmailIconSvg } from "../../assets/icons/email_icon.svg";
import HistoryDialog from "../Shared/HistoryDialog";
import DataSubmissionIconMap from "./DataSubmissionIconMap";

const StyledSummaryWrapper = styled("div")(() => ({
  background: `url(${summaryBannerSvg})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top",
  borderRadius: "8px 8px 0px 0px",
  borderBottom: "1px solid #6CACDA",
  textWrap: "nowrap",
  // boxShadow: "0px 2px 35px 0px rgba(62, 87, 88, 0.35)",
  padding: "24px 105px 66px 37px",
}));

const StyledSubmissionTitle = styled(Typography)(() => ({
  color: "#1D91AB",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
}));

const StyledSubmissionStatus = styled(Typography)(() => ({
  color: "#004A80",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  minHeight: "30px",
}));

const StyledHistoryButton = styled(Button)(() => ({
  marginTop: "16px",
  marginBottom: "4px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid #B3B3B3",
  color: "#004A80",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "17px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#1A5874",
    borderColor: "#DDE6EF",
    color: "#DDE6EF",
  },
}));

const StyledSectionDivider = styled(Divider)(() => ({
  "&.MuiDivider-root": {
    width: "2px",
    height: "107px",
    background: "#6CACDA",
    marginLeft: "35px",
    marginTop: "9px",
  },
}));

const StyledSubmitterName = styled(StyledValue)(() => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "211px",
  lineHeight: "19.6px",
}));

const StyledTooltipSubmitterName = styled(StyledValue)(() => ({
  color: "#595959",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginTop: "6px",
}));

const StyledGridContainer = styled(Grid)(() => ({
  "&.MuiGrid-container": {
    marginLeft: "69px",
  },
  "& .MuiGrid-item:nth-of-type(2n + 1)": {
    paddingLeft: 0,
  },
}));

type Props = {
  dataSubmission: Submission;
};

const DataSubmissionSummary: FC<Props> = ({ dataSubmission }) => {
  const [historyDialogOpen, setHistoryDialogOpen] = useState<boolean>(false);

  const handleOnHistoryDialogOpen = () => {
    setHistoryDialogOpen(true);
  };

  const handleOnHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
  };

  const getHistoryTextColorFromStatus = (status: SubmissionStatus) => {
    let color: string;
    switch (status) {
      case "Archived":
        color = "#10EBA9";
        break;
      case "Rejected":
        color = "#FF7A42";
        break;
      default:
        color = "#FFF";
    }

    return color;
  };
  console.log(dataSubmission);
  return (
    <StyledSummaryWrapper>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={7.125}
      >
        <Stack direction="column" minWidth="192px">
          <StyledSubmissionTitle variant="h6">STATUS</StyledSubmissionTitle>
          <StyledSubmissionStatus variant="h5">
            {dataSubmission?.status}
          </StyledSubmissionStatus>
          <StyledHistoryButton
            variant="outlined"
            onClick={handleOnHistoryDialogOpen}
          >
            Full History
          </StyledHistoryButton>
        </Stack>

        <StyledSectionDivider orientation="vertical" />

        <StyledGridContainer container rowSpacing={2} columnSpacing={14}>
          <SubmissionHeaderProperty
            label="Submission Name"
            value={(
              <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
                {dataSubmission?.name && (
                  <Tooltip
                    title="Submission Name"
                    body={(
                      <StyledTooltipSubmitterName variant="body2">
                        {dataSubmission?.name}
                      </StyledTooltipSubmitterName>
                    )}
                  >
                    <StyledSubmitterName>
                      {dataSubmission?.name}
                    </StyledSubmitterName>
                  </Tooltip>
                )}
              </Stack>
            )}
          />
          <SubmissionHeaderProperty
            label="Submitter"
            value={dataSubmission?.submitterName}
          />
          <SubmissionHeaderProperty
            label="Study"
            value={dataSubmission?.studyAbbreviation}
          />
          <SubmissionHeaderProperty
            label="Data Commons"
            value={dataSubmission?.dataCommons}
          />
          <SubmissionHeaderProperty
            label="Organization"
            value={dataSubmission?.organization}
          />
          <SubmissionHeaderProperty
            label="Primary Contact"
            value={(
              <Stack direction="row" alignItems="center" spacing={1.375}>
                <StyledSubmitterName>
                  {dataSubmission?.conciergeName}
                </StyledSubmitterName>
                {dataSubmission?.conciergeName && (
                  <a
                    href={`mailto:${dataSubmission?.conciergeEmail}`}
                    aria-label="Email Primary Contact"
                  >
                    <EmailIconSvg />
                  </a>
                )}
              </Stack>
            )}
          />
        </StyledGridContainer>
      </Stack>
      <HistoryDialog
        open={historyDialogOpen}
        onClose={handleOnHistoryDialogClose}
        preTitle="Data Submission Request"
        title="Submission History"
        history={dataSubmission?.history}
        iconMap={DataSubmissionIconMap}
        getTextColor={getHistoryTextColorFromStatus}
      />
    </StyledSummaryWrapper>
  );
};

export default DataSubmissionSummary;
