import { useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { useSnackbar } from "notistack";
import HeaderDesktop from "./components/HeaderDesktop";
import HeaderTabletAndMobile from "./components/HeaderTabletAndMobile";
import USABanner from "./components/USABanner";
import { useAuthContext } from "../Contexts/AuthContext";

const Header = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { error: authError } = useAuthContext();
  const tabletAndMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    if (typeof authError !== "string") {
      return;
    }

    enqueueSnackbar(authError, { variant: "error" });
  }, [authError]);

  return (
    <header>
      <USABanner />
      {tabletAndMobile ? <HeaderTabletAndMobile /> : <HeaderDesktop />}
    </header>
  );
};

export default Header;
