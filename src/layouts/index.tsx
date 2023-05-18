import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface LayoutProps {
  children?: ReactNode;
}


const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Helmet>
        <title>CCDR DataHub</title>
      </Helmet>
      <Header />
        <Container maxWidth="lg">
          <Box display="flex">
            {children || <Outlet />}
          </Box>
        </Container>
      <Footer />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
