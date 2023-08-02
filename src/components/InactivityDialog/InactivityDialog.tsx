import React, { useEffect } from 'react';
import { Button, Dialog, IconButton, Typography, DialogTitle, DialogContent } from '@mui/material';
import styled from 'styled-components';

import { useNavigate } from 'react-router-dom';
// import env from '../../utils/env';

import { useAuthContext } from '../Contexts/AuthContext';
import { PING_INTERVAL, REDIRECT_AFTER_SIGN_OUT, SHOW_WARNING_BEFORE } from '../../config/siteWideConfig';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 550px;
    height: 218px;
    border-radius: 8px;
    border: 2px solid var(--secondary-one, #0B7F99);
    background: linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B;
    box-shadow: 0px 4px 45px 0px rgba(0, 0, 0, 0.40);
  }
  .loginDialogText {
    margin-top: 57px;
    /* Body */
    font-family: Nunito;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 19.6px; /* 122.5% */
    text-align: center;
  }
  .loginDialogCloseButton{
    display: flex;
    width: 128px;
    height: 42px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #000;
    align-self: center;
    margin-top: 39px;
  }
  .loginDialogCloseButton:hover {
    cursor: pointer;
  }
  #loginDialogLinkToLogin{
    color:black;
  }
`;

const InactivityDialog = () => {
  const authData = useAuthContext();
  const { isLoggedIn } = authData;
  return (
    <StyledDialog open />
  );
};

export default InactivityDialog;
