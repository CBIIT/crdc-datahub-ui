import 'jest-axe/extend-expect';

import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import Page from './Page404';

it('should not have any accessibility violations', async () => {
  const { container } = render(<Page />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
