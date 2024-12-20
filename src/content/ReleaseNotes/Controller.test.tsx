import { act, render, waitFor } from "@testing-library/react";
import { Logger } from "../../utils";
import Controller from "./Controller";

jest.spyOn(Logger, "error").mockImplementation(() => jest.fn());

const mockFetchReleaseNotes = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  fetchReleaseNotes: async (...p) => mockFetchReleaseNotes(...p),
}));

const mockUsePageTitle = jest.fn();
jest.mock("../../hooks/usePageTitle", () => ({
  ...jest.requireActual("../../hooks/usePageTitle"),
  __esModule: true,
  default: (...p) => mockUsePageTitle(...p),
}));

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllTimers();
  });

  it("should set the page title 'Release Notes'", async () => {
    render(<Controller />);

    await waitFor(() => {
      expect(mockUsePageTitle).toHaveBeenCalledWith("Release Notes");
    });
  });

  it("should render the loader when fetching release notes", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("# Mock Markdown Data");
          }, 20000); // This never really needs to resolve for the test
        })
    );

    const { getByLabelText } = render(<Controller />);

    await waitFor(() => {
      expect(getByLabelText("Content Loader")).toBeInTheDocument();
    });
  });

  it("should fetch release notes on mount", async () => {
    render(<Controller />);

    await waitFor(() => {
      expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1);
    });
  });

  it("should render the notes when release notes are fetched", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("# Mock Markdown Data");
          }, 500);
        })
    );

    const { getByText, queryByText } = render(<Controller />);

    expect(queryByText(/Mock Markdown Data/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(500); // Trigger promise resolution
    });

    await waitFor(() => {
      expect(getByText(/Mock Markdown Data/)).toBeInTheDocument();
    });
  });

  it("should report the error if fetching release notes fails", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Something bad happened"));
          }, 500);
        })
    );

    render(<Controller />);

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        "ReleaseNotesController: Unable to fetch release notes.",
        new Error("Something bad happened")
      );
    });
  });

  it("should not fetch release notes if they are already loaded (double render)", async () => {
    const { rerender } = render(<Controller />);

    await waitFor(() => {
      expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1);
    });

    rerender(<Controller />);

    expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1); // One initial fetch only
  });
});
