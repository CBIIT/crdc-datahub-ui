import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Dialog } from "@mui/material";
import { useAuthContext } from '../../Contexts/AuthContext';
import { navMobileList, navbarSublists } from '../../../config/globalHeaderData';

const testIsLoggedIn = false;

const Nav = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    background: #ffffff;
    box-shadow: -0.1px 6px 9px -6px rgba(0, 0, 0, 0.5);
    z-index: 1100;
    position: relative;

    .dropdownContainer {
      // outline: none;
      // visibility: hidden;
      // opacity: 0;
      margin: 0 auto;
      position: relative;
      width: 1400px;
    }
    .loggedInName{
      color: #007BBD;
      text-align: right;
      font-size: 14px;
      font-family: Poppins;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      letter-spacing: 0.42px;
      text-decoration: none;
      text-transform: uppercase;
      padding: 10px 0 10px 0;
      margin-bottom: 4.5px;
      margin-right: 40px;
    }
    .invisible {
      visibility: hidden;
    }
 `;

const NavContainer = styled.div`
    margin: 0 auto;
    max-width: 1400px;
    text-align: left;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: end;

    #navbar-dropdown-name-container { 
      margin: 0; 
      min-width: 150px; 
      border: none;
    }
`;

const UlContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding-top: 17px;
  padding-left: 11px;
`;

const LiSection = styled.li`
  display: inline-block;
  position: relative;
  line-height: 50px;
  letter-spacing: 1px;
  text-align: center;
  transition:all 0.3s ease-in-out;

  a {
    color: #585C65;
    text-decoration: none;
  }

  .navTitle {
    display: block;
    color: #585C65;
    font-family: poppins;
    font-size: 17px;
    font-weight: 700;
    line-height: 40px;
    letter-spacing: normal;
    text-decoration: none;
    margin: 0 45px 0 5px;
    padding: 0 15px;
    user-select:none;
    border-top: 4px solid transparent;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
  }

  .navTitle:hover {
    cursor: pointer;
  }

  .navText {
    border-bottom: 4px solid transparent;
  }

  .navText:hover {
    cursor: pointer;
    color: #3A75BD;
    border-bottom: 4px solid #3A75BD;

    ::after {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      border-bottom: 1px solid #298085;
      border-left: 1px solid #298085;
      margin: 0 0 4px 8px;
      transform: rotate(-45deg);
      -webkit-transform: rotate(-45deg);
    }
  }

  .navText::after {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-bottom: 1px solid #585C65;
    border-left: 1px solid #585C65;
    margin: 0 0 4px 8px;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }

  .clicked {
    color: #FFFFFF;
    background: #1F4671;
  }

  .clicked::after {
    border-top: 1px solid #FFFFFF;
    border-right: 1px solid #FFFFFF;
    border-bottom: 0;
    border-left: 0;
    margin: 0 0 0 8px
  }

  .clicked:hover {
    border-bottom: 4px solid #1F4671;
    color: #FFFFFF;

    ::after {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      border-top: 1px solid #FFFFFF;
      border-right: 1px solid #FFFFFF;
      border-bottom: 0;
      border-left: 0;
      margin: 0 0 0 8px;
      transform: rotate(-45deg);
      -webkit-transform: rotate(-45deg);
    }
  }

  .directLink::after {
    display: none;
  }

  .directLink:hover {
    ::after {
      display: none;
    }
  }
  .shouldBeUnderlined {
    border-bottom: 4px solid #3A75BD !important;
  }
  .navTitleClicked {
    display: block;
    color: #FFFFFF;
    font-family: poppins;
    font-size: 17px;
    font-weight: 700;
    line-height: 40px;
    letter-spacing: normal;
    text-decoration: none;
    margin: 0 45px 0 5px;
    padding: 0 15px;
    user-select:none;
    background: #1F4671;
    border-top: 4px solid #5786FF;
    border-left: 4px solid #5786FF;
    border-right: 4px solid #5786FF;
  }
  .invisible {
    visibility: hidden;
  }
`;

const Dropdown = styled.div`
    top: 60.5px;
    left: 0;
    width: 100%;
    background: #1F4671;
    z-index: 1100;
    position: absolute;
    // visibility: hidden;
    // outline: none;
    // opacity: 0;
`;

const DropdownContainer = styled.div`
    margin: 0 auto;
    text-align: left;
    position: relative;
    max-width: 1400px;

    .dropdownList {
      background: #1F4671;
      display: grid;
      grid-template-columns: repeat( auto-fit, minmax(250px, 1fr) );
      padding: 32px 32px 0 32px;
    }
    .dropdownNameList {
      background: #1F4671;
      display: flex;
      flex-direction: column;
      padding: 32px 32px 0 32px;
      width: 400px;
      height: 200px;
      justify-content: end;
    }

    .dropdownItem {
      padding: 0 10px 52px 10px;
      text-align: left;
      font-family: 'Poppins';
      font-weight: 600;
      font-style: normal;
      font-size: 20px;
      line-height: 110%;
      color: #FFFFFF;
      text-decoration: none;
  }

  .dropdownItem:hover {
    text-decoration: underline;
  }

  .dropdownItemText {
    margin-top: 5px;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 16.16px;
    line-height: 22px;
  }
`;

const NameDropdownContainer = styled.div`
    display: flex;
    flex-direction: column;
    .dropdownItem {
      padding-bottom: 12px;
      text-align: center;
      font-family: 'Poppins';
      font-weight: 600;
      font-style: normal;
      font-size: 16px;
      line-height: 110%;
      color: #FFFFFF;
      text-decoration: none;
  }

  .dropdownItem:hover {
    text-decoration: underline;
  }
`;

const NameDropdown = styled.div`
    left: 0;
    background: #1F4671;
    z-index: 1100;
    position: absolute;
    // visibility: hidden;
    // outline: none;
    // opacity: 0;
    /* border-left: 4px solid #5786FF;
    border-bottom: 4px solid #5786FF;
    border-right: 4px solid #5786FF; */
    width: 100%;
`;

const StyledLoginLink = styled(Link)`
  color: #007BBD;
  text-align: right;
  font-size: 14px;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 0.42px;
  text-decoration: none;
  text-transform: uppercase;
  padding: 10px 0 10px 0;
  margin-bottom: 4.5px;
  margin-right: 32px;
`;

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

const useOutsideAlerter = (ref1, ref2) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target || (event.target.getAttribute("class") !== "dropdownList" && ref1.current && !ref1.current.contains(event.target) && ref2.current && !ref2.current.contains(event.target))) {
        const toggle = document.getElementsByClassName("navText clicked");
        if (toggle[0] && event.target.getAttribute("class") !== "navText clicked") {
          const temp: HTMLElement = toggle[0] as HTMLElement;
          temp.click();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref1, ref2]);
};

const NavBar = () => {
  const [clickedTitle, setClickedTitle] = useState("");
  const [loginDialogTitle, setLoginDialogTitle] = useState("");
  const dropdownSelection = useRef(null);
  const nameDropdownSelection = useRef(null);
  const clickableObject = navMobileList.filter((item) => item.className === 'navMobileItem clickable');
  const clickableTitle = clickableObject.map((item) => item.name);
  const [showNavDialog, setShowNavDialog] = useState(false);
  const navigate = useNavigate();
  const authData = useAuthContext();
  const firstName = authData?.user?.firstName || "random first name no one has";
  clickableTitle.push(firstName);
  useOutsideAlerter(dropdownSelection, nameDropdownSelection);

  const handleMenuClick = (e) => {
    if (e.target.innerText === clickedTitle || !clickableTitle.includes(e.target.innerText)) {
      setClickedTitle("");
    } else {
      setClickedTitle(e.target.innerText);
    }
  };

  const onKeyPressHandler = (e) => {
    if (e.key === "Enter") {
      handleMenuClick(e);
    }
  };
  type NavSubLinkData = {
    name: string;
    link: string;
    className: string;
  };
  function shouldBeUnderlined(linkName) {
    const correctPath = window.location.href.slice(window.location.href.lastIndexOf(window.location.host) + window.location.host.length);
    if (linkName === "Home") {
      return correctPath === "/";
    }
    const linkNames = Object.values(navbarSublists[linkName]).map((e: NavSubLinkData) => e.link);
    return linkNames.includes(correctPath);
  }

  const handleNavLinkClick = (dropItem) => {
    setClickedTitle("");
    if (testIsLoggedIn) {
      navigate(dropItem.link);
    } else {
      setLoginDialogTitle(dropItem.name);
      setShowNavDialog(true);
    }
  };

  useEffect(() => {
    setClickedTitle("");
  }, []);
  return (
    <>
      <Nav>
        <NavContainer>
          <UlContainer>
            {
              navMobileList.map((navMobileItem, idx) => {
                const navkey = `nav_${idx}`;
                return (
                  navMobileItem.className === 'navMobileItem'
                    ? (
                      <LiSection key={navkey}>
                        <div className="navTitle directLink">
                          <NavLink to={navMobileItem.link}>
                            <div
                              id={navMobileItem.id}
                              onKeyDown={onKeyPressHandler}
                              role="button"
                              tabIndex={0}
                              className={`navText directLink ${shouldBeUnderlined(navMobileItem.name) ? "shouldBeUnderlined" : ""}`}
                              onClick={handleMenuClick}
                            >
                              {navMobileItem.name}
                            </div>
                          </NavLink>
                        </div>
                      </LiSection>
                    )
                    : (
                      <LiSection key={navkey}>
                        <div className={clickedTitle === navMobileItem.name ? 'navTitleClicked' : 'navTitle'}>
                          <div
                            id={navMobileItem.id}
                            onKeyDown={onKeyPressHandler}
                            role="button"
                            tabIndex={0}
                            className={`${clickedTitle === navMobileItem.name ? 'navText clicked' : 'navText'} ${shouldBeUnderlined(navMobileItem.name) ? "shouldBeUnderlined" : ""}`}
                            onClick={handleMenuClick}
                          >
                            {navMobileItem.name}
                          </div>
                        </div>
                      </LiSection>
                    )
                );
              })
            }
          </UlContainer>
          {authData.isLoggedIn
            ? (
              <LiSection>
                <div id="navbar-dropdown-name-container" className={(clickedTitle === firstName ? 'navTitleClicked' : 'navTitle')}>
                  <div
                    id="navbar-dropdown-name"
                    onKeyDown={onKeyPressHandler}
                    role="button"
                    tabIndex={0} className={clickedTitle === firstName ? 'navText clicked' : 'navText'}
                    onClick={handleMenuClick}
                  >
                    {firstName}
                  </div>
                </div>
                <NameDropdown ref={nameDropdownSelection} className={clickedTitle !== firstName ? "invisible" : ""}>
                  <NameDropdownContainer>
                    <Link id="navbar-dropdown-item-name-user-profile" to="/userProfile" className="dropdownItem" onClick={() => setClickedTitle("")}>
                      User Profile
                    </Link>
                    <div
                      id="navbar-dropdown-item-name-logout"
                      role="button"
                      tabIndex={0}
                      className="dropdownItem"
                      onClick={() => { setClickedTitle(""); authData.logout(); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setClickedTitle("");
                          authData.logout();
                        }
                      }}
                    >
                      Logout
                    </div>
                  </NameDropdownContainer>
                </NameDropdown>
              </LiSection>
            )
            : (
              <StyledLoginLink id="header-navbar-login-button" to="/login">
                Login
              </StyledLoginLink>
            )}
        </NavContainer>
        <Dropdown ref={dropdownSelection} className={(clickedTitle === '' || clickedTitle === firstName) ? "invisible" : ""}>
          <DropdownContainer>
            <div className="dropdownList">
              {
                (clickedTitle !== "" && clickedTitle !== firstName) ? navbarSublists[clickedTitle].map((dropItem, idx) => {
                  const dropkey = `drop_${idx}`;
                  return (
                    dropItem.link && (!dropItem.needsAuthentication
                      ? (
                        <Link id={dropItem.id} to={dropItem.link} className="dropdownItem" key={dropkey} onClick={() => setClickedTitle("")}>
                          {dropItem.name}
                          <div className="dropdownItemText">{dropItem.text}</div>
                        </Link>
                      )
                      : (
                        <div
                          id={dropItem.id}
                          key={dropkey}
                          role="button"
                          tabIndex={0}
                          className="dropdownItem"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleNavLinkClick(dropItem);
                            }
                          }}
                          onClick={() => { handleNavLinkClick(dropItem); }}
                        >
                          {dropItem.name}
                        </div>
                      )
                    )
                  );
                })
                  : null
              }
            </div>
          </DropdownContainer>
        </Dropdown>
      </Nav>
      <StyledDialog open={showNavDialog}>
        <pre className="loginDialogText">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          Please <Link id="loginDialogLinkToLogin" to="/login" onClick={() => setClickedTitle("")}><strong>log in</strong></Link> to access {loginDialogTitle}.
        </pre>
        <div
          role="button"
          tabIndex={0}
          id="loginDialogCloseButton"
          className="loginDialogCloseButton"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowNavDialog(false);
            }
          }}
          onClick={() => setShowNavDialog(false)}
        >
          <strong>Close</strong>
        </div>
      </StyledDialog>
    </>
  );
};

export default NavBar;
