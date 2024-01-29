import { FC } from 'react';
import usePageTitle from '../../hooks/usePageTitle';

const Page404: FC = () => {
  usePageTitle("Page Not Found");

  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  );
};

export default Page404;
