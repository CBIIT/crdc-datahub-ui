import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog } from "@mui/material";
import { Link, useLocation } from 'react-router-dom';
import background from '../assets/loginPage/background.png';
import { useAuthContext } from '../components/Contexts/AuthContext';

const LoginDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 550px;
    height: 218px;
    border-radius: 8px;
    border: 2px solid var(--secondary-one, #0B7F99);
    background: linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B;
    box-shadow: 0px 4px 45px 0px rgba(0, 0, 0, 0.40);
  }
  .buttonContainer {
    display: flex;
    justify-content: center;
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
  .loginDialogButton{
    display: flex;
    width: 128px;
    height: 42px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #000;
    margin-top: 39px;
    text-decoration: none;
    color: rgba(0, 0, 0, 0.87);
    margin-left: 7px;
    margin-right: 7px;
  }
  .loginDialogButton:hover {
    cursor: pointer;
  }
  #loginDialogLinkToLogin{
    color:black;
  }
`;

const PageContentContainer = styled.div`
  width: 100%;
  height: 633px;
  margin: auto;
  background-image: url(${background});
  background-blend-mode: luminosity, normal;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  
  .loginPageTextContainer {
    width: 775px;
    height: 265px;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    align-self: center;
    justify-content: center;


    border-radius: 5px;
    border: 2px solid #C8E3FC;
    background: #091a1961;
    background-blend-mode: multiply;
    box-shadow: -1px -1px 6px 0px rgba(62, 102, 125, 0.25), -1px -1px 6px 0px rgba(76, 121, 147, 0.25);
  }
  .loginPageTextTitle {
    font-family: Nunito Sans;
    font-size: 40px;
    font-weight: 800;
    line-height: 40px;
    letter-spacing: -1.5px;
    text-align: center;
    color: #FFFFFF;
  }
  .loginPageText{
    font-family: Inter;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: center;
    margin-top: 30px;
    color: #86E2F6;
    margin-left: 30px;
    margin-right: 30px;
  }
  .loginPageLoginButton{
    display: flex;
    width: 128px;
    height: 51px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 2px solid #005EA2;
    margin-top: 30px;
    text-decoration: none;
    color: #3F53B2;
    background: #FFFFFF;
  }
  .loginPageLoginButton:hover {
    cursor: pointer;
  }
`;

const Home: FC = () => {
    const [showRedirectDialog, setShowRedirectDialog] = useState(false);
    const { state } = useLocation();
    const authData = useAuthContext();
    let dialogRedirectPath = state?.path ?? "";
    let dialogLinkName = state?.name ?? "";
    useEffect(() => {
        if (state !== null) {
            dialogRedirectPath = state.path;
            dialogLinkName = state.name;
            setShowRedirectDialog(true);
        }
      }, []);
    return (
      <>
        <LoginDialog open={showRedirectDialog}>
          <pre className="loginDialogText">
            {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
            Please <Link id="loginDialogLinkToLogin" to="/login" state={{ redirectURLOnLoginSuccess: dialogRedirectPath }} onClick={() => setShowRedirectDialog(false)}><strong>log in</strong></Link> to access {dialogLinkName}.
          </pre>
          <div className="buttonContainer">
            <div
              role="button"
              tabIndex={0}
              id="loginDialogCloseButton"
              className="loginDialogButton"
              onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setShowRedirectDialog(false);
                    }
                }}
              onClick={() => setShowRedirectDialog(false)}
            >
              <strong>Close</strong>
            </div>
            <Link
              id="loginDialogLoginButton" className="loginDialogButton"
              to="/login" state={{ redirectURLOnLoginSuccess: dialogRedirectPath }}
              onClick={() => setShowRedirectDialog(false)}
            >
              <strong>Log In</strong>
            </Link>
          </div>

        </LoginDialog>
        <PageContentContainer>
          {authData.isLoggedIn ? (
            <div className="loginPageTextContainer">
              <div className="loginPageTextTitle">
                Welcome to CRDC Submission Portal
              </div>
              <div className="loginPageText">
                You are logged in.
              </div>
            </div>
            )
          : (
            <div className="loginPageTextContainer">
              <div className="loginPageTextTitle">
                Login to CRDC Submission Portal
              </div>
              <div className="loginPageText">
                Please login with a Login.gov account to make a data submission request or to upload data for approved submissions
              </div>
              <Link
                id="loginPageLoginButton"
                className="loginPageLoginButton"
                to="/login"
                state={{ redirectURLOnLoginSuccess: "/submissions" }}
              >
                <strong>Log In</strong>
              </Link>
            </div>
            )}
        </PageContentContainer>
      </>
);
};

export default Home;
