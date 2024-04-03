import { Box, CircularProgress, styled } from "@mui/material";
import { FC } from "react";

type Props = {
  /**
   * Defines whether the loader should be fullscreen or not.
   *
   * @default true
   */
  fullscreen?: boolean;
};

const StyledBox = styled(Box, {
  shouldForwardProp: (p) => p !== "fullscreen",
})<Props>(({ fullscreen }) => ({
  position: fullscreen ? "fixed" : "absolute",
  background: "#fff",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: "9999",
}));

const SuspenseLoader: FC<Props> = ({ fullscreen = true }: Props) => (
  <StyledBox
    display="flex"
    alignItems="center"
    justifyContent="center"
    fullscreen={fullscreen}
  >
    <CircularProgress
      size={64}
      disableShrink
      thickness={3}
      aria-label="Content Loader"
    />
  </StyledBox>
);

export default SuspenseLoader;
