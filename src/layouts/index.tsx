import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/ResponsiveFooter';
import Header from '../components/ResponsiveHeader';
import ScrollButton from '../components/ScrollButton/ScrollButtonView';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => (
  <>
    <Helmet>
      <title>CCDR DataHub</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Public+Sans:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <Header />
    <Container maxWidth="lg">
      {children || <Outlet />}
    </Container>
    <Footer />
    <ScrollButton />
  </>
  );

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
