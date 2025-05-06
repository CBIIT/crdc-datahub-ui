import { Button, styled } from "@mui/material";
import { useMemo, useRef } from "react";
import { flatMap, keyBy, map, maxBy, range } from "lodash";
import Grid from "@mui/material/Unstable_Grid2";
import { generatePath, Link } from "react-router-dom";
import { Status, useAuthContext } from "../../Contexts/AuthContext";
import { HeaderSubLinks } from "../../../config/HeaderConfig";
import SuspenseLoader from "../../SuspenseLoader";

const Dropdown = styled("div")({
  left: 0,
  right: 0,
  width: "100%",
  background: "#1F4671",
  zIndex: 1100,
  display: "block",
  position: "absolute",
  paddingTop: "35px",
  paddingBottom: "12px",
});

const StyledGridContainer = styled(Grid)({
  margin: "0 auto",
  textAlign: "left",
  position: "relative",
  maxWidth: "1400px",
  padding: "0 16px",
  "& .dropdownList": {
    padding: 0,
    marginTop: 0,
    marginBottom: "45px",
    listStyle: "none",
  },
  "& .gridItem": {
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  "& .dropdownListItem": {
    padding: 0,
    margin: 0,
    lineHeight: "22px",
    height: "22px",
  },
  "& .dropdownItem": {
    padding: "0",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "20px",
    lineHeight: "22px",
    color: "#FFFFFF",
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "pre-line",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  "& a.dropdownItem": {
    display: "inline-block",
    padding: "0",
  },
  "& .dropdownItemButton": {
    textTransform: "none",
    paddingLeft: 0,
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

  const cells = useMemo(() => {
    const positioned = (HeaderSubLinks[clickedTitle] ?? []).map((item) => {
      const [col = 0, row = 0] = item.position ?? [];
      return { item, col, row };
    });

    const bySlot = keyBy(positioned, (p) => `${p.row}-${p.col}`);

    const maxRow = positioned.length ? maxBy(positioned, "row").row : 0;

    return flatMap(range(0, maxRow + 1), (row) =>
      map(range(0, 4), (col) => bySlot[`${row}-${col}`] ?? null)
    );
  }, [clickedTitle]);

  return (
    <Dropdown ref={dropdownSelection} className={clickedTitle === "" ? "invisible" : ""}>
      <StyledGridContainer container>
        {clickedTitle !== ""
          ? cells?.map((cell, idx) => {
              const { item: dropItem } = cell || {};
              if (
                (dropItem?.permissions?.length > 0 &&
                  !dropItem?.permissions?.every(
                    (permission: AuthPermissions) => user?.permissions?.includes(permission)
                  )) ||
                !dropItem
              ) {
                // eslint-disable-next-line react/no-array-index-key
                return <Grid xs={3} key={`empty-${idx}`} />;
              }

              if (dropItem.link) {
                const to =
                  dropItem.link.includes(":") && paramGetters?.[dropItem.name]
                    ? generatePath(dropItem.link, paramGetters[dropItem.name]())
                    : dropItem.link;

                return (
                  <Grid xs={3} key={dropItem.id} className="gridItem">
                    <ul className="dropdownList">
                      <li className="dropdownListItem">
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
                      </li>
                    </ul>
                  </Grid>
                );
              }

              return (
                <Grid xs={3} key={dropItem.id} className="gridItem">
                  <ul className="dropdownList">
                    <li className="dropdownListItem">
                      <Button
                        id={dropItem.id}
                        key={dropItem.id}
                        className="dropdownItem dropdownItemButton"
                        onClick={() => onItemClick?.(dropItem.name)}
                      >
                        {dropItem.name}
                      </Button>
                    </li>
                  </ul>
                </Grid>
              );
            })
          : null}
      </StyledGridContainer>
    </Dropdown>
  );
};

export default NavbarDesktopDropdown;
