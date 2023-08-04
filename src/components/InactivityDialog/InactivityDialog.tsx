import React, { useState } from 'react';
import { Button, Dialog, DialogTitle } from '@mui/material';
import styled from 'styled-components';

import { useNavigate } from 'react-router-dom';
// import env from '../../utils/env';

import { useAuthContext } from '../Contexts/AuthContext';
import { PING_INTERVAL, REDIRECT_AFTER_SIGN_OUT, SHOW_WARNING_BEFORE } from '../../config/siteWideConfig';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 550px;
    height: 320px;
    border-radius: 8px;
    border: 2px solid var(--secondary-one, #0B7F99);
    background: linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B;
    box-shadow: 0px 4px 45px 0px rgba(0, 0, 0, 0.40);
  }
  #customized-dialog-title {
    margin: 0;
    padding-left: 30px;
    background-color: #6D89A2;
    color: #FFFFFF;
    font-family: Lato;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0;
  }
`;
const StyledDialogContent = styled.div`
    margin: 50px auto;
    color: #000000;
    font-family: Nunito;
    font-size: 17px;
    font-weight: 300;
    letter-spacing: 0;
    line-height: 24px;
    .alignCenter {
      text-align: center;
    }
    .buttonGroup {
      color: #FFFFFF;
      font-family: Lato;
      font-size: 11px;
      line-height: 22px;
      width: 150px;
      border: 1px solid #626262;
      margin-top: 30px;
    }
    .extendButton {
      background-color: #566672 !important;
    }
    .logOutButton{
      margin-left: 20px;
      background-color: #437BBE !important;
    }
`;

const InactivityDialog = () => {
  const authData = useAuthContext();
  const { isLoggedIn } = authData;
  const [open, setOpen] = useState(true);

  const extendSession = () => {
    // todo: actual extend session logic
    console.log("session extended");
  };

  const handleExtendSession = () => {
    extendSession();
    setOpen(false);
  };
  const handleSignOut = () => {
    authData.logout();
    setOpen(false);
  };

  return (
    <StyledDialog open={open}>
      <DialogTitle id="customized-dialog-title"> Session Timeout Warning</DialogTitle>
      <StyledDialogContent>
        This session is about to expire due to inactivity.
        <br />
        You will be logged out in 3 minutes.
        <br />
        Please elect to extend this session or logout.
        <div className="alignCenter">
          <Button
            variant="contained"
            className="buttonGroup extendButton"
            autoFocus
            onClick={handleExtendSession}
          >
            EXTEND SESSION
          </Button>
          <Button
            variant="contained"
            className="buttonGroup logOutButton"
            onClick={handleSignOut}
          >
            LOGOUT
          </Button>
        </div>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default InactivityDialog;
