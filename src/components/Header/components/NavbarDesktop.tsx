import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material";
import { useAuthContext } from "../../Contexts/AuthContext";
import GenericAlert from "../../GenericAlert";
import { HeaderLinks, HeaderSubLinks } from "../../../config/HeaderConfig";
import APITokenDialog from "../../APITokenDialog";
import UploaderToolDialog from "../../UploaderToolDialog";
import NavbarDesktopDropdown from "./NavbarDesktopDropdown";
import { Logger } from "../../../utils";

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

const useOutsideAlerter = (ref1: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target ||
        (event.target.getAttribute("class") !== "dropdownList" &&
          ref1.current &&
          !ref1.current.contains(event.target))
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
  }, [ref1]);
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
  const dropdownSelection = useRef<HTMLDivElement>(null);

  const clickableObject = HeaderLinks.filter(
    (item) => item.className === "navMobileItem clickable"
  );
  const clickableTitle = clickableObject.map((item) => item.name);
  const displayName = user?.firstName?.toUpperCase() || "N/A";

  clickableTitle.push(displayName);

  const handleLogout = async () => {
    setClickedTitle("");
    const logoutStatus = await logout();
    if (logoutStatus) {
      navigate("/");
      setShowLogoutAlert(true);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };

  const handleItemClick = (item: string) => {
    switch (item) {
      case "Uploader CLI Tool":
        setUploaderToolOpen(true);
        break;
      case "API Token":
        setOpenAPITokenDialog(true);
        break;
      case "Logout":
        handleLogout();
        break;
      default:
        Logger.error(`NavbarDesktop.tsx: Unknown sub-navigation item clicked ${item}`);
    }
  };

  const handleMenuClick = (e) => {
    if (e.target.textContent === clickedTitle || !clickableTitle.includes(e.target.textContent)) {
      setClickedTitle("");
    } else {
      setClickedTitle(e.target.textContent);
    }
  };

  const onKeyPressHandler = (e) => {
    if (e.key === "Enter") {
      handleMenuClick(e);
    }
  };

  const shouldBeUnderlined = (item) => {
    const linkName = item.name;
    const correctPath = window.location.pathname;
    if (item.className === "navMobileItem") {
      return correctPath === item.link;
    }
    if (HeaderSubLinks[linkName] === undefined) {
      return false;
    }
    const linkNames = Object.values(HeaderSubLinks[linkName]).map((e: NavBarSubItem) => e.link);
    return linkNames.includes(correctPath);
  };

  useOutsideAlerter(dropdownSelection);

  useEffect(() => {
    if (!isLoggedIn) {
      setClickedTitle("");
    }
  }, [isLoggedIn]);

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
          {HeaderLinks.map((navItem: NavBarItem) => {
            if (
              navItem?.permissions?.length > 0 &&
              !navItem?.permissions?.every(
                (permission: AuthPermissions) => user?.permissions?.includes(permission)
              )
            ) {
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
                        role="button"
                        tabIndex={0}
                        className={`navText directLink ${
                          shouldBeUnderlined(navItem) ? "shouldBeUnderlined" : ""
                        }`}
                        onKeyDown={onKeyPressHandler}
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
                      role="button"
                      tabIndex={0}
                      className={`${
                        clickedTitle === navItem.name ? "navText clicked" : "navText"
                      } ${shouldBeUnderlined(navItem) ? "shouldBeUnderlined" : ""}`}
                      onKeyDown={onKeyPressHandler}
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
                  role="button"
                  tabIndex={0}
                  className={
                    clickedTitle === displayName
                      ? "navText displayName clicked"
                      : "navText displayName"
                  }
                  onKeyDown={onKeyPressHandler}
                  onClick={handleMenuClick}
                >
                  {displayName}
                </div>
              </div>
            ) : (
              <StyledLoginLink
                id="header-navbar-login-button"
                to="/login"
                state={{ redirectState: restorePath }}
              >
                Login
              </StyledLoginLink>
            )}
          </LiSection>
        </UlContainer>
      </NavContainer>
      <NavbarDesktopDropdown
        clickedTitle={clickedTitle}
        onTitleClick={(title) => setClickedTitle(title)}
        onItemClick={(item) => handleItemClick(item)}
      />
      <APITokenDialog open={openAPITokenDialog} onClose={() => setOpenAPITokenDialog(false)} />
      <UploaderToolDialog open={uploaderToolOpen} onClose={() => setUploaderToolOpen(false)} />
    </Nav>
  );
};

export default NavBar;
