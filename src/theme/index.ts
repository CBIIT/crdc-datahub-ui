import { createTheme } from "@mui/material";
import typography from "./typography";
import breakpoints from "./breakpoints";
import components from "./components";
import palette from "./palette";

const theme = createTheme({
  typography,
  breakpoints,
  components,
  palette,
});

export default theme;
