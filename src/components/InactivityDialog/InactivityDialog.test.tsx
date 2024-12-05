import { FC, useMemo } from "react";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { BrowserRouter } from "react-router-dom";
import { ContextState, Context as AuthCtx, Status as AuthStatus } from "../Contexts/AuthContext";
import InactivityDialog from "./InactivityDialog";

const logoutMock = jest.fn();

type TestParentProps = {
  /**
   * The user to use for the test parent.
   */
  isLoggedIn: boolean;
  /**
   * The children to render within the test parent.
   */
  children: React.ReactNode;
};

const TestParent: FC<TestParentProps> = ({ isLoggedIn, children }: TestParentProps) => {
  const authValue = useMemo<ContextState>(
    () => ({
      status: AuthStatus.LOADED,
      user: isLoggedIn ? ({} as User) : null, // NOTE: This component is not concerned with the user object
      isLoggedIn,
      logout: logoutMock,
    }),
    [isLoggedIn]
  );

  return (
    <BrowserRouter>
      <AuthCtx.Provider value={authValue}>{children}</AuthCtx.Provider>
    </BrowserRouter>
  );
};

describe("Accessibility", () => {
  it("should not have any violations", async () => {
    const { container } = render(<InactivityDialog />, {
      wrapper: ({ children }) => <TestParent isLoggedIn>{children}</TestParent>,
    });

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should call the session-ttl endpoint every 10 seconds", async () => {
    jest.useFakeTimers();

    const fetchSpy = jest.spyOn(window, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ ttl: 10000000 }),
    } as unknown as Response); // Component only uses the `json` method

    render(<InactivityDialog />, {
      wrapper: ({ children }) => <TestParent isLoggedIn>{children}</TestParent>,
    });

    jest.advanceTimersByTime(10001);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining(`/api/authn/session-ttl`));

    jest.advanceTimersByTime(10001);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("should call the logout function when the session has timed out without user interaction", async () => {
    jest.useFakeTimers();

    logoutMock.mockResolvedValueOnce(true);

    jest.spyOn(window, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ ttl: 0 }),
    } as unknown as Response); // Component only uses the `json` method

    render(<InactivityDialog />, {
      wrapper: ({ children }) => <TestParent isLoggedIn>{children}</TestParent>,
    });

    jest.advanceTimersByTime(10001);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Session Timeout Dialog", () => {});
