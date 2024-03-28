import { ThemeProvider } from "@mui/material";
import { CSSProperties } from "react";
import { BrowserRouter } from "react-router-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { axe } from "jest-axe";
import ReviewCommentsDialog from "./ReviewCommentsDialog";
import theme from "../../theme";

type Props<T, H> = {
  open: boolean;
  status?: T;
  lastReview: HistoryBase<H>;
  title: string;
  getColorScheme?: (status: T) => CSSProperties;
  onClose?: () => void;
};

const BaseComponent = <T, H>({
  open,
  status,
  lastReview,
  title,
  getColorScheme,
  onClose,
}: Props<T, H>) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <ReviewCommentsDialog
        open={open}
        onClose={onClose}
        lastReview={lastReview}
        status={status}
        title={title}
        getColorScheme={getColorScheme}
      />
    </BrowserRouter>
  </ThemeProvider>
);

const mockLastReview: HistoryBase<unknown> = {
  dateTime: "2023-01-01T00:00:00Z",
  reviewComment: "This is a mock comment",
  status: undefined,
  userID: ""
};

describe("ReviewCommentsDialog Accessibility Tests", () => {
  it("has no base accessibility violations", async () => {
    const data = {
      open: true,
      title: "",
      lastReview: {
        status: undefined,
        reviewComment: "",
        dateTime: "",
        userID: "",
      }
    };

    const { container } = render(<BaseComponent {...data} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when there are review comments", async () => {
    const data = {
      open: true,
      title: "Title",
      lastReview: mockLastReview
    };

    const { container } = render(<BaseComponent {...data} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

describe("ReviewCommentsDialog Tests", () => {
  it("renders the dialog with review comments correctly", () => {
    const data = {
      open: true,
      title: "",
      lastReview: mockLastReview,
      onClose: () => {}
    };

    const { getByText } = render(<BaseComponent {...data} />);

    expect(getByText(/Review Comments/)).toBeInTheDocument();
    expect(getByText(mockLastReview.reviewComment)).toBeInTheDocument();
  });

  it("provides the unformatted review date as a title attribute", () => {
    const data = {
      open: true,
      title: "",
      lastReview: mockLastReview,
      onClose: () => {}
    };
    const { getByText } = render(<BaseComponent {...data} />);

    expect(getByText(/Based on submission from/)).toHaveAttribute(
      "title",
      mockLastReview.dateTime
    );
  });

  it("closes the dialog when the close button is clicked", async () => {
    const mockClose = jest.fn();
    const data = {
      open: true,
      title: "",
      lastReview: mockLastReview,
      onClose: mockClose
    };

    const { getByTestId } = render(<BaseComponent {...data} />);

    act(() => {
      fireEvent.click(getByTestId("review-comments-dialog-close"));
    });

    await waitFor(() => expect(mockClose).toHaveBeenCalled());
  });

  it("does not render the dialog when open is false", () => {
    const data = {
      open: false,
      title: "",
      lastReview: mockLastReview,
      onClose: () => {}
    };

    const { queryByTestId, queryByText } = render(<BaseComponent {...data} />);

    expect(queryByTestId("review-comments-dialog")).not.toBeInTheDocument();
    expect(queryByText("Review Comments")).not.toBeInTheDocument();
  });

  it("renders the title passed through prop", () => {
    const customTitle = "Custom Dialog Title";
    const data = {
      open: true,
      title: customTitle,
      lastReview: mockLastReview,
      onClose: () => {},
    };

    const { getByText } = render(<BaseComponent {...data} />);
    expect(getByText(customTitle)).toBeInTheDocument();
  });

  it("has correct status passed through prop", () => {
    const mockGetColorScheme = jest.fn().mockImplementation((status) => ({
      color: status === "Approved" ? "#0D6E87" : "#E25C22",
      background: status === "Approved" ? "#CDEAF0" : "#FFDBCB",
    }));

    const data = {
      open: true,
      title: "",
      status: "Approved",
      lastReview: mockLastReview,
      onClose: () => {},
      getColorScheme: mockGetColorScheme,
    };

    render(<BaseComponent {...data} />);

    expect(mockGetColorScheme).toHaveBeenCalledWith("Approved");
  });
});
