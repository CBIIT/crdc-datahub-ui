import React from "react";
import { styled } from "@mui/material";
import { headerData } from "../../../config/globalHeaderData";

const LogoArea = styled("div")({
  display: "flex",

  "& .logoContainer": {
    marginTop: "35px",
  },
});

const Logo = () => (
  <LogoArea>
    <a id="header-logo-home-link" className="logoContainer" href={headerData.globalHeaderLogoLink}>
      <img src={headerData.globalHeaderLogoSmall} alt={headerData.globalHeaderLogoAltText} />
    </a>
  </LogoArea>
);

export default Logo;
