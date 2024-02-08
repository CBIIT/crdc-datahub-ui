import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import routeConfig from "./router";
import StyledNotistackAlerts from './components/StyledNotistackAlerts';

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
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        contained: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#FFF",
          borderRadius: "8px",
          textTransform: "initial",
          boxShadow: "none",
          textAlign: "center",
          zIndex: 3,
          "&.Mui-disabled": {
            background: "#B1B1B1",
            color: "#EDEDED",
            fontWeight: 700,
            border: "1.5px solid #6B7294",
            "&.MuiButton-containedInfo": {
              color: "#EDEDED",
              fontWeight: 500
            },
            "& .MuiButton-startIcon, & .MuiButton-endIcon": {
              color: "#EDEDED",
            }
          },
          "&.MuiButton-containedInfo": {
            color: "#000"
          },
          "& .MuiButton-startIcon": {
            position: "absolute",
            left: "11px",
            color: "#6B7294"
          },
          "& .MuiButton-endIcon": {
            position: "absolute",
            right: "11px",
            color: "#6B7294"
          }
        },
        containedPrimary: {
          border: "1.5px solid #08596C",
          fontWeight: 700,
          "&:hover": {
            border: "1.5px solid #08596C",
            background: "#1A8199",
            backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
          },
        },
        containedSuccess: {
          border: "1.5px solid #0A6A52",
          fontWeight: 700,
          "&:hover": {
            border: "1.5px solid #0A6A52",
            background: "#1B8369",
            backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
          },
        },
        containedError: {
          border: "1.5px solid #6C2110",
          fontWeight: 700,
          "&:hover": {
            border: "1.5px solid #6C2110",
            background: "#B34C36",
            backgroundImage: "linear-gradient(rgb(0 0 0/15%) 0 0)",
          },
        },
        containedInfo: {
          border: "1.5px solid #6B7294",
          fontWeight: 500,
          "&:hover": {
            border: "1.5px solid #6B7294",
            // background: "#C0DAF3",
          },
        },
      }
    }
  },
  palette: {
    primary: {
      main: "#1A8199",
      contrastText: "#FFF",
    },
    success: {
      main: "#1B8369",
      contrastText: "#FFF"
    },
    error: {
      main: "#B34C36",
      contrastText: "#FFF"
    },
    info: {
      main: "rgba(0,0,0,0)",
      contrastText: "#000"
    },
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
}
export default App;
