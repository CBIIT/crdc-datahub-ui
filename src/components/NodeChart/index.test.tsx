import 'jest-axe/extend-expect';

import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import NodeChart from './index';

it('should not have any accessibility violations', async () => {
  const data = [
    { label: 'Test1', value: 50, color: '#000000' },
    { label: 'Test2', value: 25, color: '#ffffff' },
    { label: 'Test3', value: 25, color: '#3b3b3b' },
  ];
  const { container } = render(<NodeChart label="Test Chart" centerCount={3} data={data} />);

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
