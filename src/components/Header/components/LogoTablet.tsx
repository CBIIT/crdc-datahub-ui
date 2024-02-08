import React from "react";
import { styled } from "@mui/material";
import { Link } from 'react-router-dom';
import { headerData } from "../../../config/globalHeaderData";

const LogoArea = styled("div")({
  display: "flex",

  "& .logoContainer": {
    marginTop: "32px",
  },
});

const Logo = () => (
  <LogoArea>
    <Link id="header-logo-home-link" className="logoContainer" to={headerData.globalHeaderLogoLink}>
      <img src={headerData.globalHeaderLogoSmall} alt={headerData.globalHeaderLogoAltText} />
    </Link>
  </LogoArea>
);

export default Logo;
