import React from 'react';
import styled from 'styled-components';
import { headerData } from '../../config/globalHeaderData';

const BannerArea = styled.div`
    flex-direction:row;
    width: 100%;
    height: 46px;
    background: #F0F0F0;

`;
const BannerContainer = styled.div`
    display:flex;
    align-items:center;
    max-width: 1400px;
    height:100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 2rem;
    img{
        margin-right: 14px;
    }
    .text{
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        width: fit-content;
        height: 16px;
    }
    @media (max-width: 1023px) {
        padding-left: 1rem;
    }
`;

const USABanner = () => (
  <BannerArea>
    <BannerContainer>
      <img src={headerData.usaFlagSmall} alt={headerData.usaFlagSmallAltText} />
      <div className="text">
        An official website of the United States government
      </div>
    </BannerContainer>
  </BannerArea>
  );

export default USABanner;
