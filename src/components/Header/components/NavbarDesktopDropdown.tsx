import { Button, styled } from "@mui/material";
import { useMemo, useRef } from "react";
import { generatePath, Link } from "react-router-dom";
import { Status, useAuthContext } from "../../Contexts/AuthContext";
import { HeaderSubLinks } from "../../../config/HeaderConfig";
import SuspenseLoader from "../../SuspenseLoader";

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
    textTransform: "none",
    paddingLeft: "20px",
    paddingRight: "20px",
    "&:hover": {
      background: "transparent",
    },
  },
  "#navbar-dropdown-item-name-logout": {
    maxWidth: "200px",
  },
});

type Props = {
  clickedTitle: string;
  onTitleClick?: (title: string) => void;
  onItemClick?: (item: string) => void;
};

const NavbarDesktopDropdown = ({ clickedTitle, onTitleClick, onItemClick }: Props) => {
  const { user, status: AuthStatus } = useAuthContext();

  // TODO: replace with clickaway listener
  const dropdownSelection = useRef<HTMLDivElement>(null);

  const paramGetters: { [key in string]?: () => Record<string, string> } = useMemo(
    () => ({
      "User Profile": () => ({ userId: user?._id }),
    }),
    [user?._id]
  );

  if (AuthStatus === Status.LOADING) {
    return <SuspenseLoader />;
  }

  return (
    <Dropdown ref={dropdownSelection} className={clickedTitle === "" ? "invisible" : ""}>
      <NameDropdownContainer>
        <div className="dropdownList">
          {clickedTitle !== ""
            ? HeaderSubLinks?.[clickedTitle]?.map((dropItem) => {
                if (
                  dropItem?.permissions?.length > 0 &&
                  !dropItem?.permissions?.every(
                    (permission: AuthPermissions) => user?.permissions?.includes(permission)
                  )
                ) {
                  return null;
                }

                if (dropItem.link) {
                  const to =
                    dropItem.link.includes(":") && paramGetters?.[dropItem.name]
                      ? generatePath(dropItem.link, paramGetters[dropItem.name]())
                      : dropItem.link;

                  return (
                    <span className="dropdownItem" key={dropItem.id}>
                      <Link
                        target={
                          dropItem.link.startsWith("https://") || dropItem.link.endsWith(".pdf")
                            ? "_blank"
                            : "_self"
                        }
                        id={dropItem.id}
                        to={to}
                        className="dropdownItem"
                        onClick={() => onTitleClick("")}
                      >
                        {dropItem.name}
                        {dropItem.text && <div className="dropdownItemText">{dropItem.text}</div>}
                      </Link>
                    </span>
                  );
                }

                return (
                  <Button
                    id={dropItem.id}
                    key={dropItem.id}
                    className="dropdownItem dropdownItemButton"
                    onClick={() => onItemClick?.(dropItem.name)}
                  >
                    {dropItem.name}
                  </Button>
                );
              })
            : null}
        </div>
      </NameDropdownContainer>
    </Dropdown>
  );
};

export default NavbarDesktopDropdown;
