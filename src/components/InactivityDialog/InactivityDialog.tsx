import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GenericAlert from "../GenericAlert";

// import env from '../../utils/env';

import { useAuthContext } from "../Contexts/AuthContext";

const InactivityWarningDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "550px",
    height: "320px",
    borderRadius: "8px",
    border: "2px solid var(--secondary-one, #0B7F99)",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
  "& #customized-dialog-title": {
    margin: 0,
    paddingLeft: "30px",
    backgroundColor: "#6D89A2",
    color: "#FFFFFF",
    fontFamily: "Lato",
    fontSize: "20px",
    fontWeight: 600,
    letterSpacing: 0,
  },
});

const InactivityWarningContent = styled("div")({
  margin: "50px auto",
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "17px",
  fontWeight: 300,
  letterSpacing: 0,
  lineHeight: "24px",
  "& .buttonWrapper": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  "& .buttonGroup": {
    color: "#FFFFFF",
    fontFamily: "Lato",
    fontSize: "11px",
    lineHeight: "22px",
    width: "150px",
    border: "1px solid #626262",
    marginTop: "30px",
    borderRadius: "4px",
    fontWeight: 500
  },
  "& .extendButton": {
    backgroundColor: "#566672 !important",
  },
  "& .logOutButton": {
    marginLeft: "20px",
    backgroundColor: "#437BBE !important",
  },
});

const SessionTimeoutDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "550px",
    height: "320px",
    borderRadius: "8px",
    border: "2px solid var(--secondary-one, #0B7F99)",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
  "& .closeIcon": {
    cursor: "pointer",
    textAlign: "end",
  },
});

const SessionTimeoutContent = styled("div")({
  justifyContent: "space-between",
  paddingRight: "33px",
  paddingLeft: "33px",
  paddingTop: "10px",
  fontFamily: "lato",
  textAlign: "center",
  "& .sessionTimeoutTitle": {
    fontSize: "25px",
    fontWeight: "bold",
    paddingBottom: "12px",
    color: "#566672",
  },
  "& .sessionTimeoutMessage": {
    fontSize: "17px",
    paddingBottom: "14px",
  },
  "& .buttonWrapper": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  "& .buttonGroup": {
    color: "#FFFFFF",
    fontFamily: "Lato",
    fontSize: "11px",
    lineHeight: "22px",
    width: "90px",
    border: "1px solid #626262",
    marginTop: "30px",
    borderRadius: "4px",
    fontWeight: 500
  },
  "& .closeButton": {
    backgroundColor: "#566672 !important",
  },
  "& .loginButton": {
    marginLeft: "20px",
    backgroundColor: "#437BBE !important",
  },
});

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
      const { ttl } = data;
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
      <InactivityWarningDialog open={warning}>
        <DialogTitle id="customized-dialog-title"> Session Timeout Warning</DialogTitle>
        <InactivityWarningContent>
          This session is about to expire due to inactivity.
          <br />
          You will be logged out in
          {` ${secondsToMinuteString(timeLeft)} `}
          minutes.
          <br />
          Please elect to extend this session or logout.
          <div className="buttonWrapper">
            <Button
              variant="contained"
              className="buttonGroup extendButton"
              onClick={handleExtendSession}
              disableElevation={false}
            >
              EXTEND SESSION
            </Button>
            <Button
              variant="contained"
              className="buttonGroup logOutButton"
              onClick={handleSignOut}
              disableElevation={false}
            >
              LOGOUT
            </Button>
          </div>
        </InactivityWarningContent>
      </InactivityWarningDialog>
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
          <div className="buttonWrapper">
            <Button
              variant="contained"
              className="buttonGroup closeButton"
              onClick={() => setTimedOut(false)}
              disableElevation={false}
            >
              CLOSE
            </Button>
            <Button
              variant="contained"
              className="buttonGroup loginButton"
              onClick={() => { setTimedOut(false); navigate("login"); }}
              disableElevation={false}
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
