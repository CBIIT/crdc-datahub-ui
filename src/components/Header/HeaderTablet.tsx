import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Logo from "./components/LogoTablet";
import SearchBar from "./components/SearchBarTablet";
import menuClearIcon from '../../assets/header/Menu_Cancel_Icon.svg';
import rightArrowIcon from '../../assets/header/Right_Arrow.svg';
import leftArrowIcon from '../../assets/header/Left_Arrow.svg';
import { navMobileList, navbarSublists } from '../../config/globalHeaderData';

const testLoggedInBool = false;
const testData = {
  name: "Michael"
};

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

const NavMobileContainer = styled.div`
    // display: none;
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
        width: 385px;
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

    // .closeIconImg:active {
    //     outline: 0.25rem solid #2491ff;
    //     outline-offset: 0.5rem
    // }

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
        width: 353px;
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

const Header = () => {
  const path = useLocation().pathname;
  const [navMobileDisplay, setNavMobileDisplay] = useState('none');
  const [navbarMobileList, setNavbarMobileList] = useState(navMobileList);

  const clickNavItem = (e) => {
    const clickTitle = e.target.innerText;
    setNavbarMobileList(navbarSublists[clickTitle]);
  };

  return (
    <>
      <HeaderBanner role="banner">
        <HeaderContainer>
          <Logo />
          <div className="headerLowerContainer">
            <div
              id="header-navbar-open-menu-button"
              role="button"
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
      <NavMobileContainer style={{ display: navMobileDisplay }}>
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
            {navbarMobileList !== navMobileList
              && (
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
                      {navMobileItem.className === 'navMobileItem' && <NavLink id={navMobileItem.id} to={navMobileItem.link} onClick={() => setNavMobileDisplay('none')}><div className="navMobileItem">{navMobileItem.name}</div></NavLink>}
                      {navMobileItem.className === 'navMobileItem clickable' && <div id={navMobileItem.id} role="button" tabIndex={0} className="navMobileItem clickable" onKeyDown={(e) => { if (e.key === "Enter") { clickNavItem(e); } }} onClick={clickNavItem}>{navMobileItem.name}</div>}
                      {navMobileItem.className === 'navMobileSubItem' && <Link id={navMobileItem.id} to={navMobileItem.link}><div role="button" tabIndex={0} className="navMobileItem SubItem" onKeyDown={(e) => { if (e.key === "Enter") { setNavMobileDisplay('none'); } }} onClick={() => setNavMobileDisplay('none')}>{navMobileItem.name}</div></Link>}
                      {navMobileItem.className === 'navMobileSubTitle' && <div className="navMobileItem">{navMobileItem.name}</div>}
                    </React.Fragment>
                  );
                })
              }
              {testLoggedInBool ? (<div className="loggedInName">{testData.name}</div>)
                : (
                  <Link id="navbar-link-home" to="/login">
                    <div role="button" tabIndex={0} className="navMobileItem" onKeyDown={(e) => { if (e.key === "Enter") { setNavMobileDisplay('none'); } }} onClick={() => setNavMobileDisplay('none')}>
                      Login
                    </div>
                  </Link>

                )}
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
    </>
  );
};

export default Header;
