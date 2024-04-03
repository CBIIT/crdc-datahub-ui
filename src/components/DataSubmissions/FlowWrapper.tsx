import { Box, Typography, styled } from "@mui/material";
import { CSSProperties, FC } from "react";

type Props = {
  title: string;
  borderColor: CSSProperties["borderColor"];
  hoverColor: CSSProperties["borderColor"];
  children: React.ReactNode;
};

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "borderColor" && prop !== "hoverColor",
})<Pick<Props, "borderColor" | "hoverColor">>(
  ({ borderColor, hoverColor }) => ({
    border: `2px solid ${borderColor}`,
    borderRadius: "8px",
    paddingLeft: "35px",
    paddingTop: "24px",
    paddingRight: "26px",
    paddingBottom: "26px",
    margin: "31px",
    "&:hover": {
      borderColor: hoverColor,
      boxShadow: "0px 0px 10px 5px #00000026",
    },
  })
);

const StyledTitle = styled(Typography)({
  fontFamily: "Nunito Sans",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  color: "#187A90",
  textTransform: "uppercase",
});

const FlowWrapper: FC<Props> = ({
  title,
  borderColor,
  hoverColor,
  children,
}) => (
  <StyledBox borderColor={borderColor} hoverColor={hoverColor}>
    <StyledTitle variant="h3">{title}</StyledTitle>
    {children}
  </StyledBox>
);

export default FlowWrapper;
