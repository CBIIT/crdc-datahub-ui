import { useRoutes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import router from './router';

function App() {
  const content = useRoutes(router);
  return (
    <>
      <CssBaseline />
      {content}
    </>
  );
}
export default App;
