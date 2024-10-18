import { axe } from "jest-axe";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryDialog, { IconType } from "./index";

type MockStatuses = "uploaded" | "downloaded" | "error";

const IconMap: IconType<MockStatuses> = {
  uploaded: "upload",
  downloaded: "download",
  error: "error",
};

const BaseProps: React.ComponentProps<typeof HistoryDialog> = {
  open: true,
  preTitle: "",
  title: "",
  history: [],
  iconMap: IconMap,
  getTextColor: () => "red",
  onClose: () => {},
};

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(<HistoryDialog {...BaseProps} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() => render(<HistoryDialog {...BaseProps} />)).not.toThrow();
  });

  it("should close the dialog when the 'Close' button is clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<HistoryDialog {...BaseProps} onClose={onClose} />);

    userEvent.click(getByTestId("history-dialog-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should close the dialog when the backdrop is clicked", () => {
    const onClose = jest.fn();
    const { getAllByRole } = render(<HistoryDialog {...BaseProps} onClose={onClose} />);

    userEvent.click(getAllByRole("presentation")[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should render the correct title", () => {
    const title = "This is a Test Title";
    const { getByTestId } = render(<HistoryDialog {...BaseProps} title={title} />);

    expect(within(getByTestId("history-dialog")).getByText(title)).toBeInTheDocument();
  });

  it("should render the correct pre-title", () => {
    const preTitle = "This is a Test Pre-Title";
    const { getByTestId } = render(<HistoryDialog {...BaseProps} preTitle={preTitle} />);

    expect(within(getByTestId("history-dialog")).getByText(preTitle)).toBeInTheDocument();
  });

  it("should call getTextColor with the correct status", () => {
    const getTextColor = jest.fn();
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: new Date().toISOString(), userID: "test", reviewComment: "" },
    ];

    render(<HistoryDialog {...BaseProps} history={history} getTextColor={getTextColor} />);

    expect(getTextColor).toHaveBeenCalledWith("uploaded");
  });
});

describe("Implementation Requirements", () => {
  it("should sort the history by date in descending order", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "error", dateTime: "2022-05-19T04:12:00Z", userID: "test", reviewComment: "" }, // 1
      { status: "uploaded", dateTime: "2022-03-20T14:45:00Z", userID: "test", reviewComment: "" }, // 3
      { status: "downloaded", dateTime: "2022-04-25T11:56:00Z", userID: "test", reviewComment: "" }, // 2
    ];

    const { getByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(
      within(getByTestId("history-item-0")).getByTestId("history-item-0-status")
    ).toHaveTextContent(/error/i);

    expect(
      within(getByTestId("history-item-1")).getByTestId("history-item-1-status")
    ).toHaveTextContent(/downloaded/i);

    expect(
      within(getByTestId("history-item-2")).getByTestId("history-item-2-status")
    ).toHaveTextContent(/uploaded/i);
  });

  it("should render the parsed date for each history item", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2022-03-20T14:45:00Z", userID: "test", reviewComment: "" },
    ];

    const { getByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(
      within(getByTestId("history-item-0")).getByTestId("history-item-0-date")
    ).toHaveTextContent("3/20/2022");
  });

  it("should render corresponding icon for the first history item", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2022-03-20T14:45:00Z", userID: "test", reviewComment: "" },
      { status: "downloaded", dateTime: "2019-09-05T11:56:00Z", userID: "test", reviewComment: "" },
    ];

    const { getByTestId, queryByTestId } = render(
      <HistoryDialog {...BaseProps} history={history} />
    );

    expect(getByTestId("history-item-0-icon")).toBeInTheDocument();
    expect(getByTestId("history-item-0-icon")).toHaveAttribute("src", IconMap.uploaded);

    expect(queryByTestId("history-item-1-icon")).not.toBeInTheDocument();
  });

  it("should render the status for each history item in uppercase", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2024-09-05T14:45:00Z", userID: "test", reviewComment: "" },
    ];

    const { getByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(
      within(getByTestId("history-item-0")).getByTestId("history-item-0-status")
    ).toHaveTextContent(/UPLOADED/);
  });

  it("should have the unparsed date as a title attribute on the date element", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2024-09-05T14:45:00Z", userID: "test", reviewComment: "" },
    ];

    const { getByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(
      within(getByTestId("history-item-0")).getByTestId("history-item-0-date")
    ).toHaveAttribute("title", "2024-09-05T14:45:00Z");
  });

  it("should render the name for each history item if provided", () => {
    const history: HistoryBase<MockStatuses>[] = [
      {
        status: "uploaded",
        dateTime: "2024-09-25T14:45:00Z",
        userID: "test",
        userName: "Test User",
      },
      {
        status: "downloaded",
        dateTime: "2024-09-11T14:45:00Z",
        userID: "test",
        userName: "Another User",
      },
    ];

    const { getByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(
      within(getByTestId("history-item-0")).getByTestId("history-item-0-name")
    ).toHaveTextContent("Test User");

    expect(
      within(getByTestId("history-item-1")).getByTestId("history-item-1-name")
    ).toHaveTextContent("Another User");
  });

  it("should not render the name for each history item if not provided", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2024-09-25T14:45:00Z", userID: "test" },
      { status: "downloaded", dateTime: "2024-09-11T14:45:00Z", userID: "test" },
    ];

    const { queryByTestId } = render(<HistoryDialog {...BaseProps} history={history} />);

    expect(queryByTestId("history-item-0-name")).not.toBeInTheDocument();
    expect(queryByTestId("history-item-1-name")).not.toBeInTheDocument();
  });

  it("should fallback to #FFF if getTextColor is not a function", () => {
    const history: HistoryBase<MockStatuses>[] = [
      { status: "uploaded", dateTime: "2024-09-05T14:45:00Z", userID: "test", reviewComment: "" },
    ];

    const { getByTestId } = render(
      <HistoryDialog {...BaseProps} history={history} getTextColor={undefined} />
    );

    expect(within(getByTestId("history-item-0")).getByTestId("history-item-0-status")).toHaveStyle({
      color: "#FFF",
    });
  });
});
