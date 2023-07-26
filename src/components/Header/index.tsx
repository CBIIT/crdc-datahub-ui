import React from 'react';
import styled from 'styled-components';
import HeaderDesktop from './HeaderDesktop';
import HeaderTabletAndMobile from './HeaderTabletAndMobile';
import USABanner from './USABanner';

const HeaderContainer = styled.div`
 @media (min-width: 1024px) {
    .desktop {
      display: block;
    }
    .tabletAndMobile {
      display: none;
    }
  }

  @media (max-width: 1024px) {
    .desktop {
      display: none;
    }
    .tabletAndMobile {
      display: block;
    }
  }

`;

const Header = () => (
  <HeaderContainer>
    <USABanner />
    <div className="desktop">
      <HeaderDesktop />
    </div>
    <div className="tabletAndMobile">
      <HeaderTabletAndMobile />
    </div>
  </HeaderContainer>
);

export default Header;
