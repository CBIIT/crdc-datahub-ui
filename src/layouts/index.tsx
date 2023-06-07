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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Public+Sans:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          {`
            html, body { height: 100%; }
            body { background: linear-gradient(180deg, #F8FBFF 0%, #F4F8FD 47.4%, #EBEEF4 100%); background-attachment: fixed; }
          `}
        </style>
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
