import React from "react";
import { styled } from "@mui/material";
import Logo from "./components/LogoDesktop";
import NavBar from "./components/NavbarDesktop";

const HeaderBanner = styled("div")({
  width: "100%",
});

const HeaderContainer = styled("div")({
  margin: "0 auto",
  paddingLeft: "32px",
  maxWidth: "1400px",
  display: "flex",
});

const Header = () => (
  <HeaderBanner>
    <HeaderContainer>
      <Logo />
    </HeaderContainer>
    <div className="navbarContainer">
      <NavBar />
    </div>
  </HeaderBanner>
);

export default Header;
