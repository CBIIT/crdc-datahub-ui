import React, { FC, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import {
  ContextState,
  Context as FormCtx,
  Status as FormStatus,
} from '../Contexts/FormContext';
import StatusBar from './StatusBar';
import StatusApproved from './icons/StatusApproved.svg';
import StatusRejected from './icons/StatusRejected.svg';
import New from './icons/New.svg';
import Approved from './icons/Approved.svg';
import Rejected from './icons/Rejected.svg';
import Submitted from './icons/Submitted.svg';
import UnderReview from './icons/UnderReview.svg';

type Props = {
  data: object;
};

const BaseComponent: FC<Props> = ({ data = {} } : Props) => {
  const value = useMemo<ContextState>(() => ({
    data: data as ApplicationResponse,
    status: FormStatus.LOADED
  }), [data]);

  return (
    <BrowserRouter>
      <FormCtx.Provider value={value}>
        <StatusBar />
      </FormCtx.Provider>
    </BrowserRouter>
  );
};

describe("StatusBar > General Tests", () => {
  it("renders the base elements", () => {
    const { getByTestId, getByText } = render(<BaseComponent data={{}} />);

    expect(getByText("Status:")).toBeVisible();
    expect(getByTestId("status-bar-status")).toBeInTheDocument();
    expect(getByText("Last updated:")).toBeVisible();
    expect(getByTestId("status-bar-last-updated")).toBeInTheDocument();
  });

  it("should not render the review comments button by default", () => {
    const { getByText } = render(<BaseComponent data={{}} />);

    expect(() => getByText("Review Comments")).toThrow();
    expect(() => getByText("Full History")).toThrow();
  });

  // NOTE: We aren't using the root level reviewComment attribute, only the history level ones
  // So we're testing against it's usage here
  it("does not render the comments button for the Application.reviewComment attribute", () => {
    const data = {
      reviewComment: "This is a review comment",
    };

    const { getByText } = render(<BaseComponent data={data} />);

    expect(() => getByText("Review Comments")).toThrow();
  });

  it("renders the comments button only if there are review comments", () => {
    const data = {
      history: [{
        reviewComment: "This is a review comment",
      }],
    };

    const { getByText } = render(<BaseComponent data={data} />);
    const btn = getByText("Review Comments");

    expect(btn).toBeVisible();
    expect(btn).toHaveAttribute("aria-label", "Review Comments");
  });

  it("defaults the last updated to N/A for new applications", () => {
    const data = {
      status: "New",
      updatedAt: "2023-06-20T09:13:58",
    };

    const { getByTestId } = render(<BaseComponent data={data} />);

    expect(getByTestId("status-bar-last-updated")).toHaveTextContent("N/A");
  });

  const invalidDates = ["", " ", "0-0-0", "YYYY-06-20T09:13:58", "-06-12T09:13:58.000Z", "12023-06-20T09:13:58"];
  it.each(invalidDates)("defaults the last updated date to N/A for invalid date %p", (date) => {
    const data = {
      status: "In Progress",
      updatedAt: date,
    };

    const { getByTestId } = render(<BaseComponent data={data} />);

    expect(getByTestId("status-bar-last-updated")).toHaveTextContent("N/A");
  });

  const validDates = [["2019-11-23T14:26:01", "11/23/2019"], ["2027-04-24T19:01:09", "4/24/2027"], ["2031-01-07T19:01:09", "1/7/2031"]];
  it.each(validDates)("formats the last updated date %p as %p", (input, output) => {
    const data = {
      status: "In Progress",
      updatedAt: input,
    };

    const { getByTestId } = render(<BaseComponent data={data} />);

    expect(getByTestId("status-bar-last-updated")).toHaveTextContent(output);
  });

  const statusWithIcon = [["Rejected", StatusRejected], ["Approved", StatusApproved]];
  it.each(statusWithIcon)("renders the correct status bar SVG icon for status %p", (status, svg) => {
    const { getByTestId } = render(<BaseComponent data={{ status }} />);
    const icon = getByTestId("status-bar-icon");

    expect(icon).toBeVisible();
    expect(icon).toHaveAttribute("alt", `${status} icon`);
    expect(icon).toHaveAttribute("src", svg);
  });

  const statusWithoutIcon = ["In Progress", "Submitted", "In Review", "New"];
  it.each(statusWithoutIcon)("does not render an icon for status %p", (status) => {
    const { getByTestId } = render(<BaseComponent data={{ status }} />);

    expect(() => getByTestId("status-bar-icon")).toThrow();
  });
});

describe("StatusBar > Comments Modal Tests", () => {
  it("does not render the modal if there are no comments in the history", () => {
    const data = {
      history: [
        { reviewComment: "", dateTime: "2019-11-23T14:26:01", },
        { reviewComment: "", dateTime: "2019-11-26T15:36:01", },
        { reviewComment: "", dateTime: "2019-11-30T01:26:01", },
      ],
    };

    const { getByText } = render(<BaseComponent data={data} />);

    expect(() => getByText("Review Comments")).toThrow();
  });

  it("renders the modal when there historical comments", async () => {
    const data = {
      history: [{
        reviewComment: "abc 123",
      }],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(getByTestId("status-bar-review-dialog")).toBeVisible();
  });

  it("renders the most recent comment by date", async () => {
    const data = {
      history: [
        { reviewComment: "not visible", dateTime: "2019-11-23T14:26:01", },
        { reviewComment: "not visible", dateTime: "2019-11-26T15:36:01", },
        { reviewComment: "this is the most recent comment", dateTime: "2019-11-30T01:26:01", },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(getByTestId("status-bar-review-dialog")).toBeVisible();
    expect(getByText(/BASED ON SUBMISSION FROM 11\/30\/2019:/i)).toBeVisible();
    expect(getByText(data.history[2].reviewComment)).toBeVisible();
  });

  it("uses the most recent comment regardless of sorting", async () => {
    const data = {
      history: [
        { reviewComment: "not visible", dateTime: "2023-11-30T01:25:45", },
        { reviewComment: "this is the most recent comment", dateTime: "2023-12-30T01:26:01", },
        { reviewComment: "not visible", dateTime: "2023-11-23T14:26:01", },
        { reviewComment: "not visible", dateTime: "2023-11-26T15:36:01", },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(getByTestId("status-bar-review-dialog")).toBeVisible();
    expect(getByText(/BASED ON SUBMISSION FROM 12\/30\/2023:/i)).toBeVisible();
    expect(getByText(data.history[1].reviewComment)).toBeVisible();
  });

  it("uses the last event with a comment", async () => {
    const data = {
      history: [
        { reviewComment: "", dateTime: "2023-11-23T14:26:01", },
        { reviewComment: "not the latest, but has a comment", dateTime: "2023-11-26T15:36:01", },
        { reviewComment: "", dateTime: "2023-11-30T01:25:45", },
        { reviewComment: "", dateTime: "2023-12-30T01:26:01", },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(getByTestId("status-bar-review-dialog")).toBeVisible();
    expect(getByText(/BASED ON SUBMISSION FROM 11\/26\/2023:/i)).toBeVisible();
    expect(getByText(data.history[1].reviewComment)).toBeVisible();
  });

  it("provides the unformatted review date as a title attribute", () => {
    const data = {
      history: [{ dateTime: "2009-11-24T01:25:45", reviewComment: "abc comment 123" }],
    };

    const { getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(getByText(/BASED ON SUBMISSION FROM 11\/24\/2009:/i)).toHaveAttribute("title", data.history[0].dateTime);
  });

  it("closes the modal with the Close button", async () => {
    const data = {
      history: [{ reviewComment: "comment" }],
    };

    const { queryByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Review Comments"));
    });

    expect(queryByTestId("status-bar-review-dialog")).toBeVisible();

    act(() => {
      fireEvent.click(queryByTestId("status-bar-dialog-close"));
    });

    await waitFor(() => expect(queryByTestId("status-bar-review-dialog")).toBeNull());
  });
});

describe("StatusBar > History Modal Tests", () => {
  it("does not render the modal if there are no historical events", () => {
    const data = {
      history: [],
    };

    const { getByText } = render(<BaseComponent data={data} />);

    expect(() => getByText("Full History")).toThrow();
  });

  it("renders the modal if there are historical events", () => {
    const data = {
      history: [{ dateTime: "2019-11-23T14:26:01", status: "New" }],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    expect(getByTestId("status-bar-history-dialog")).toBeVisible();
  });

  it("sorts the historical events by date in descending order", () => {
    const data = {
      history: [
        { dateTime: "2023-11-24T01:25:45", status: "Rejected" },
        { dateTime: "2023-11-20T14:26:01", status: "New" },
        { dateTime: "2023-11-22T15:36:01", status: "In Progress" },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    const elements = getByTestId("status-bar-history-dialog").querySelectorAll("li");
    expect(elements[0]).toHaveTextContent(/Rejected/i);
    expect(elements[0]).toHaveTextContent("11/24/2023");
    expect(elements[1]).toHaveTextContent(/In Progress/i);
    expect(elements[1]).toHaveTextContent("11/22/2023");
    expect(elements[2]).toHaveTextContent(/New/i);
    expect(elements[2]).toHaveTextContent("11/20/2023");
  });

  it("renders only the most recent event with an icon", () => {
    const data = {
      history: [
        { dateTime: "2023-11-24T01:25:45", status: "Rejected" },
        { dateTime: "2023-11-22T15:36:01", status: "Completed" },
      ],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    expect(getByTestId("status-bar-history-item-0-icon")).toBeVisible();
    expect(() => getByTestId("status-bar-history-item-1-icon")).toThrow();
  });

  const noIconStatuses = ["In Progress"];
  it.each(noIconStatuses)("does not render an icon for status %s", (status) => {
    const data = {
      history: [{ dateTime: "2023-11-24T01:25:45", status }],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    expect(() => getByTestId("status-bar-history-item-0-icon")).toThrow();
  });

  const statusesWithIcons = [["New", New], ["Submitted", Submitted], ["Approved", Approved], ["Rejected", Rejected], ["In Review", UnderReview]];
  it.each(statusesWithIcons)("renders the correct icon for the status %s", (status, svg) => {
    const data = {
      history: [{ dateTime: "2023-11-24T01:25:45", status }],
    };

    const { getByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    const icon = getByTestId("status-bar-history-item-0-icon");

    expect(icon).toBeVisible();
    expect(icon).toHaveAttribute("alt", `${status} icon`);
    expect(icon).toHaveAttribute("src", svg);
  });

  it("provides the unformatted event date as a title attribute", () => {
    const data = {
      history: [{ dateTime: "2009-11-24T01:25:45", status: "Rejected" }],
    };

    const { getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    expect(getByText("11/24/2009")).toHaveAttribute("title", data.history[0].dateTime);
  });

  it("closes the modal with the Close button", async () => {
    const data = {
      history: [{ dateTime: "2009-11-24T01:25:45", status: "Rejected" }],
    };

    const { queryByTestId, getByText } = render(<BaseComponent data={data} />);

    act(() => {
      fireEvent.click(getByText("Full History"));
    });

    expect(queryByTestId("status-bar-history-dialog")).toBeVisible();

    act(() => {
      fireEvent.click(queryByTestId("status-bar-dialog-close"));
    });

    await waitFor(() => expect(queryByTestId("status-bar-history-dialog")).toBeNull());
  });
});
