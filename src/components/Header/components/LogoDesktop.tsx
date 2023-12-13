import React from "react";
import { styled } from "@mui/material";
import { headerData } from "../../../config/globalHeaderData";

const LogoArea = styled("div")({
  display: "flex",
  "& img": {
    width: "fit-content",
    height: "56px",
    maxWidth: "100%",
  },
  "& .logoContainer": {
    marginTop: "35px",
    maxWidth: "440px",
  },
});

const Logo = () => (
  <LogoArea>
    <a id="header-logo-home-link" className="logoContainer" href={headerData.globalHeaderLogoLink}>
      <img src={headerData.globalHeaderLogo} alt={headerData.globalHeaderLogoAltText} />
    </a>
  </LogoArea>
);

export default Logo;
