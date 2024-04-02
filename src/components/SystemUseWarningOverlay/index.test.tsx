import { axe } from 'jest-axe';
import { render, waitFor } from '@testing-library/react';
import OverlayWindow from './OverlayWindow';

beforeEach(() => {
  window.localStorage.clear();
});

it('should not have any accessibility violations', async () => {
  const { container } = render(<OverlayWindow />);

  await waitFor(() => container.querySelector("#alert-dialog-title"));

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
