import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog } from "@mui/material";
import { Link, useLocation } from 'react-router-dom';
import background from '../assets/loginPage/background.png';
import { useAuthContext } from '../components/Contexts/AuthContext';

const StyledDialog = styled(Dialog)`
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
  width: 1440px;
  height: 633px;
  margin: auto;
  background-image: url(${background});
  background-size: cover;    
  .loginPageTextContainer {
    position: relative;
    width: 611px;
    height: 218px;
    vertical-align: middle;
    left: 646px;
    top: 200px;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .loginPageTextTitle {
    font-family: Nunito Sans;
    font-size: 40px;
    font-weight: 800;
    line-height: 40px;
    letter-spacing: -1.5px;
    text-align: center;
    color: #294267;
  }
  .loginPageText{
    font-family: Inter;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: center;
    margin-top: 30px;
  }
  .loginPageLoginButton{
    display: flex;
    width: 101px;
    height: 51px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 2px solid #005EA2;
    margin-top: 30px;
    text-decoration: none;
    color: rgba(0, 0, 0, 0.87);
    color: #005EA2;
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
        <StyledDialog open={showRedirectDialog}>
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

        </StyledDialog>
        <PageContentContainer>
          {authData.isLoggedIn ? (
            <div className="loginPageTextContainer">
              <div className="loginPageTextTitle">
                Welcome to CRDC Data Hub
              </div>
              <div className="loginPageText">
                You are logged in.
                <br />
                Please proceed to Submission Requests or Data Submissions.
              </div>
            </div>
            )
          : (
            <div className="loginPageTextContainer">
              <div className="loginPageTextTitle">
                Login to CRDC Data Hub
              </div>
              <div className="loginPageText">
                Welcome to the CRDC Data Hub.
                <br />
                Please login to access your data submissions.
              </div>
              <Link
                id="loginPageLoginButton"
                className="loginPageLoginButton"
                to="/login"
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
