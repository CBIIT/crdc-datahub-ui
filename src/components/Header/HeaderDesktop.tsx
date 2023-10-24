import React from 'react';
import styled from 'styled-components';
import Logo from './components/LogoDesktop';
import NavBar from './components/NavbarDesktop';

const HeaderBanner = styled.div`
  width: 100%;
`;

const HeaderContainer = styled.div`
    margin: 0 auto;
    padding-left: 32px;
    max-width: 1400px;
    display: flex;
`;

const Header = () => (
  <HeaderBanner role="banner">
    <HeaderContainer>
      <Logo />
    </HeaderContainer>
    <div className="navbarContainer"><NavBar /></div>
  </HeaderBanner>
  );

export default Header;
