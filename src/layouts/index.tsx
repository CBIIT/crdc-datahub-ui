import { FC, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material';
import PropTypes from 'prop-types';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ScrollButton from '../components/ScrollButton/ScrollButtonView';
import OverlayWindow from '../components/SystemUseWarningOverlay/OverlayWindow';
import InactivityDialog from '../components/InactivityDialog/InactivityDialog';

const StyledWrapper = styled("div")(() => ({
  minHeight: "400px",
}));

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => (
  <>
    <Helmet>
      <title>CRDC DataHub</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
      {/* List of fonts here:
      <link
        href="https://fonts.googleapis.com/css2?
        family=Open+Sans&
        family=Poppins:wght@400;700&
        family=Lato:wght@300;400;500;600;700&
        family=Inter:wght@300;400;500;600;700&
        family=Nunito+Sans:wght@400;500;600;700;800;900&
        family=Nunito:wght@300;400;500;600;700;800;900&
        family=Public+Sans:wght@300;400;500;600;700&
        family=Rubik:wght@300;400;500;600;700&
        display=swap" rel="stylesheet" />
      */}
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Poppins:wght@400;700&family=Lato:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Nunito+Sans:wght@400;500;600;700;800;900&family=Nunito:wght@300;400;500;600;700;800;900&family=Public+Sans:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <Header />
    <OverlayWindow />
    <StyledWrapper>
      {children || <Outlet />}
    </StyledWrapper>
    <Footer />
    <ScrollButton />
    <InactivityDialog />
  </>
);

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
