import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  styled,
} from "@mui/material";
import bannerSvg from "../../assets/dataSubmissions/dashboard_banner.svg";
import { GET_DATA_SUBMISSION, GetDataSubmissionResp } from "../../graphql";
import DataSubmissionSummary from "../../components/DataSubmissions/DataSubmissionSummary";
import GenericAlert from "../../components/GenericAlert";

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

const StyledActionWrapper = styled(Stack)(() => ({
  justifyContent: "center",
  alignItems: "center",
}));

const StyledSubmitButton = styled(Button)(() => ({
  display: "flex",
  width: "128px",
  height: "51px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0,
  borderRadius: "8px",
  background: "#1D91AB",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "initial",
  zIndex: 3,
  "&:hover": {
    background: "#1A7B90",
  }
}));

const StyledCancelButton = styled(Button)(() => ({
  display: "flex",
  width: "128px",
  height: "51px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0,
  borderRadius: "8px",
  border: "1px solid #AEAEAE",
  background: "#757D88",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "initial",
  zIndex: 3,
  "&:hover": {
    background: "#5B6169",
  }
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

const DataSubmission = () => {
  const { submissionId, tab } = useParams();
  const navigate = useNavigate();
  const [dataSubmission, setDataSubmission] = useState<DataSubmission>(null);
  const [error, setError] = useState(false);
  const [openAlert, setOpenAlert] = useState<string>(null);

  const [getDataSubmission] = useLazyQuery<GetDataSubmissionResp>(GET_DATA_SUBMISSION, {
    variables: { id: submissionId },
    context: { clientName: 'mockService' },
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    (async () => {
      if (!dataSubmission?._id) {
        const { data: newDataSubmission, error } = await getDataSubmission();
        if (error || !newDataSubmission?.getDataSubmission) {
          setError(true);
          return;
        }
        setDataSubmission(newDataSubmission.getDataSubmission);
      }
    })();
  }, [submissionId]);

  const handleOnCancel = () => {
    navigate("/data-submissions");
  };

  return (
    <StyledWrapper>
      <GenericAlert open={openAlert?.length > 0} key="data-submission-alert">
        <span>
          {openAlert}
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
                {/* TODO: Pie Chart Widgets */}
              </Stack>
            </StyledChartArea>

            {/* TODO: Tabs */}

            <StyledMainContentArea>
              {/* TODO: DataSubmissionUpload */}
              {/* TODO: DataSubmissionBatchTable */}
            </StyledMainContentArea>
          </CardContent>
          <CardActions>
            <StyledActionWrapper direction="row" spacing={2}>
              <StyledSubmitButton
                variant="contained"
                disableElevation
                disableRipple
                disableTouchRipple
              >
                Submit
              </StyledSubmitButton>
              <StyledCancelButton
                variant="contained"
                onClick={handleOnCancel}
                disableElevation
                disableRipple
                disableTouchRipple
              >
                Cancel
              </StyledCancelButton>
            </StyledActionWrapper>
          </CardActions>
        </StyledCard>
      </StyledBannerContentContainer>
    </StyledWrapper>
  );
};

export default DataSubmission;
