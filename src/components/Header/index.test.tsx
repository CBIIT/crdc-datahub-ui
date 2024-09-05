import { FC, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import Header from "./index";
import { ContextState, Context, Status } from "../Contexts/AuthContext";

const mockUseMediaQuery = jest.fn();
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

const Parent: FC<{ children: React.ReactElement; loggedIn?: boolean; error?: string }> = ({
  children,
  loggedIn = false,
  error = null,
}) => {
  const value: ContextState = useMemo(
    () => ({
      isLoggedIn: loggedIn,
      status: error ? Status.ERROR : Status.LOADED,
      user: null,
      error,
    }),
    [loggedIn, error]
  );

  return (
    <MockedProvider>
      <BrowserRouter>
        <Context.Provider value={value}>{children}</Context.Provider>
      </BrowserRouter>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should not have accessibility violations (Logged In)", async () => {
    const { container } = render(<Header />, { wrapper: (p) => <Parent loggedIn {...p} /> });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have accessibility violations (Logged Out)", async () => {
    const { container } = render(<Header />, {
      wrapper: (p) => <Parent loggedIn={false} {...p} />,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Implementation Requirements", () => {
  it("should show the desktop header when the screen is larger than 1024px", () => {
    mockUseMediaQuery.mockReturnValue(false);

    const { getByTestId } = render(<Header />, {
      wrapper: (p) => <Parent {...p} />,
    });

    expect(getByTestId("navigation-header-desktop")).toBeInTheDocument();
  });

  it("should show the tablet and mobile header when the screen is 1024px or smaller", () => {
    mockUseMediaQuery.mockReturnValue(true);

    const { getByTestId } = render(<Header />, {
      wrapper: (p) => <Parent {...p} />,
    });

    expect(getByTestId("navigation-header-mobile")).toBeInTheDocument();
  });

  it("should always show the USA banner", () => {
    const { getByTestId } = render(<Header />, {
      wrapper: (p) => <Parent {...p} />,
    });

    expect(getByTestId("navigation-flag-banner")).toBeInTheDocument();
  });

  it("should show an error snackbar when there is an authentication error", async () => {
    render(<Header />, {
      wrapper: (p) => <Parent error="mock auth error" {...p} />,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("mock auth error", {
        variant: "error",
      });
    });
  });
});
