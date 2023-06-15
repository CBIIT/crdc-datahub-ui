import { useRoutes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import router from './router';

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

function App() {
  const content = useRoutes(router);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}
export default App;
