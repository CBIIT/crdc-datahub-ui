import React, { HTMLProps, useEffect, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material";
import Logo from "./components/LogoMobile";
import menuClearIcon from "../../assets/header/Menu_Cancel_Icon.svg";
import rightArrowIcon from "../../assets/header/Right_Arrow.svg";
import leftArrowIcon from "../../assets/header/Left_Arrow.svg";
import { navMobileList, navbarSublists } from "../../config/globalHeaderData";
import { GenerateApiTokenRoles } from "../../config/AuthRoles";
import { useAuthContext } from "../Contexts/AuthContext";
import GenericAlert from "../GenericAlert";
import APITokenDialog from "../../content/users/APITokenDialog";
import UploaderToolDialog from "../UploaderToolDialog";

const HeaderBanner = styled("div")({
  width: "100%",
});

const HeaderContainer = styled("div")({
  margin: "0 auto",
  paddingLeft: "16px",
  boxShadow: "-0.1px 6px 9px -6px rgba(0, 0, 0, 0.5)",
  "& .headerLowerContainer": {
    display: "flex",
    margin: "16px 0 4px 0",
    height: "51px",
  },
  "& .menuButton": {
    width: "89px",
    height: "45px",
    background: "#1F4671",
    borderRadius: "5px",
    fontFamily: "Open Sans",
    fontWeight: 700,
    fontSize: "20px",
    lineHeight: "45px",
    color: "#FFFFFF",
    textAlign: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
});

const NavMobileContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "display",
})<HTMLProps<HTMLDivElement> & { display: string }>(({ display }) => ({
  display,
  position: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  width: "100%",
  zIndex: 1200,
}));

const MenuArea = styled("div")({
  height: "100%",
  width: "100%",
  display: "flex",
  "& .menuContainer": {
    background: "#ffffff",
    width: "300px",
    height: "100%",
    padding: "21px 16px",
  },
  "& .greyContainer": {
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,.2)",
  },
  "& .closeIcon": {
    height: "14px",
    marginBottom: "29px",
  },
  "& .closeIconImg": {
    float: "right",
    "&:hover": {
      cursor: "pointer",
    },
  },
  "& .backButton": {
    fontFamily: "Open Sans",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "16px",
    color: "#007BBD",
    paddingLeft: "16px",
    background: `url(${leftArrowIcon}) left no-repeat`,
    "&:hover": {
      cursor: "pointer",
    },
  },
  "& .navMobileContainer": {
    padding: "24px 0 0 0",
    "& a": {
      textDecoration: "none",
      color: "#3D4551",
    },
  },
  "& .navMobileItem": {
    width: "268px",
    padding: "8px 24px 8px 16px",
    fontFamily: "Open Sans",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "16px",
    borderTop: "1px solid #F0F0F0",
    borderBottom: "1px solid #F0F0F0",
    color: "#3D4551",
    "&:hover": {
      backgroundColor: "#f9f9f7",
    },
  },
  "& .SubItem": {
    paddingLeft: "24px",
  },
  "& .clickable": {
    background: `url(${rightArrowIcon}) 90% no-repeat`,
    cursor: "pointer",
  },
  "& .action": {
    cursor: "pointer",
  },
});

const Header = () => {
  const { isLoggedIn, user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [navMobileDisplay, setNavMobileDisplay] = useState("none");
  const [openAPITokenDialog, setOpenAPITokenDialog] = useState<boolean>(false);
  const [uploaderToolOpen, setUploaderToolOpen] = useState<boolean>(false);
  const [selectedList, setSelectedList] = useState<NavBarItem[] | NavBarSubItem[]>(navMobileList);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [restorePath, setRestorePath] = useState<string | null>(null);

  const displayName = user?.firstName || "N/A";

  const handleLogout = async () => {
    const logoutStatus = await logout?.();
    if (logoutStatus) {
      navigate("/");
      setShowLogoutAlert(true);
      setTimeout(() => setShowLogoutAlert(false), 10000);
    }
  };

  navbarSublists[displayName] = [
    {
      name: "User Profile",
      link: `/profile/${user?._id}`,
      id: "navbar-dropdown-item-user-profile",
      className: "navMobileSubItem",
    },
    {
      name: "Uploader CLI Tool",
      onClick: () => setUploaderToolOpen(true),
      id: "navbar-dropdown-item-uploader-tool",
      className: "navMobileSubItem action",
    },
    {
      name: "Logout",
      link: "/logout",
      id: "navbar-dropdown-item-logout",
      className: "navMobileSubItem",
    },
  ];

  if (user?.role === "Admin" || user?.role === "Organization Owner") {
    navbarSublists[displayName].splice(1, 0, {
      name: "Manage Users",
      link: "/users",
      id: "navbar-dropdown-item-user-manage",
      className: "navMobileSubItem",
    });
  }
  if (user?.role === "Admin") {
    navbarSublists[displayName].splice(1, 0, {
      name: "Manage Organizations",
      link: "/organizations",
      id: "navbar-dropdown-item-organization-manage",
      className: "navMobileSubItem",
    });
  }
  if (user?.role === "Admin") {
    navbarSublists[displayName].splice(1, 0, {
      name: "Manage Studies",
      link: "/studies",
      id: "navbar-dropdown-item-studies-manage",
      className: "navMobileSubItem",
    });
  }
  if (user?.role && GenerateApiTokenRoles.includes(user?.role)) {
    navbarSublists[displayName].splice(1, 0, {
      name: "API Token",
      onClick: () => setOpenAPITokenDialog(true),
      id: "navbar-dropdown-item-api-token",
      className: "navMobileSubItem action",
    });
  }

  const clickNavItem = (e) => {
    const clickTitle = e.target.innerText;
    setSelectedList(navbarSublists[clickTitle]);
  };

  useEffect(() => {
    if (!location?.pathname || location?.pathname === "/") {
      setRestorePath(null);
      return;
    }

    setRestorePath(location?.pathname);
  }, [location]);

  return (
    <>
      <GenericAlert open={showLogoutAlert}>
        <span>You have been logged out.</span>
      </GenericAlert>
      <HeaderBanner>
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
                  setNavMobileDisplay("block");
                }
              }}
              onClick={() => setNavMobileDisplay("block")}
            >
              Menu
            </div>
          </div>
        </HeaderContainer>
      </HeaderBanner>
      <NavMobileContainer display={navMobileDisplay}>
        <MenuArea>
          <div className="menuContainer">
            <div
              role="button"
              id="navbar-close-navbar-button"
              tabIndex={0}
              className="closeIcon"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setNavMobileDisplay("none");
                }
              }}
              onClick={() => setNavMobileDisplay("none")}
            >
              <img className="closeIconImg" src={menuClearIcon} alt="menuClearButton" />
            </div>
            {selectedList !== navMobileList && (
              <div
                role="button"
                id="navbar-back-to-main-menu-button"
                tabIndex={0}
                className="backButton"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSelectedList(navMobileList);
                  }
                }}
                onClick={() => setSelectedList(navMobileList)}
              >
                Main Menu
              </div>
            )}
            <div className="navMobileContainer">
              {selectedList.map((navMobileItem) => {
                // If the user is not logged in and the item requires a role, don't show it
                if (
                  "roles" in navMobileItem &&
                  Array.isArray(navMobileItem?.roles) &&
                  !navMobileItem.roles.includes(user?.role)
                ) {
                  return null;
                }

                return (
                  <React.Fragment key={`mobile_${navMobileItem.id}`}>
                    {navMobileItem.className === "navMobileItem" && (
                      <NavLink
                        id={navMobileItem.id}
                        to={navMobileItem.link}
                        target={navMobileItem.link.startsWith("https://") ? "_blank" : "_self"}
                        onClick={() => setNavMobileDisplay("none")}
                      >
                        <div className="navMobileItem">{navMobileItem.name}</div>
                      </NavLink>
                    )}
                    {navMobileItem.className === "navMobileItem clickable" && (
                      <div
                        id={navMobileItem.id}
                        role="button"
                        tabIndex={0}
                        className="navMobileItem clickable"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            clickNavItem(e);
                          }
                        }}
                        onClick={clickNavItem}
                      >
                        {navMobileItem.name}
                      </div>
                    )}
                    {navMobileItem.className === "navMobileSubItem action" &&
                    "onClick" in navMobileItem &&
                    typeof navMobileItem.onClick === "function" ? (
                      <div
                        id={navMobileItem.id}
                        role="button"
                        tabIndex={0}
                        className="navMobileItem SubItem action"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            navMobileItem.onClick();
                          }
                        }}
                        onClick={() => navMobileItem.onClick()}
                      >
                        {navMobileItem.name}
                      </div>
                    ) : null}
                    {navMobileItem.className === "navMobileSubItem" && (
                      <Link
                        id={navMobileItem.id}
                        to={navMobileItem.link}
                        target={
                          navMobileItem.link.startsWith("https://") ||
                          navMobileItem.link.endsWith(".pdf")
                            ? "_blank"
                            : "_self"
                        }
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          className="navMobileItem SubItem"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setNavMobileDisplay("none");
                              if (navMobileItem.name === "Logout") {
                                handleLogout();
                                setSelectedList(navMobileList);
                              }
                            }
                          }}
                          onClick={() => {
                            setNavMobileDisplay("none");
                            if (navMobileItem.name === "Logout") {
                              handleLogout();
                              setSelectedList(navMobileList);
                            }
                          }}
                        >
                          {navMobileItem.name}
                        </div>
                      </Link>
                    )}
                    {navMobileItem.className === "navMobileSubTitle" && (
                      <div className="navMobileItem">{navMobileItem.name}</div>
                    )}
                  </React.Fragment>
                );
              })}
              {/* eslint-disable-next-line no-nested-ternary */}
              {selectedList === navMobileList ? (
                isLoggedIn ? (
                  <div
                    id="navbar-dropdown-name"
                    role="button"
                    tabIndex={0}
                    className="navMobileItem clickable"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        clickNavItem(e);
                      }
                    }}
                    onClick={clickNavItem}
                  >
                    {displayName}
                  </div>
                ) : (
                  <Link
                    id="navbar-link-login"
                    to="/login"
                    state={{ redirectURLOnLoginSuccess: restorePath }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="navMobileItem"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setNavMobileDisplay("none");
                        }
                      }}
                      onClick={() => setNavMobileDisplay("none")}
                    >
                      Login
                    </div>
                  </Link>
                )
              ) : null}
            </div>
          </div>
          <div
            role="button"
            id="navbar-close-navbar-grey-section"
            tabIndex={0}
            className="greyContainer"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setNavMobileDisplay("none");
              }
            }}
            onClick={() => setNavMobileDisplay("none")}
            aria-label="greyContainer"
          />
        </MenuArea>
        <APITokenDialog open={openAPITokenDialog} onClose={() => setOpenAPITokenDialog(false)} />
        <UploaderToolDialog open={uploaderToolOpen} onClose={() => setUploaderToolOpen(false)} />
      </NavMobileContainer>
    </>
  );
};

export default Header;
