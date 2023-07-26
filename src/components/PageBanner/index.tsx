import React, { FC } from "react";
import { Container, styled } from '@mui/material';
import { Helmet } from "react-helmet-async";

const StyledBanner = styled("div")(({ bannerSrc } : { bannerSrc: string }) => ({
  background: `url(${bannerSrc})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "296px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const StyledBannerContentContainer = styled(Container)({
  "&.MuiContainer-root": {
    padding: "57px 0 0 65px",
    width: "100%",
    height: "100%",
  },
});

const StyledBannerTitle = styled("h2")({
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
});

const StyledBannerSubtitle = styled("h6")({
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
});

export type Props = {
  title: string;
  pageTitle?: string;
  subTitle: string;
  body?: string | React.ReactNode;
  bannerSrc: string;
};

/**
 * Generic Page Banner component
 *
 * @returns {React.FC<Props>}
 */
const PageBanner: FC<Props> = ({
  title, pageTitle, subTitle, body, bannerSrc
} : Props) => (
  <>
    {pageTitle && (
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
    )}

    <StyledBanner bannerSrc={bannerSrc}>
      <StyledBannerContentContainer maxWidth="xl">
        <StyledBannerTitle>{title}</StyledBannerTitle>
        <StyledBannerSubtitle>
          {subTitle}
        </StyledBannerSubtitle>
        {body}
      </StyledBannerContentContainer>
    </StyledBanner>
  </>
);

export default PageBanner;
