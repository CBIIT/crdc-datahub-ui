import React from 'react';
import styled from 'styled-components';
import { headerData } from '../../../bento/globalHeaderData';

const LogoArea = styled.div`
    display: flex;

    .logoContainer {
      margin-top: 32px;
    }

`;


const Logo = () => {
  return (
    <LogoArea>
        <a className='logoContainer' href={headerData.globalHeaderLogoLink}>
            <img src={headerData.globalHeaderLogoSmall} alt={headerData.globalHeaderLogoAltText} />
        </a>
    </LogoArea>
  );
};

export default Logo;