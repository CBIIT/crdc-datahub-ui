import { useRoutes } from 'react-router-dom';
import router from './router';
import { CssBaseline } from '@mui/material';

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
