import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import routeConfig from "./router";
import StyledNotistackAlerts from './components/StyledNotistackAlerts';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    Rejected: PaletteOptions['primary'];
    Approved: PaletteOptions['primary'] & PaletteOptions['secondary'];
  }
}

const theme = createTheme({
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1440,
    }
  },
  palette: {
    Rejected: {
      main: "#E25C22",
      contrastText: "#FFDBCB",
    },
    Approved: {
      main: "#0B7F99",
      contrastText: "#CDEAF0",
      light: "#10EBA9",
    }
  },
});

const router = createBrowserRouter(routeConfig);

function App() {
  return (
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
        preventDuplicate
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <RouterProvider router={router} />
        </LocalizationProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
export default App;
