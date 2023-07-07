import { FC, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import { styled } from '@mui/material';
import PropTypes from 'prop-types';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ScrollButton from '../components/ScrollButton/ScrollButtonView';
import GET_USER from '../config/graphqlQueries';

const StyledWrapper = styled("div")(() => ({
  minHeight: "400px",
}));

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  // const { loading, error, data } = useQuery(GET_USER);

  // if (loading) {
  //   return 'Loading...';
  // }

  // if (error) {
  //   return `Error! ${error.message}`;
  // }

  const { loading, error, data } = useQuery(GET_USER, {
    // variables: { id },
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  console.log(loading, error, data);

  // const myHeaders = new Headers();
  // myHeaders.append("Content-Type", "application/json");
  // myHeaders.append("Cookie", "connect.sid=s%3A7LahVOGJpS2-e7waVMwgp3fBxE6YDkRm.sCN9O6Vgge2jYg7cfapNlxNhCYax8blQUxrNw%2B%2FNPRs");

  // const graphql = JSON.stringify({
  //   query: "{\r\n    getMyUser{\r\n        _id\r\n        firstName\r\n        lastName\r\n        userStatus\r\n        role\r\n        IDP\r\n        email\r\n        createdAt\r\n        updateAt\r\n    }\r\n}",
  //   variables: {}
  // });
  // const requestOptions = {
  //   method: 'POST',
  //   headers: myHeaders,
  //   body: graphql,
  //   // redirect: 'follow'
  // };

  // fetch("http://localhost:4030/api/authz/graphql", requestOptions)
  //   .then((response) => response.text())
  //   .then((result) => console.log(result))
  //   .catch((error) => console.log('error', error));

  return (
    <>
      <Helmet>
        <title>CCDR DataHub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
        {/* List of fonts here:
          <link href="https://fonts.googleapis.com/css2?
                family=Open+Sans&
                family=Poppins:wght@400;700&
                family=Lato:wght@300;400;500;600;700&
                family=Inter:wght@300;400;500;600;700&
                family=Nunito+Sans:wght@400;500;600;700;900&
                family=Nunito:wght@400;500;600;700&
                family=Public+Sans:wght@300;400;500;600;700&
                family=Rubik:wght@300;400;500;600;700&
          display=swap" rel="stylesheet" />
        */}
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Poppins:wght@400;700&family=Lato:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Nunito+Sans:wght@400;500;600;700;900&family=Nunito:wght@400;500;600;700&family=Public+Sans:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <Header />
      <StyledWrapper>
        {children || <Outlet />}
      </StyledWrapper>
      <Footer />
      <ScrollButton />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
