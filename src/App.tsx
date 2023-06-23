import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import routeConfig from './router';

const theme = createTheme({
  typography: {
    fontFamily: "'Nunito', sans-serif",
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
