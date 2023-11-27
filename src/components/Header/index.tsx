import { useState, useEffect } from 'react';
import styled from 'styled-components';
import HeaderDesktop from './HeaderDesktop';
import HeaderTabletAndMobile from './HeaderTabletAndMobile';
import USABanner from './USABanner';
import GenericAlert from '../GenericAlert';
import { useAuthContext } from '../Contexts/AuthContext';

const HeaderContainer = styled.header`
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

const Header = () => {
  const [showLoginError, setShowLoginError] = useState<boolean>(false);
  const authContext = useAuthContext();
  useEffect(() => {
    if (authContext.error !== undefined) {
      setShowLoginError(true);
      setTimeout(() => setShowLoginError(false), 10000);
    }
  }, [authContext]);

  return (
    <>
      <GenericAlert severity="error" open={showLoginError}>
        {authContext.error}
      </GenericAlert>
      <HeaderContainer>
        <USABanner />
        <div className="desktop">
          <HeaderDesktop />
        </div>
        <div className="tabletAndMobile">
          <HeaderTabletAndMobile />
        </div>
      </HeaderContainer>
    </>
  );
};

export default Header;
