import { LoadingButton } from "@mui/lab";
import { styled } from "@mui/material";
import {
  GenericButtonProps,
  baseStyling,
  getColor,
  getHeight,
  getModeStyling,
  getWidth,
} from "./StyledButton";

const StyledLoadingButton = styled(LoadingButton, {
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

StyledLoadingButton.defaultProps = {
  disableElevation: true,
  disableRipple: true,
  disableTouchRipple: true
};

export default StyledLoadingButton;
