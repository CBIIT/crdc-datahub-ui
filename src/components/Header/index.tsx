import { useState, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import HeaderDesktop from "./HeaderDesktop";
import HeaderTabletAndMobile from "./HeaderTabletAndMobile";
import USABanner from "./USABanner";
import GenericAlert from "../GenericAlert";
import { useAuthContext } from "../Contexts/AuthContext";

const Header = () => {
  const tabletAndMobile = useMediaQuery("(max-width: 1024px)");

  const [showLoginError, setShowLoginError] = useState<boolean>(false);
  const authContext = useAuthContext();

  useEffect(() => {
    if (authContext.error !== undefined) {
      setShowLoginError(true);
      setTimeout(() => setShowLoginError(false), 10000);
    }
  }, [authContext]);

  return (
    <>
      <GenericAlert severity="error" open={showLoginError}>
        {authContext.error}
      </GenericAlert>
      <header>
        <USABanner />
        {tabletAndMobile ? <HeaderTabletAndMobile /> : <HeaderDesktop />}
      </header>
    </>
  );
};

export default Header;
