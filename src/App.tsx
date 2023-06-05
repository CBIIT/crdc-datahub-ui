import { useRoutes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import router from './router';

const theme = createTheme({
  palette: {
    background: {
      default: '#F4F8FD',
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
