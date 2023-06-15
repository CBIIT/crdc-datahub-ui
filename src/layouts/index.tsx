import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/ResponsiveFooter';
import Header from '../components/ResponsiveHeader';
import ScrollButton from '../components/ScrollButton/ScrollButtonView';

interface LayoutProps {
  children?: ReactNode;
}


const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <CssBaseline>
        <Helmet>
          <title>CCDR DataHub</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
        </Helmet>
        <Header />
        <Container maxWidth="lg">
          <Box display="flex">
            {children || <Outlet />}
          </Box>
        </Container>
        <Footer />
        <ScrollButton />
      </CssBaseline>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
