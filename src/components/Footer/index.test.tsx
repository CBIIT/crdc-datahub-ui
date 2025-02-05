import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./index";

const mockUseMediaQuery = jest.fn();
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the desktop footer for large screens", () => {
    mockUseMediaQuery.mockImplementation(() => false); // Mobile + tablet = false

    const { getByTestId, queryByTestId } = render(<Footer />, {
      wrapper: (p) => <BrowserRouter {...p} />,
    });

    expect(getByTestId("desktop-footer")).toBeInTheDocument();
    expect(queryByTestId("tablet-footer")).not.toBeInTheDocument();
    expect(queryByTestId("mobile-footer")).not.toBeInTheDocument();
  });

  it("should render the tablet footer for medium screens", async () => {
    mockUseMediaQuery.mockImplementation(
      (query: string) => query === "(min-width: 768px) and (max-width: 1024px)"
    );

    const { getByTestId, queryByTestId } = render(<Footer />, {
      wrapper: (p) => <BrowserRouter {...p} />,
    });

    expect(queryByTestId("desktop-footer")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(getByTestId("tablet-footer")).toBeInTheDocument();
    });
    expect(queryByTestId("mobile-footer")).not.toBeInTheDocument();
  });

  it("should render the mobile footer for small screens", () => {
    mockUseMediaQuery.mockImplementation((query: string) => query === "(max-width: 767px)");

    const { getByTestId, queryByTestId } = render(<Footer />, {
      wrapper: (p) => <BrowserRouter {...p} />,
    });

    expect(queryByTestId("desktop-footer")).not.toBeInTheDocument();
    expect(queryByTestId("tablet-footer")).not.toBeInTheDocument();
    expect(getByTestId("mobile-footer")).toBeInTheDocument();
  });
});
