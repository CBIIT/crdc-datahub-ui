import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import routeConfig from "./router";
import StyledNotistackAlerts from "./components/StyledNotistackAlerts";
import theme from "./theme";

const router = createBrowserRouter(routeConfig);

const App = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={10000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      Components={{
        default: StyledNotistackAlerts,
        error: StyledNotistackAlerts,
        success: StyledNotistackAlerts,
      }}
      hideIconVariant
      preventDuplicate
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <RouterProvider router={router} />
      </LocalizationProvider>
    </SnackbarProvider>
  </ThemeProvider>
);
export default App;
