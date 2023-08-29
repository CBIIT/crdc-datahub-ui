import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle } from '@mui/material';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import GenericAlert from '../GenericAlert';

// import env from '../../utils/env';

import { useAuthContext } from '../Contexts/AuthContext';

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

const secondsToMinuteString = (seconds) => new Date(seconds * 1000).toISOString().substring(14, 19);

const InactivityDialog = () => {
  const authData = useAuthContext();
  const { isLoggedIn } = authData;
  const [warning, setWarning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [intervalID, setIntervalID] = useState<NodeJS.Timer>(null);
  const navigate = useNavigate();
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const thresholdTime = 300;

  const [timeLeft, setTimeLeft] = useState(thresholdTime);
  const extendSession = async () => {
    const AUTH_API = `${window.origin}/api/authn/authenticated`;
    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json()).catch(() => {
      });

      if (res.status) {
        setWarning(false);
      }
    } catch (e) {
      // Add Erro handler here.
    }
  };

  const loadData = async () => {
    try {
      const SESSION_TTL_API = `${window.origin}/api/authn/session-ttl`;

      const res = await fetch(SESSION_TTL_API);
      const data = await res.json();
      const { ttl } = data.ttl;
      if (ttl <= 0) {
        // If user did not select any option and timed out in BE.
        handleSignOutNoBanner();
        setTimedOut(true);
      } else if (ttl > 0 && ttl <= thresholdTime) {
        setTimeLeft(ttl);
        setWarning(true);
      }
    } catch (e) {
      // Add Erro handler here.
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // NOTE: 1000 milliseconds = 1 second, PING_INTERVAL * 1000 = PING_INTERVAL milliseconds;
      const ID = setInterval(loadData, 5 * 1000);
      setIntervalID(ID);
    } else {
      clearInterval(intervalID);
    }
    return () => clearInterval(intervalID);
  }, [isLoggedIn]);

  const handleExtendSession = () => {
    extendSession();
  };
  const handleSignOutNoBanner = async () => {
    const logoutStatus = await authData.logout();
    if (logoutStatus) {
      navigate("/");
      setWarning(false);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };
  const handleSignOut = async () => {
    const logoutStatus = await authData.logout();
    if (logoutStatus) {
      navigate("/");
      setWarning(false);
      setShowLogoutAlert(true);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };

  return (
    <>
      <GenericAlert open={showLogoutAlert}>
        <span>
          You have been logged out.
        </span>
      </GenericAlert>
      <InacivityWarningDialog open={warning}>
        <DialogTitle id="customized-dialog-title"> Session Timeout Warning</DialogTitle>
        <InacivityWarningContent>
          This session is about to expire due to inactivity.
          <br />
          You will be logged out in
          {` ${secondsToMinuteString(timeLeft)} `}
          minutes.
          <br />
          Please elect to extend this session or logout.
          <div className="alignCenter">
            <Button
              variant="contained"
              className="buttonGroup extendButton"
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
