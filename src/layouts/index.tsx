import { FC, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ScrollButton from "../components/ScrollButton/ScrollButtonView";
import OverlayWindow from "../components/SystemUseWarningOverlay/OverlayWindow";
import InactivityDialog from "../components/InactivityDialog/InactivityDialog";

const StyledWrapper = styled("main")({
  minHeight: "400px",
  overflowX: "hidden",
});

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => (
  <>
    <Helmet defaultTitle="CRDC DataHub">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, minimum-scale=1"
      />
      <link
        href={
          "https://fonts.googleapis.com/css2?" +
          "family=Open+Sans&" +
          "family=Poppins:wght@400;700&" +
          "family=Lato:wght@300;400;500;600;700&" +
          "family=Inter:wght@300;400;500;600;700&" +
          "family=Nunito+Sans:wght@400;500;600;700;800;900&" +
          "family=Nunito:wght@300;400;500;600;700;800;900&" +
          "family=Public+Sans:wght@300;400;500;600;700&" +
          "family=Rubik:wght@300;400;500;600;700&" +
          "family=Roboto:wght@400&" +
          "display=swap"
        }
        rel="stylesheet"
      />
    </Helmet>
    <Header />
    <OverlayWindow />
    <StyledWrapper>
      {children || <Outlet />}
      <ScrollButton />
    </StyledWrapper>
    <Footer />
    <InactivityDialog />
  </>
);

export default Layout;
