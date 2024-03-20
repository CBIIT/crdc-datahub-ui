import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

/**
 * Mocks the enqueueSnackbar function from notistack for testing
 *
 * @note You must clear all mocks after each test to avoid unexpected behavior
 * @example expect(mockEnqueue).toHaveBeenCalledWith('message', { variant: 'error' });
 * @see notistack documentation: https://notistack.com/getting-started
 */
export const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue })
}));
