import { Container, styled } from "@mui/material";
import bannerBackgroundImage from "../../assets/banner/banner_background.png";

const StyledBanner = styled("div")(() => ({
  background: `url(${bannerBackgroundImage})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "296px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const StyledBannerContentContainer = styled(Container)(() => ({
  "&.MuiContainer-root": {
    padding: "57px 0 0 65px",
    width: "100%",
    height: "100%",
  },
}));

const StyledBannerTitle = styled("h2")(() => ({
  maxWidth: "611px",
  height: "79px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flexShrink: 0,
  color: "#3E577C",
  fontSize: "45px",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontWeight: 800,
  lineHeight: "40px",
  letterSpacing: "-1.5px",
  margin: 0,
}));

const StyledBannerSubtitle = styled("h6")(() => ({
  display: "flex",
  maxWidth: "565px",
  height: "59px",
  flexDirection: "column",
  flexShrink: 0,
  color: "#453E3E",
  fontSize: "16px",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontWeight: 400,
  lineHeight: "22px",
  margin: "0 0 0 5px",
}));

const QuestionnaireBanner = () => (
  <StyledBanner>
    <StyledBannerContentContainer maxWidth="xl">
      <StyledBannerTitle>Submission Request</StyledBannerTitle>
      <StyledBannerSubtitle>
        The following set of high-level questions are intended to provide
        insight to the CRDC Data Hub, related to data storage, access,
        secondary sharing needs and other requirements of data submitters.
      </StyledBannerSubtitle>
    </StyledBannerContentContainer>
  </StyledBanner>
);

export default QuestionnaireBanner;
