import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import Loader from './index';

describe('Loader Accessibility Tests', () => {
  it('fullscreen accessibility', async () => {
    const { container } = render(<Loader fullscreen />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('absolute to container accessibility', async () => {
    const { container } = render(<Loader fullscreen={false} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
