import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle } from '@mui/material';
import styled from 'styled-components';

import { useNavigate } from 'react-router-dom';
// import env from '../../utils/env';

import { useAuthContext } from '../Contexts/AuthContext';
import { PING_INTERVAL, REDIRECT_AFTER_SIGN_OUT, SHOW_WARNING_BEFORE } from '../../config/siteWideConfig';
import { METHODS } from 'http';

const InacivityWarningDialog = styled(Dialog)`
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

const InacivityWarningContent = styled.div`
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

const SessionTimeoutDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 550px;
    height: 320px;
    border-radius: 8px;
    border: 2px solid var(--secondary-one, #0B7F99);
    background: linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B;
    box-shadow: 0px 4px 45px 0px rgba(0, 0, 0, 0.40);
  }
  .closeIcon {
    cursor: pointer;
    text-align: end;
  }
`;

const SessionTimeoutContent = styled.div`
  justify-content: space-between;
  padding-right: 33px;
  padding-left: 33px;
  padding-top: 10px;
  font-family: lato;
  text-align: center;
  .sessionTimeoutTitle {
    font-size: 25px;
    font-weight: bold;
    padding-bottom: 12px;
    color: #566672;
  }
  .sessionTimeoutMessage {
    font-size: 17px;
    padding-bottom: 14px;
  }
  .alignCenter {
      text-align: center;
    }
    .buttonGroup {
      color: #FFFFFF;
      font-family: Lato;
      font-size: 11px;
      line-height: 22px;
      width: 90px;
      border: 1px solid #626262;
      margin-top: 30px;
    }
    .closeButton {
      background-color: #566672 !important;
    }
    .loginButton{
      margin-left: 20px;
      background-color: #437BBE !important;
    }
`;

const InactivityDialog = () => {
  const authData = useAuthContext();
  const { isLoggedIn } = authData;
  const [warning, setWarning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [intervalID, setIntervalID] = useState<NodeJS.Timer>(null);
  const navigate = useNavigate();
  const thresholdTime = 300;

  const [timeLeft, setTimeLeft] = useState(thresholdTime);

  const extendSession = () => {
    // todo: actual extend session logic
    console.log("session extended");
  };

  const loadData = async () => {
    const AUTH_SERVICE_URL = `${window.origin}/api/auth/session-ttl`;
    console.log(AUTH_SERVICE_URL);
    try {
      const res = await fetch(AUTH_SERVICE_URL, METHODS);
      console.log(res);
      const data = await res.json();
      const { ttl } = data;
      console.log("ttl recieved from mock api: ", ttl);
      if (ttl <= 0) {
        // If user did not select any option and timed out in BE.
        authData.logout();
        setWarning(false);
        setTimedOut(true);
      } else if (ttl > 0 && ttl <= thresholdTime) {
        setTimeLeft(ttl);
        setWarning(true);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // NOTE: 1000 milliseconds = 1 second, PING_INTERVAL * 1000 = PING_INTERVAL milliseconds;
      const ID = setInterval(loadData, 5 * 1000);
      setIntervalID(ID);
    } else {
      console.log("test");
      clearInterval(intervalID);
    }
  }, [isLoggedIn]);

  const handleExtendSession = () => {
    extendSession();
    setWarning(false);
  };
  const handleSignOut = () => {
    authData.logout();
    setWarning(false);
  };

  return (
    <>
      <InacivityWarningDialog open={warning}>
        <DialogTitle id="customized-dialog-title"> Session Timeout Warning</DialogTitle>
        <InacivityWarningContent>
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
        </InacivityWarningContent>
      </InacivityWarningDialog>
      <SessionTimeoutDialog open={timedOut}>
        <DialogTitle>
          <div
            role="button"
            className="closeIcon"
            onClick={() => setTimedOut(false)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTimedOut(false);
              }
            }}
          >
            <img style={{ height: 10, marginBottom: 2 }} src="https://raw.githubusercontent.com/CBIIT/datacommons-assets/main/bento/images/icons/svgs/LocalFindCaseDeleteIcon.svg" alt="close icon" />
          </div>
        </DialogTitle>
        <SessionTimeoutContent>
          <div className="sessionTimeoutTitle">Your session has expired.</div>
          <br />
          <div className="sessionTimeoutMessage">Please login again to continue working.</div>
          <div className="alignCenter">
            <Button
              variant="contained"
              className="buttonGroup closeButton"
              autoFocus
              onClick={() => setTimedOut(false)}
            >
              CLOSE
            </Button>
            <Button
              variant="contained"
              className="buttonGroup loginButton"
              onClick={() => { setTimedOut(false); navigate("login"); }}
            >
              LOGIN
            </Button>
          </div>
        </SessionTimeoutContent>
      </SessionTimeoutDialog>
    </>
  );
};

export default InactivityDialog;
