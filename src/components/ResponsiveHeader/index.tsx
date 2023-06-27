import React from 'react';
import styled from 'styled-components';
import HeaderDesktop from './HeaderDesktop';
import HeaderTablet from './HeaderTablet';
import HeaderMobile from './HeaderMobile';
import USABanner from './USABanner';

const HeaderContainer = styled.div`
 @media (min-width: 1024px) {
    .desktop {
      display: block;
    }
    .tablet {
      display: none;
    }
    .mobile {
      display: none;
    }
  }

  @media (min-width:768px) and (max-width: 1024px) {
    .desktop {
      display: none;
    }
    .tablet {
      display: block;
    }
    .mobile {
      display: none;
    }
  }

  @media  (max-width: 768px) {
    .desktop {
      display: none;
    }
    .tablet {
      display: none;
    }
    .mobile {
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
    <div className="tablet">
      <HeaderTablet />
    </div>
    <div className="mobile">
      <HeaderMobile />
    </div>
  </HeaderContainer>
  );

export default Header;
