import { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ScrollButton from "../components/ScrollButton/ScrollButtonView";
import OverlayWindow from "../components/SystemUseWarningOverlay/OverlayWindow";
import InactivityDialog from "../components/InactivityDialog/InactivityDialog";
import { SearchParamsProvider } from "../components/Contexts/SearchParamsContext";

const StyledWrapper = styled("main")({
  minHeight: "400px",
  overflowX: "hidden",
});

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => (
  <SearchParamsProvider>
    <Header />
    <OverlayWindow />
    <StyledWrapper>
      {children || <Outlet />}
      <ScrollButton />
    </StyledWrapper>
    <Footer />
    <InactivityDialog />
  </SearchParamsProvider>
);

export default Layout;
