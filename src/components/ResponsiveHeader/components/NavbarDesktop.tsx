import React, { useEffect, useState, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { navMobileList, navbarSublists } from '../../../bento/globalHeaderData';

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
 `;

const NavContainer = styled.div`
    margin: 0 auto;
    width: 1400px;
    text-align: left;
    position: relative;
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


const activeStyle = {
  color: '#298085',
  borderBottom: '4px solid #298085',
};

const useOutsideAlerter = (ref) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target || (event.target.getAttribute("class") !== "dropdownList" && ref.current && !ref.current.contains(event.target))) {
        const toggle = document.getElementsByClassName("navText clicked");
        if (toggle[0] && event.target.getAttribute("class") !== "navText clicked" && event.target.getAttribute("class") !== "navText clicked") {
          const temp: HTMLElement = toggle[0] as HTMLElement;
          temp.click();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};


const NavBar = () => {
  const path = useLocation().pathname;
  const [clickedTitle, setClickedTitle] = useState("");
  const dropdownSelection = useRef(null);
  const clickableObject = navMobileList.filter(item => item.className === 'navMobileItem clickable');
  const clickableTitle = clickableObject.map(item => item.name);
  useOutsideAlerter(dropdownSelection);

  const handleMenuClick = (e) => {
    if (e.target.innerText === clickedTitle || !clickableTitle.includes(e.target.innerText)) {
      setClickedTitle("");
    } else {
      setClickedTitle(e.target.innerText);
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
                    ? <LiSection key={navkey}><div className='navTitle directLink'><NavLink to={navMobileItem.link}><div className='navText directLink' onClick={handleMenuClick} style={path === navMobileItem.link || (path === '/' && navMobileItem.link === '/home') ? activeStyle : null}>{navMobileItem.name}</div></NavLink></div></LiSection>
                    : <LiSection key={navkey}><div className={clickedTitle === navMobileItem.name ? 'navTitleClicked' : 'navTitle'}><div className={clickedTitle === navMobileItem.name ? 'navText clicked' : 'navText'} onClick={handleMenuClick}>{navMobileItem.name}</div></div></LiSection>
                )
              })
            }
          </UlContainer>
        </NavContainer>
        <Dropdown ref={dropdownSelection} style={clickedTitle === '' ? { visibility: 'hidden', } : null}>
          <DropdownContainer>
            <div className="dropdownList">
              {
                clickedTitle !== "" ? navbarSublists[clickedTitle].map((dropItem, idx) => {
                  const dropkey = `drop_${idx}`;
                  return (
                    dropItem.link && <a href={dropItem.link} className="dropdownItem" key={dropkey} onClick={() => setClickedTitle("")}>
                      {dropItem.name}
                      <div className="dropdownItemText">{dropItem.text}</div>
                    </a>
                  )
                })
                  : null
              }
            </div>
          </DropdownContainer>
        </Dropdown>
      </Nav>
    </>
  );
};

export default NavBar;