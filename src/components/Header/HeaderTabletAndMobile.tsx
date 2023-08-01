import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Dialog } from "@mui/material";
import Logo from "./components/LogoMobile";
import SearchBar from "./components/SearchBarMobile";
import menuClearIcon from '../../assets/header/Menu_Cancel_Icon.svg';
import rightArrowIcon from '../../assets/header/Right_Arrow.svg';
import leftArrowIcon from '../../assets/header/Left_Arrow.svg';
import { navMobileList, navbarSublists } from '../../config/globalHeaderData';
import { useAuthContext } from '../Contexts/AuthContext';
import GenericAlert from '../GenericAlert';

const HeaderBanner = styled.div`
  width: 100%;
`;

const HeaderContainer = styled.div`
    margin: 0 auto;
    padding-left: 16px;
    box-shadow: -0.1px 6px 9px -6px rgba(0, 0, 0, 0.5);

    .searchBarArea {
        padding: 0 16px 0 0;
        margin-left: 24px;
    }

    .headerLowerContainer {
        display: flex;
        margin: 16px 0 4px 0;
        height: 51px;
    }

    .menuButton {
        width: 89px;
        height: 45px;
        background: #1F4671;
        border-radius: 5px;
        font-family: 'Open Sans';
        font-weight: 700;
        font-size: 20px;
        line-height: 45px;
        color: #FFFFFF;
        text-align: center;
    }

    .menuButton:hover {
        cursor: pointer;
    }

    // .menuButton:active {
    //     outline: 0.25rem solid #2491ff;
    //     outline-offset: 0.25rem
    // }
`;

const NavMobileContainer = styled.div<{ $display?: string; }>`
    display: ${(props) => props.$display};
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 1200;
`;

const MenuArea = styled.div`
    height: 100%;
    width: 100%;
    display: flex;

    .menuContainer {
        background: #ffffff;
        width: 300px;
        height: 100%;
        padding: 21px 16px;
    }

    .greyContainer {
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.2);
    }

    .closeIcon {
        height: 14px;
        margin-bottom: 29px;
    }

    .closeIconImg {
        float: right;
    }

    .closeIconImg:hover {
        cursor: pointer;
    }

    .backButton {
        font-family: Open Sans;
        font-weight: 600;
        font-size: 16px;
        line-height: 16px;
        color: #007BBD;
        padding-left: 16px;
        background: url(${leftArrowIcon}) left no-repeat;
    }

    .backButton:hover {
        cursor: pointer;
    }

    // .backButton:active {
    //     outline: 0.25rem solid #2491ff;
    //     outline-offset: 0.5rem;
    // }

    .navMobileContainer {
        padding: 24px 0 0 0;

        a {
            text-decoration: none;
            color: #3D4551;
        }
    }

    .navMobileItem {
        width: 268px;
        padding: 8px 24px 8px 16px;
        font-family: Open Sans;
        font-weight: 400;
        font-size: 16px;
        line-height: 16px;
        border-top: 1px solid #F0F0F0;
        border-bottom: 1px solid #F0F0F0;
        color: #3D4551;
    }

    .navMobileItem:hover {
        background-color: #f9f9f7;
    }

    // .navMobileItem:active {
    //     outline: 0.25rem solid #2491ff;
    // }

    .SubItem {
        padding-left: 24px;
    }

    .clickable {
        background: url(${rightArrowIcon}) 90% no-repeat;
    }

    .clickable {
        cursor: pointer;
    }
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
    margin-left: 12px;
    margin-right: 12px;
    overflow-wrap: break-word;
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
type NavbarMobileList = {
  name: string;
  link: string;
  id: string;
  className: string;
  needsAuthentication?: boolean;
}[];

const Header = () => {
  const path = useLocation().pathname;
  const [navMobileDisplay, setNavMobileDisplay] = useState('none');
  const navMobileListHookResult = useState(navMobileList);
  const navbarMobileList: NavbarMobileList = navMobileListHookResult[0];
  const setNavbarMobileList = navMobileListHookResult[1];
  const [showNavDialog, setShowNavDialog] = useState(false);
  const [loginDialogTitle, setLoginDialogTitle] = useState("");
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);

  const authData = useAuthContext();
  const displayName = authData?.user?.displayName || "random first name no one has";
  const navigate = useNavigate();

  const handleLogout = async () => {
    const logoutStatus = await authData.logout();
    if (logoutStatus) {
      navigate("/");
      setShowLogoutAlert(true);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };

  const handleAuthenticationNavLinkClick = (dropItem) => {
    setNavMobileDisplay('none');
    if (authData.isLoggedIn) {
      navigate(dropItem.link);
    } else {
      setLoginDialogTitle(dropItem.name);
      setShowNavDialog(true);
    }
  };
  navbarSublists[displayName] = [
    {
      name: 'User Profile',
      link: '/user_profile',
      id: 'navbar-dropdown-item-user-profile',
      className: 'navMobileSubItem',
    },
    {
      name: 'Logout',
      link: '/logout',
      id: 'navbar-dropdown-item-logout',
      className: 'navMobileSubItem',
    },
  ];
  const clickNavItem = (e) => {
    const clickTitle = e.target.innerText;
    setNavbarMobileList(navbarSublists[clickTitle]);
  };

  return (
    <>
      <GenericAlert open={showLogoutAlert}>
        <span>
          You have been logged out.
        </span>
      </GenericAlert>
      <HeaderBanner role="banner">
        <HeaderContainer>
          <Logo />
          <div className="headerLowerContainer">
            <div
              role="button"
              id="header-navbar-open-menu-button"
              tabIndex={0}
              className="menuButton"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setNavMobileDisplay('block');
                }
              }}
              onClick={() => setNavMobileDisplay('block')}
            >
              Menu
            </div>
            {path !== "/sitesearch" && <div className="searchBarArea"><SearchBar /></div>}
          </div>
        </HeaderContainer>
      </HeaderBanner>
      <NavMobileContainer $display={navMobileDisplay}>
        <MenuArea>
          <div className="menuContainer">
            <div
              role="button"
              id="navbar-close-navbar-button"
              tabIndex={0}
              className="closeIcon"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setNavMobileDisplay('none');
                }
              }}
              onClick={() => setNavMobileDisplay('none')}
            >
              <img className="closeIconImg" src={menuClearIcon} alt="menuClearButton" />
            </div>
            {navbarMobileList !== navMobileList && (
              <div
                role="button"
                id="navbar-back-to-main-menu-button"
                tabIndex={0}
                className="backButton"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setNavbarMobileList(navMobileList);
                  }
                }}
                onClick={() => setNavbarMobileList(navMobileList)}
              >
                Main Menu
              </div>
            )}
            <div className="navMobileContainer">
              {
                navbarMobileList.map((navMobileItem, idx) => {
                  const mobilekey = `mobile_${idx}`;
                  return (
                    <React.Fragment key={mobilekey}>
                      {
                        navMobileItem.className === 'navMobileItem'
                        && (navMobileItem.needsAuthentication ? (
                          <div
                            id={navMobileItem.id}
                            role="button"
                            tabIndex={0}
                            className="navMobileItem"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAuthenticationNavLinkClick(navMobileItem);
                              }
                            }}
                            onClick={() => {
                              handleAuthenticationNavLinkClick(navMobileItem);
                            }}
                          >
                            {navMobileItem.name}
                          </div>
                        ) : (
                          <NavLink
                            id={navMobileItem.id}
                            to={navMobileItem.link}
                            onClick={() => setNavMobileDisplay('none')}
                          >
                            <div className="navMobileItem">{navMobileItem.name}</div>
                          </NavLink>
                        )
                        )
                      }
                      {
                        navMobileItem.className === 'navMobileItem clickable'
                        && (
                          <div
                            id={navMobileItem.id}
                            role="button" tabIndex={0}
                            className="navMobileItem clickable"
                            onKeyDown={(e) => { if (e.key === "Enter") { clickNavItem(e); } }}
                            onClick={clickNavItem}
                          >
                            {navMobileItem.name}
                          </div>
                        )
                      }
                      {
                        navMobileItem.className === 'navMobileSubItem'
                        && (!navMobileItem.needsAuthentication
                          ? (
                            <Link
                              id={navMobileItem.id}
                              to={navMobileItem.link}
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                className="navMobileItem SubItem"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setNavMobileDisplay('none');
                                    if (navMobileItem.name === "Logout") {
                                      handleLogout();
                                      setNavbarMobileList(navMobileList);
                                    } else {
                                      navigate(navMobileItem.link);
                                    }
                                  }
                                }}
                                onClick={() => {
                                  setNavMobileDisplay('none');
                                  if (navMobileItem.name === "Logout") {
                                    handleLogout();
                                    setNavbarMobileList(navMobileList);
                                  } else {
                                    navigate(navMobileItem.link);
                                  }
                                }}
                              >
                                {navMobileItem.name}
                              </div>
                            </Link>
                          )
                          : (
                            <div
                              id={navMobileItem.id}
                              role="button"
                              tabIndex={0}
                              className="navMobileItem SubItem"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAuthenticationNavLinkClick(navMobileItem);
                                }
                              }}
                              onClick={() => {
                                handleAuthenticationNavLinkClick(navMobileItem);
                              }}
                            >
                              {navMobileItem.name}
                            </div>
                          ))
                      }
                      {navMobileItem.className === 'navMobileSubTitle' && <div className="navMobileItem">{navMobileItem.name}</div>}
                    </React.Fragment>
                  );
                })
              }
              {/* eslint-disable-next-line no-nested-ternary */}
              {navbarMobileList === navMobileList ? (
                authData.isLoggedIn ? (
                  <div
                    id="navbar-dropdown-name"
                    role="button" tabIndex={0}
                    className="navMobileItem clickable"
                    onKeyDown={(e) => { if (e.key === "Enter") { clickNavItem(e); } }}
                    onClick={clickNavItem}
                  >
                    {displayName}
                  </div>
                )
                  : (
                    <Link id="navbar-link-login" to="/login">
                      <div role="button" tabIndex={0} className="navMobileItem" onKeyDown={(e) => { if (e.key === "Enter") { setNavMobileDisplay('none'); } }} onClick={() => setNavMobileDisplay('none')}>
                        Login
                      </div>
                    </Link>

                  )) : null}
            </div>
          </div>
          <div
            role="button"
            id="navbar-close-navbar-grey-section"
            tabIndex={0}
            className="greyContainer"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setNavMobileDisplay('none');
              }
            }}
            onClick={() => setNavMobileDisplay('none')}
            aria-label="greyContainer"
          />
        </MenuArea>
      </NavMobileContainer>
      <StyledDialog open={showNavDialog}>
        <pre className="loginDialogText">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          Please <Link id="loginDialogLinkToLogin" to="/login" state={{ redirectURLOnLoginSuccess: "/submissions" }} onClick={() => setNavMobileDisplay('none')}><strong>log in</strong></Link> to access {loginDialogTitle}.
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

export default Header;
