import React, { FC, useMemo } from "react";
import userEvent from "@testing-library/user-event";
import { render, waitFor } from "@testing-library/react";
import { isEqual } from "lodash";
import { BrowserRouter } from "react-router-dom";
import { axe } from "jest-axe";
import DataSubmissionSummary from "./DataSubmissionSummary";
import HistoryIconMap from "./DataSubmissionIconMap";

type Props = {
  dataSubmission: RecursivePartial<Submission>;
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
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          reviewComment: "This is a review comment",
          status: "New",
          dateTime: "",
          userID: "",
        },
      ],
    };

    const { container } = render(<BaseComponent dataSubmission={dataSubmission} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("renders all property labels and corresponding values", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      name: "Test Submission",
      intention: "Test Intention" as SubmissionIntention,
      submitterName: "Submitter Test",
      collaborators: [
        {
          collaboratorID: "col-1",
          collaboratorName: "",
          Organization: {
            orgID: "",
            orgName: "",
            status: "Active",
            createdAt: "",
            updateAt: "",
          },
          permission: "Can View",
        },
        {
          collaboratorID: "col-2",
          collaboratorName: "",
          Organization: {
            orgID: "",
            orgName: "",
            status: "Active",
            createdAt: "",
            updateAt: "",
          },
          permission: "Can View",
        },
      ],
      studyAbbreviation: "AAAAAAAAAAA",
      dataCommons: "Test Commons",
      organization: {
        _id: "",
        name: "Test Organization",
      },
      conciergeName: "Test Concierge",
      conciergeEmail: "concierge@test.com",
    };

    const { getByText, getByLabelText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    // Check labels
    expect(getByText("Submission Name")).toBeVisible();
    expect(getByText("Submission Type")).toBeVisible();
    expect(getByText("Submitter")).toBeVisible();
    expect(getByText("Collaborators")).toBeVisible();
    expect(getByText("Study")).toBeVisible();
    expect(getByText("Data Commons")).toBeVisible();
    expect(getByText("Organization")).toBeVisible();
    expect(getByText("Primary Contact")).toBeVisible();

    // Check values
    expect(getByText("Test Submi...")).toBeVisible();
    expect(getByText("Test Intention")).toBeVisible(); // Not truncated
    expect(getByText("Submitter...")).toBeVisible();
    expect(getByText("AAAAAAAAAA...")).toBeVisible();
    expect(getByText("Test Commo...")).toBeVisible();
    expect(getByText("Test Organ...")).toBeVisible();
    expect(getByText("Test Conci...")).toBeVisible();

    expect(getByText("2")).toBeVisible();

    const emailLink = getByLabelText("Email Primary Contact");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", "mailto:concierge@test.com");
  });

  it("renders the Collaborators property with correct number and tooltip", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      collaborators: [
        {
          collaboratorID: "1",
          collaboratorName: "",
          Organization: {
            orgID: "",
            orgName: "",
            status: "Active",
            createdAt: "",
            updateAt: "",
          },
          permission: "Can View",
        },
        {
          collaboratorID: "2",
          collaboratorName: "",
          Organization: {
            orgID: "",
            orgName: "",
            status: "Active",
            createdAt: "",
            updateAt: "",
          },
          permission: "Can View",
        },
        {
          collaboratorID: "3",
          collaboratorName: "",
          Organization: {
            orgID: "",
            orgName: "",
            status: "Active",
            createdAt: "",
            updateAt: "",
          },
          permission: "Can View",
        },
      ],
    };

    const { getByTestId } = render(<BaseComponent dataSubmission={dataSubmission} />);

    // Hover to trigger the tooltip
    userEvent.hover(getByTestId("collaborators-button"));

    await waitFor(() => {
      expect(getByTestId("collaborators-button-tooltip")).toBeVisible();
      expect(getByTestId("collaborators-button-tooltip")).toHaveTextContent(
        "Click to add new collaborators or view existing ones."
      );
    });
  });

  it("renders the Primary Contact with name and email link when email is provided", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      conciergeName: "Test Concierge",
      conciergeEmail: "concierge@test.com",
    };

    const { getByText, getByLabelText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    expect(getByText("Primary Contact")).toBeVisible();
    expect(getByText("Test Conci...")).toBeVisible();

    const emailLink = getByLabelText("Email Primary Contact");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", "mailto:concierge@test.com");
  });

  it("renders the Primary Contact with name only when email is not provided", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      conciergeName: "Test Concierge",
      conciergeEmail: null,
    };

    const { getByText, queryByLabelText } = render(
      <BaseComponent dataSubmission={dataSubmission} />
    );

    expect(getByText("Primary Contact")).toBeVisible();
    expect(getByText("Test Conci...")).toBeVisible();

    const emailLink = queryByLabelText("Email Primary Contact");
    expect(emailLink).toBeNull();
  });
});

describe("DataSubmissionSummary Memoization Tests", () => {
  it("does not re-render when props are equal due to memoization", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      name: "Test Submission",
    };

    const renderSpy = jest.fn();

    // Create a wrapper component that increments the renderSpy
    const MemoizedComponent = ({ dataSubmission }: Props) => {
      React.useEffect(() => {
        renderSpy();
      });
      return <DataSubmissionSummary dataSubmission={dataSubmission as Submission} />;
    };

    // Wrap the MemoizedComponent with React.memo and custom comparison
    const MemoizedComponentWithMemo = React.memo(MemoizedComponent, (prevProps, nextProps) =>
      isEqual(prevProps, nextProps)
    );

    const { rerender } = render(
      <BrowserRouter>
        <MemoizedComponentWithMemo dataSubmission={dataSubmission} />
      </BrowserRouter>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with the same props
    rerender(
      <BrowserRouter>
        <MemoizedComponentWithMemo dataSubmission={dataSubmission} />
      </BrowserRouter>
    );

    // renderSpy should not have been called again
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it("re-renders when props change due to memoization", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      name: "Test Submission",
    };

    const newDataSubmission: RecursivePartial<Submission> = {
      name: "Updated Submission",
    };

    const renderSpy = jest.fn();

    const MemoizedComponent = ({ dataSubmission }: Props) => {
      React.useEffect(() => {
        renderSpy();
      });
      return <DataSubmissionSummary dataSubmission={dataSubmission as Submission} />;
    };

    const MemoizedComponentWithMemo = React.memo(MemoizedComponent, (prevProps, nextProps) =>
      isEqual(prevProps, nextProps)
    );

    const { rerender } = render(
      <BrowserRouter>
        <MemoizedComponentWithMemo dataSubmission={dataSubmission} />
      </BrowserRouter>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with different props
    rerender(
      <BrowserRouter>
        <MemoizedComponentWithMemo dataSubmission={newDataSubmission} />
      </BrowserRouter>
    );

    // renderSpy should have been called again
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});

describe("DataSubmissionSummary Review Comments Dialog Tests", () => {
  it("renders the Review Comments button if there is a review comment", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          reviewComment: "This is a review comment",
          status: "New",
          dateTime: "",
          userID: "",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);
    expect(getByText("Review Comments")).toBeVisible();
  });

  it("shows the correct content in the Review Comments dialog", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          status: "Rejected",
          reviewComment: "This is the most recent review comment",
          dateTime: "2023-11-30T11:26:01Z",
          userID: "",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Review Comments"));

    await waitFor(() => {
      expect(getByText(/This is the most recent review comment/)).toBeVisible();
    });
  });

  it("only shows the review comment for the latest 'Rejected' submission, ignoring other statuses", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          status: "Rejected",
          reviewComment: "This is a rejected comment",
          dateTime: "2023-11-29T11:26:01Z",
          userID: "",
        },
        {
          status: "Submitted",
          reviewComment: "Admin Submit - This should not be displayed",
          dateTime: "2023-11-30T11:26:01Z",
          userID: "",
        },
      ],
    };

    const { getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Review Comments"));

    await waitFor(() => {
      expect(getByText(/This is a rejected comment/)).toBeVisible();
      expect(() => getByText(/This should not be displayed/)).toThrow();
    });
  });

  it("closes the Review Comments dialog with the close button", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          status: "Rejected",
          reviewComment: "Comment for closing test",
          dateTime: "2023-11-30T11:26:01Z",
          userID: "",
        },
      ],
    };

    const { getByText, queryByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Review Comments"));

    await waitFor(() => expect(getByText("Comment for closing test")).toBeVisible());

    userEvent.click(getByText("Close"));

    await waitFor(() => expect(queryByText("Comment for closing test")).not.toBeInTheDocument());
  });

  it("closes the Review Comments dialog with the close icon button", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          status: "Rejected",
          reviewComment: "Another comment for close icon test",
          dateTime: "2023-11-30T11:26:01Z",
          userID: "",
        },
      ],
    };

    const { getByText, queryByText, getByTestId } = render(
      <BaseComponent dataSubmission={dataSubmission} />
    );

    userEvent.click(getByText("Review Comments"));

    await waitFor(() => expect(getByText("Another comment for close icon test")).toBeVisible());

    const closeButton = getByTestId("review-comments-dialog-close-icon-button");
    userEvent.click(closeButton);

    await waitFor(() =>
      expect(queryByText("Another comment for close icon test")).not.toBeInTheDocument()
    );
  });
});

describe("DataSubmissionSummary History Dialog Tests", () => {
  it("renders the Full History button if there are historical events", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        {
          dateTime: "2023-11-23T14:26:01Z",
          status: "New",
          userID: "",
        },
      ],
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

    userEvent.click(getByText("Full History"));

    await waitFor(() => {
      expect(getByText("SUBMITTED")).toBeVisible();
      expect(getByText("IN PROGRESS")).toBeVisible();
    });
  });

  it("renders the modal and displays history events in descending order", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        { dateTime: "2023-01-02T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-01-01T10:00:00Z", status: "New" },
        { dateTime: "2023-01-03T10:00:00Z", status: "Submitted" },
        { dateTime: "2023-01-04T10:00:00Z", status: "Rejected" },
        { dateTime: "2023-01-05T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-01-06T10:00:00Z", status: "Submitted" },
        { dateTime: "2023-01-07T10:00:00Z", status: "Released" },
        { dateTime: "2023-01-08T10:00:00Z", status: "Completed" },
      ],
    };

    const { getAllByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Full History"));

    const dates = getAllByTestId(/history-item-\d-date/i);
    const statuses = getAllByTestId(/history-item-\d-status/i);
    expect(statuses[0]).toHaveTextContent(/COMPLETED/i);
    expect(dates[0]).toHaveTextContent("1/8/2023");
    expect(statuses[1]).toHaveTextContent(/RELEASED/i);
    expect(dates[1]).toHaveTextContent("1/7/2023");
    expect(statuses[7]).toHaveTextContent(/NEW/i);
    expect(dates[7]).toHaveTextContent("1/1/2023");
  });

  it("closes the History dialog with the close button", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [{ dateTime: "2023-11-30T11:26:01Z", status: "Submitted" }],
    };

    const { getByText, queryByTestId } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Full History"));

    await waitFor(() => expect(queryByTestId("history-dialog")).toBeVisible());

    userEvent.click(queryByTestId("history-dialog-close"));

    await waitFor(() => expect(queryByTestId("history-dialog")).not.toBeInTheDocument());
  });

  it("sorts the historical events by date in descending order", async () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        { dateTime: "2023-11-20T10:00:00Z", status: "New" },
        { dateTime: "2023-11-22T10:00:00Z", status: "In Progress" },
        { dateTime: "2023-11-24T10:00:00Z", status: "Submitted" },
      ],
    };

    const { getByText, getAllByTestId } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Full History"));

    await waitFor(() => {
      const items = getAllByTestId(/history-item-\d-date/);
      expect(new Date(items[0].textContent).getTime()).toBeGreaterThan(
        new Date(items[1].textContent).getTime()
      );
      expect(new Date(items[1].textContent).getTime()).toBeGreaterThan(
        new Date(items[2].textContent).getTime()
      );
    });
  });

  it("renders only the most recent event with an icon", () => {
    const dataSubmission: RecursivePartial<Submission> = {
      history: [
        { dateTime: "2023-11-24T01:25:45Z", status: "Rejected" },
        { dateTime: "2023-11-22T15:36:01Z", status: "Completed" },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

    userEvent.click(getByText("Full History"));

    expect(getByTestId("history-item-0-icon")).toBeVisible();
    expect(() => getByTestId("history-item-1-icon")).toThrow();
  });

  it.each(Object.entries(HistoryIconMap))(
    "renders the correct icon for the status %s",
    (status, svg) => {
      const dataSubmission: RecursivePartial<Submission> = {
        history: [{ dateTime: "2023-11-24T01:25:45Z", status: status as SubmissionStatus }],
      };

      const { getByTestId, getByText } = render(<BaseComponent dataSubmission={dataSubmission} />);

      userEvent.click(getByText("Full History"));

      const icon = getByTestId("history-item-0-icon");

      expect(icon).toBeVisible();
      expect(icon).toHaveAttribute("alt", `${status} icon`);
      expect(icon).toHaveAttribute("src", svg);
    }
  );
});
