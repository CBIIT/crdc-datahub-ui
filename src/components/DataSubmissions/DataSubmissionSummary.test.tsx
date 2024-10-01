import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FC, useMemo } from "react";
import { axe } from "jest-axe";
import DataSubmissionSummary from "./DataSubmissionSummary";
import HistoryIconMap from "./DataSubmissionIconMap";

type Props = {
  dataSubmission: object;
};

const BaseComponent: FC<Props> = ({ dataSubmission = {} }: Props) => {
  const value = useMemo(
    () => ({
      dataSubmission: dataSubmission as Submission,
    }),
    [dataSubmission]
  );

  return (
    <BrowserRouter>
      <DataSubmissionSummary dataSubmission={value.dataSubmission} />
    </BrowserRouter>
  );
};

describe("DataSubmissionSummary Accessibility Tests", () => {
  it("has no accessibility violations when there are review comments", async () => {
    const dataSubmission = {
      history: [
        {
          reviewComment: "This is a review comment",
        },
      ],
    };

    const { container } = render(<BaseComponent dataSubmission={dataSubmission} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("DataSubmissionSummary Review Comments Dialog Tests", () => {
  it("renders the Review Comments button if there is a review comment", () => {
    const dataSubmission = {
      history: [
        {
          reviewComment: "This is a review comment",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);
    expect(getByText("Review Comments")).toBeVisible();
  });

  it("shows the correct content in the Review Comments dialog", async () => {
    const dataSubmission = {
      history: [
        {
          status: "Rejected",
          reviewComment: "This is the most recent review comment",
          dateTime: "2023-11-30T11:26:01Z",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Review Comments"));

    await waitFor(() => {
      expect(getByText(/This is the most recent review comment/)).toBeVisible();
    });
  });

  it("only shows the review comment for the latest 'Rejected' submission, ignoring other statuses", async () => {
    const dataSubmission = {
      history: [
        {
          status: "Rejected",
          reviewComment: "This is a rejected comment",
          dateTime: "2023-11-29T11:26:01Z",
        },
        {
          status: "Submitted",
          reviewComment: "Admin Submit - This should not be displayed",
          dateTime: "2023-11-30T11:26:01Z",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Review Comments"));

    await waitFor(() => {
      expect(getByText(/This is a rejected comment/)).toBeVisible();
      expect(() => getByText(/This should not be displayed/)).toThrow();
    });
  });

  it("closes the Review Comments dialog with the close button", async () => {
    const dataSubmission = {
      history: [
        {
          status: "Rejected",
          reviewComment: "Comment for closing test",
          dateTime: "2023-11-30T11:26:01Z",
        },
      ],
    };

    const { getByText, queryByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Review Comments"));

    await waitFor(() => expect(getByText("Comment for closing test")).toBeVisible());

    fireEvent.click(getByText("Close"));

    await waitFor(() => expect(queryByText("Comment for closing test")).not.toBeInTheDocument());
  });

  it("closes the Review Comments dialog with the close icon button", async () => {
    const dataSubmission = {
      history: [
        {
          status: "Rejected",
          reviewComment: "Another comment for close icon test",
          dateTime: "2023-11-30T11:26:01Z",
        },
      ],
    };

    const { getByText, queryByText, getByTestId } = render(
      <BaseComponent dataSubmission={dataSubmission} />
    );

    fireEvent.click(getByText("Review Comments"));

    await waitFor(() => expect(getByText("Another comment for close icon test")).toBeVisible());

    const closeButton = getByTestId("review-comments-dialog-close-icon-button");
    fireEvent.click(closeButton);

    await waitFor(() =>
      expect(queryByText("Another comment for close icon test")).not.toBeInTheDocument()
    );
  });
});

describe("DataSubmissionSummary History Dialog Tests", () => {
  it("renders the Full History button if there are historical events", () => {
    const dataSubmission = {
      history: [{ dateTime: "2023-11-23T14:26:01Z" }],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);
    expect(getByText("Full History")).toBeVisible();
  });

  it("renders the history events correctly in the dialog", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        { dateTime: "2023-11-30T11:26:01Z", status: "Submitted" },
        { dateTime: "2023-11-25T10:00:00Z", status: "In Progress" },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Full History"));

    await waitFor(() => {
      expect(getByText("SUBMITTED")).toBeVisible();
      expect(getByText("IN PROGRESS")).toBeVisible();
    });
  });

  it("renders the modal and displays history events in descending order", async () => {
    const dataSubmission = {
      history: [
        { dateTime: "2023-01-02T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-01-01T10:00:00Z", status: "New" },
        { dateTime: "2023-01-03T10:00:00Z", status: "Submitted" },
        { dateTime: "2023-01-04T10:00:00Z", status: "Rejected" },
        { dateTime: "2023-01-05T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-01-06T10:00:00Z", status: "Submitted" },
        { dateTime: "2023-01-07T10:00:00Z", status: "Released" },
        { dateTime: "2023-01-08T10:00:00Z", status: "Completed" },
        { dateTime: "2023-01-09T10:00:00Z", status: "Archived" },
      ],
    };

    const { getAllByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Full History"));

    const elements = getAllByTestId("history-item");
    expect(elements[0]).toHaveTextContent(/ARCHIVED/i);
    expect(elements[0]).toHaveTextContent("1/9/2023");
    expect(elements[1]).toHaveTextContent(/COMPLETED/i);
    expect(elements[1]).toHaveTextContent("1/8/2023");
    expect(elements[2]).toHaveTextContent(/RELEASED/i);
    expect(elements[2]).toHaveTextContent("1/7/2023");
    expect(elements[8]).toHaveTextContent(/NEW/i);
    expect(elements[8]).toHaveTextContent("1/1/2023");
  });

  it("closes the History dialog with the close button", async () => {
    const dataSubmission = {
      history: [{ dateTime: "2023-11-30T11:26:01Z", status: "Submitted" }],
    };

    const { getByText, queryByTestId } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Full History"));

    await waitFor(() => expect(queryByTestId("history-dialog")).toBeVisible());

    fireEvent.click(queryByTestId("history-dialog-close"));

    await waitFor(() => expect(queryByTestId("history-dialog")).not.toBeInTheDocument());
  });

  it("sorts the historical events by date in descending order", async () => {
    const dataSubmission = {
      history: [
        { dateTime: "2023-11-20T10:00:00Z", status: "New" },
        { dateTime: "2023-11-22T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-11-24T10:00:00Z", status: "Submitted" },
      ],
    };

    const { getByText, getAllByTestId } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Full History"));

    await waitFor(() => {
      const items = getAllByTestId("history-item-date");
      expect(new Date(items[0].textContent).getTime()).toBeGreaterThan(
        new Date(items[1].textContent).getTime()
      );
      expect(new Date(items[1].textContent).getTime()).toBeGreaterThan(
        new Date(items[2].textContent).getTime()
      );
    });
  });

  it("renders only the most recent event with an icon", () => {
    const dataSubmission = {
      history: [
        { dateTime: "2023-11-24T01:25:45Z", status: "Rejected" },
        { dateTime: "2023-11-22T15:36:01Z", status: "Completed" },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    fireEvent.click(getByText("Full History"));

    expect(getByTestId("history-item-0-icon")).toBeVisible();
    expect(() => getByTestId("history-item-1-icon")).toThrow();
  });

  it.each(Object.entries(HistoryIconMap))(
    "renders the correct icon for the status %s",
    (status, svg) => {
      const dataSubmission = {
        history: [{ dateTime: "2023-11-24T01:25:45Z", status }],
      };

      const { getByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

      fireEvent.click(getByText("Full History"));

      const icon = getByTestId("history-item-0-icon");

      expect(icon).toBeVisible();
      expect(icon).toHaveAttribute("alt", `${status} icon`);
      expect(icon).toHaveAttribute("src", svg);
    }
  );
});
