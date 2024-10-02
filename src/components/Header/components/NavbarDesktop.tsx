import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Button, styled } from "@mui/material";
import { useAuthContext } from "../../Contexts/AuthContext";
import GenericAlert from "../../GenericAlert";
import { navMobileList, navbarSublists } from "../../../config/HeaderConfig";
import { GenerateApiTokenRoles } from "../../../config/AuthRoles";
import APITokenDialog from "../../APITokenDialog";
import UploaderToolDialog from "../../UploaderToolDialog";

const Nav = styled("div")({
  top: 0,
  left: 0,
  width: "100%",
  background: "#ffffff",
  boxShadow: "-0.1px 6px 9px -6px rgba(0, 0, 0, 0.5)",
  zIndex: 1100,
  position: "relative",
  "& .dropdownContainer": {
    margin: "0 auto",
    position: "relative",
    width: "1400px",
  },
  "& .loggedInName": {
    color: "#007BBD",
    textAlign: "right",
    fontSize: "14px",
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "normal",
    letterSpacing: "0.42px",
    textDecoration: "none",
    textTransform: "uppercase",
    padding: "10px 0",
    marginBottom: "4.5px",
    marginRight: "40px",
  },
  "& .invisible": {
    visibility: "hidden",
  },
});

const NavContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "1400px",
  textAlign: "left",
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  "#navbar-dropdown-name-container": {
    margin: 0,
  },
});

const UlContainer = styled("ul")({
  listStyle: "none",
  margin: 0,
  paddingTop: "17px",
  paddingLeft: "11px",
  display: "flex",
  width: "100%",
});

const LiSection = styled("li")({
  display: "inline-block",
  position: "relative",
  lineHeight: "50px",
  letterSpacing: "1px",
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  "& a": {
    color: "#585C65",
    textDecoration: "none",
  },
  "& .displayName": {
    color: "#007BBD",
    fontSize: "14px",
    lineHeight: "20px",
    padding: "10px 0",
    textAlign: "right",
    width: "fit-content",
  },
  "&.name-dropdown-li": {
    marginLeft: "auto",
  },
  "&.login-button": {
    lineHeight: "48px",
  },
  "& .navTitle": {
    display: "block",
    color: "#585C65",
    fontFamily: "poppins",
    fontSize: "17px",
    fontWeight: 600,
    lineHeight: "40px",
    letterSpacing: "normal",
    textDecoration: "none",
    margin: "0 5px",
    padding: "0 8px",
    userSelect: "none",
    borderTop: "4px solid transparent",
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    "&:hover": {
      cursor: "pointer",
    },
  },
  "& .navText": {
    borderBottom: "4px solid transparent",
    width: "fit-content",
    margin: "auto",
    "&:hover": {
      cursor: "pointer",
      color: "#3A75BD",
      borderBottom: "4px solid #3A75BD",
      "&::after": {
        content: '""',
        display: "inline-block",
        width: "6px",
        height: "6px",
        borderBottom: "1px solid #298085",
        borderLeft: "1px solid #298085",
        margin: "0 0 4px 8px",
        transform: "rotate(-45deg)",
        WebkitTransform: "rotate(-45deg)",
      },
    },
    "&::after": {
      content: '""',
      display: "inline-block",
      width: "6px",
      height: "6px",
      borderBottom: "1px solid #585C65",
      borderLeft: "1px solid #585C65",
      margin: "0 0 4px 8px",
      transform: "rotate(-45deg)",
      WebkitTransform: "rotate(-45deg)",
    },
  },
  "& .clicked": {
    color: "#FFFFFF",
    background: "#1F4671",
    "&::after": {
      borderTop: "1px solid #FFFFFF",
      borderRight: "1px solid #FFFFFF",
      borderBottom: "0",
      borderLeft: "0",
      margin: "0 0 0 8px",
    },
    "&:hover": {
      borderBottom: "4px solid #1F4671",
      color: "#FFFFFF",
      "&::after": {
        content: '""',
        display: "inline-block",
        width: "6px",
        height: "6px",
        borderTop: "1px solid #FFFFFF",
        borderRight: "1px solid #FFFFFF",
        borderBottom: "0",
        borderLeft: "0",
        margin: "0 0 0 8px",
        transform: "rotate(-45deg)",
        WebkitTransform: "rotate(-45deg)",
      },
    },
  },
  "& .directLink::after": {
    display: "none",
  },
  "& .directLink:hover::after": {
    display: "none",
  },
  "& .shouldBeUnderlined": {
    borderBottom: "4px solid #3A75BD !important",
  },
  "& .navTitleClicked": {
    display: "block",
    color: "#FFFFFF",
    fontFamily: "poppins",
    fontSize: "17px",
    fontWeight: 600,
    lineHeight: "40px",
    letterSpacing: "normal",
    textDecoration: "none",
    margin: "0 5px",
    padding: "0 8px",
    userSelect: "none",
    background: "#1F4671",
    borderTop: "4px solid #5786FF",
    borderLeft: "4px solid #5786FF",
    borderRight: "4px solid #5786FF",
  },
  "& .invisible": {
    visibility: "hidden",
  },
});

const Dropdown = styled("div")({
  top: "60.5px",
  left: 0,
  width: "100%",
  background: "#1F4671",
  zIndex: 1100,
  position: "absolute",
});

const NameDropdownContainer = styled("div")({
  margin: "0 auto",
  textAlign: "left",
  position: "relative",
  maxWidth: "1400px",
  "& .dropdownList": {
    background: "#1F4671",
    display: "inline-flex",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    padding: "32px 32px 0 32px",
  },
  "& .dropdownItem": {
    padding: "0 10px 52px 10px",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "20px",
    lineHeight: "110%",
    color: "#FFFFFF",
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  "& .dropdownItemButton": {
    paddingBottom: 0,
    textTransform: "none",
    "&:hover": {
      background: "transparent",
    },
  },
  "#navbar-dropdown-item-name-logout": {
    maxWidth: "200px",
  },
});

const NameDropdown = styled("div")({
  top: "60.5px",
  left: 0,
  width: "100%",
  background: "#1F4671",
  zIndex: 1100,
  position: "absolute",
});

const StyledLoginLink = styled(Link)({
  color: "#007BBD !important",
  textAlign: "right",
  fontSize: "14px",
  fontFamily: "Poppins",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "normal",
  letterSpacing: "0.42px",
  textDecoration: "none",
  textTransform: "uppercase",
  padding: "10px 0",
  marginBottom: "4.5px",
  marginRight: "32px",
});

const useOutsideAlerter = (ref1, ref2) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target ||
        (event.target.getAttribute("class") !== "dropdownList" &&
          ref1.current &&
          !ref1.current.contains(event.target) &&
          ref2.current &&
          !ref2.current.contains(event.target))
      ) {
        const toggle = document.getElementsByClassName("navText clicked");
        if (toggle[0] && !event.target.getAttribute("class")?.includes("navText clicked")) {
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
  const { isLoggedIn, user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [clickedTitle, setClickedTitle] = useState("");
  const [openAPITokenDialog, setOpenAPITokenDialog] = useState<boolean>(false);
  const [uploaderToolOpen, setUploaderToolOpen] = useState<boolean>(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [restorePath, setRestorePath] = useState<string>(null);
  const dropdownSelection = useRef(null);
  const nameDropdownSelection = useRef(null);

  const clickableObject = navMobileList.filter(
    (item) => item.className === "navMobileItem clickable"
  );
  const clickableTitle = clickableObject.map((item) => item.name);
  const displayName = user?.firstName?.toUpperCase() || "N/A";

  clickableTitle.push(displayName);

  useOutsideAlerter(dropdownSelection, nameDropdownSelection);

  useEffect(() => {
    if (!isLoggedIn) {
      setClickedTitle("");
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    setClickedTitle("");
    const logoutStatus = await logout();
    if (logoutStatus) {
      navigate("/");
      setShowLogoutAlert(true);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };

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

  function shouldBeUnderlined(item) {
    const linkName = item.name;
    const correctPath = window.location.pathname;
    if (item.className === "navMobileItem") {
      return correctPath === item.link;
    }
    if (navbarSublists[linkName] === undefined) {
      return false;
    }
    const linkNames = Object.values(navbarSublists[linkName]).map((e: NavBarSubItem) => e.link);
    return linkNames.includes(correctPath);
  }

  useEffect(() => {
    setClickedTitle("");
  }, []);

  useEffect(() => {
    if (!location?.pathname || location?.pathname === "/") {
      setRestorePath(null);
      return;
    }

    setRestorePath(location?.pathname);
  }, [location]);

  return (
    <Nav>
      <GenericAlert open={showLogoutAlert}>
        <span>You have been logged out.</span>
      </GenericAlert>
      <NavContainer>
        <UlContainer>
          {navMobileList.map((navItem) => {
            // If the user is not logged in and the item requires a role, don't show it
            if (Array.isArray(navItem?.roles) && !navItem.roles.includes(user?.role)) {
              return null;
            }

            return (
              <LiSection key={navItem.id}>
                {navItem.className === "navMobileItem" ? (
                  <div className="navTitle directLink">
                    <NavLink
                      to={navItem.link}
                      target={navItem.link.startsWith("https://") ? "_blank" : "_self"}
                    >
                      <div
                        id={navItem.id}
                        onKeyDown={onKeyPressHandler}
                        role="button"
                        tabIndex={0}
                        className={`navText directLink ${
                          shouldBeUnderlined(navItem) ? "shouldBeUnderlined" : ""
                        }`}
                        onClick={handleMenuClick}
                      >
                        {navItem.name}
                      </div>
                    </NavLink>
                  </div>
                ) : (
                  <div className={clickedTitle === navItem.name ? "navTitleClicked" : "navTitle"}>
                    <div
                      id={navItem.id}
                      onKeyDown={onKeyPressHandler}
                      role="button"
                      tabIndex={0}
                      className={`${
                        clickedTitle === navItem.name ? "navText clicked" : "navText"
                      } ${shouldBeUnderlined(navItem) ? "shouldBeUnderlined" : ""}`}
                      onClick={handleMenuClick}
                    >
                      {navItem.name}
                    </div>
                  </div>
                )}
              </LiSection>
            );
          })}
          <LiSection className={`name-dropdown-li${isLoggedIn ? "" : " login-button"}`}>
            {isLoggedIn ? (
              <div
                id="navbar-dropdown-name-container"
                className={clickedTitle === displayName ? "navTitleClicked" : "navTitle"}
              >
                <div
                  id="navbar-dropdown-name"
                  onKeyDown={onKeyPressHandler}
                  role="button"
                  tabIndex={0}
                  className={
                    clickedTitle === displayName
                      ? "navText displayName clicked"
                      : "navText displayName"
                  }
                  onClick={handleMenuClick}
                >
                  {displayName}
                </div>
              </div>
            ) : (
              <StyledLoginLink
                id="header-navbar-login-button"
                to="/login"
                state={{ redirectURLOnLoginSuccess: restorePath }}
              >
                Login
              </StyledLoginLink>
            )}
          </LiSection>
        </UlContainer>
      </NavContainer>
      <Dropdown ref={dropdownSelection} className={clickedTitle === "" ? "invisible" : ""}>
        <NameDropdownContainer>
          <div className="dropdownList">
            {clickedTitle !== "" && clickedTitle !== displayName
              ? navbarSublists[clickedTitle]?.map((dropItem, idx) => {
                  const dropkey = `drop_${idx}`;
                  return (
                    dropItem.link && (
                      <Link
                        target={
                          dropItem.link.startsWith("https://") || dropItem.link.endsWith(".pdf")
                            ? "_blank"
                            : "_self"
                        }
                        id={dropItem.id}
                        to={dropItem.link}
                        className="dropdownItem"
                        key={dropkey}
                        onClick={() => setClickedTitle("")}
                      >
                        {dropItem.name}
                        <div className="dropdownItemText">{dropItem.text}</div>
                      </Link>
                    )
                  );
                })
              : null}
          </div>
        </NameDropdownContainer>
      </Dropdown>
      <NameDropdown
        ref={nameDropdownSelection}
        className={clickedTitle !== displayName ? "invisible" : ""}
      >
        <NameDropdownContainer>
          <div className="dropdownList">
            <span className="dropdownItem">
              <Link
                id="navbar-dropdown-item-name-user-profile"
                to={`/profile/${user?._id}`}
                className="dropdownItem"
                onClick={() => setClickedTitle("")}
              >
                User Profile
              </Link>
            </span>
            <span className="dropdownItem">
              <Button
                id="navbar-dropdown-item-name-uploader-tool"
                className="dropdownItem dropdownItemButton"
                onClick={() => setUploaderToolOpen(true)}
              >
                Uploader CLI Tool
              </Button>
            </span>
            {(user?.role === "Admin" || user?.role === "Organization Owner") && (
              <span className="dropdownItem">
                <Link
                  id="navbar-dropdown-item-name-user-manage"
                  to="/users"
                  className="dropdownItem"
                  onClick={() => setClickedTitle("")}
                >
                  Manage Users
                </Link>
              </span>
            )}
            {user?.role === "Admin" && (
              <span className="dropdownItem">
                <Link
                  id="navbar-dropdown-item-name-organization-manage"
                  to="/organizations"
                  className="dropdownItem"
                  onClick={() => setClickedTitle("")}
                >
                  Manage Organizations
                </Link>
              </span>
            )}
            {user?.role === "Admin" && (
              <span className="dropdownItem">
                <Link
                  id="navbar-dropdown-item-name-studies-manage"
                  to="/studies"
                  className="dropdownItem"
                  onClick={() => setClickedTitle("")}
                >
                  Manage Studies
                </Link>
              </span>
            )}
            {user?.role && GenerateApiTokenRoles.includes(user?.role) ? (
              <span className="dropdownItem">
                <Button
                  id="navbar-dropdown-item-name-api-token"
                  className="dropdownItem dropdownItemButton"
                  onClick={() => setOpenAPITokenDialog(true)}
                >
                  API Token
                </Button>
              </span>
            ) : null}
            <span
              id="navbar-dropdown-item-name-logout"
              role="button"
              tabIndex={0}
              className="dropdownItem"
              onClick={() => {
                setClickedTitle("");
                handleLogout();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setClickedTitle("");
                  handleLogout();
                }
              }}
            >
              Logout
            </span>
          </div>
        </NameDropdownContainer>
      </NameDropdown>
      <APITokenDialog open={openAPITokenDialog} onClose={() => setOpenAPITokenDialog(false)} />
      <UploaderToolDialog open={uploaderToolOpen} onClose={() => setUploaderToolOpen(false)} />
    </Nav>
  );
};

export default NavBar;
