import {
  Button,
  type ButtonProps,
  styled,
  SxProps,
  Theme,
} from "@mui/material";
import { CSSProperties } from "react";

export const baseStyling: CSSProperties = {
  display: "flex",
  width: "137px",
  height: "44px",
  padding: "10px 11px",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: "1.5px",
  borderStyle: "solid",
  color: "#FFF",
  borderRadius: "8px",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "initial",
  boxShadow: "none",
  zIndex: 3,
};

const positiveStyling: SxProps<Theme> = {
  borderColor: "#08596C",
  background: "#1A8199",
  "&:hover": {
    borderColor: "#08596C",
    background: "#1A8199",
    backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
  },
};
const negativeStyling: SxProps<Theme> = {
  borderColor: "#6C2110",
  background: "#B34C36",
  "&:hover": {
    borderColor: "#6C2110",
    background: "#B34C36",
    backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
  },
};
const neutralStyling: SxProps<Theme> = {
  borderColor: "#6B7294",
  background: "transparent",
  color: "#000",
  fontWeight: 500,
  "&:hover": {
    borderColor: "#6B7294",
    background: "transparent",
    color: "#000",
  },
};
const successStyling: SxProps<Theme> = {
  borderColor: "#0A6A52",
  background: "#1B8369",
  "&:hover": {
    borderColor: "#0A6A52",
    background: "#1B8369",
    backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
  },
};

export type ButtonMode = "positive" | "negative" | "neutral" | "success";
export type HorizontalSize = "small" | "medium" | "large" | "xlarge";
export type VerticalSize = "small" | "medium" | "large";
export type TextColor = "white" | "black" | "blue" | "gray";

export const getColor = (color: TextColor) => {
  switch (color) {
    case "white":
      return "#FFFFFF";
    case "black":
      return "#000000";
    case "blue":
      return "#004A80";
    case "gray":
      return "#949494";
    default:
      return "inherit";
  }
};

export const getWidth = (horizontalSize: HorizontalSize) => {
  switch (horizontalSize) {
    case "small":
      return "101px";
    case "medium":
      return "128px";
    case "large":
      return "137px";
    case "xlarge":
      return "191px";
    default:
      return "128px";
  }
};

export const getHeight = (verticalSize: VerticalSize) => {
  switch (verticalSize) {
    case "small":
      return "39px";
    case "medium":
      return "44px";
    case "large":
      return "51px";
    default:
      return "44px";
  }
};

export const getModeStyling = (mode: ButtonMode) => {
  switch (mode) {
    case "positive":
      return positiveStyling;
    case "negative":
      return negativeStyling;
    case "neutral":
      return neutralStyling;
    case "success":
      return successStyling;
    default:
      return {};
  }
};

export type GenericButtonProps = {
  mode?: ButtonMode;
  horizontalSize?: HorizontalSize;
  verticalSize?: VerticalSize;
  textColor?: TextColor;
} & ButtonProps;

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "mode"
    && prop !== "horizontalSize"
    && prop !== "verticalSize"
    && prop !== "textColor",
})<GenericButtonProps>(
  ({ mode, textColor, horizontalSize, verticalSize, fullWidth }) => ({
    ...baseStyling,
    color: getColor(textColor),
    width: fullWidth ? "100%" : getWidth(horizontalSize),
    height: getHeight(verticalSize),
    ...(mode && getModeStyling(mode)),
    "&.Mui-disabled": {
      background: "#B1B1B1",
      color: "#EDEDED",
      border: "1.5px solid #6B7294",
    },
  })
);

StyledButton.defaultProps = {
  disableElevation: true,
  disableRipple: true,
  disableTouchRipple: true,
};

export default StyledButton;
