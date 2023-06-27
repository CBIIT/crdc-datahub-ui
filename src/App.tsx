import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import routeConfig from './router';

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', 'Rubik', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Public Sans', sans-serif",
        },
      },
    },
  },
});

const router = createBrowserRouter(
  routeConfig,
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
export default App;
