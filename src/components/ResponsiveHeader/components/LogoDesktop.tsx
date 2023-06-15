import React from 'react';
import styled from 'styled-components';
import { headerData } from '../../../bento/globalHeaderData';

const LogoArea = styled.div`
    display: flex;

    img {
      width: fit-content;
      height: 56px;
    }

    .logoContainer {
      margin-top: 35px;
    }

`;


const Logo = () => {
  return (
    <LogoArea>
        <a className='logoContainer' href={headerData.globalHeaderLogoLink}>
            <img src={headerData.globalHeaderLogo} alt={headerData.globalHeaderLogoAltText} />
        </a>
    </LogoArea>
  );
};

export default Logo;