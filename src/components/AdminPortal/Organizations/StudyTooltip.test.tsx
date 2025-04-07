import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import StudyTooltip from "./StudyTooltip";
import { createApprovedStudy } from "../../../utils/testUtils";

describe("Accessibility", () => {
  it("should not have any violations (no studies)", async () => {
    const { container, getByTestId, getByRole } = render(
      <StudyTooltip _id="accessibility-test" studies={[]} />
    );

    userEvent.hover(getByTestId("studies-content-accessibility-test"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have any violations (with studies)", async () => {
    const { container, getByTestId, getByRole } = render(
      <StudyTooltip
        _id="accessibility-test"
        studies={[
          createApprovedStudy({ studyName: "Study Name", studyAbbreviation: "SN" }),
          createApprovedStudy({ studyName: "Study Name 2", studyAbbreviation: "SN2" }),
        ]}
      />
    );

    userEvent.hover(getByTestId("studies-content-accessibility-test"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render a tooltip on hover", async () => {
    const { getByTestId, getByRole, queryByRole } = render(
      <StudyTooltip
        _id="basic-test"
        studies={[createApprovedStudy({ studyName: "Study Name", studyAbbreviation: "SN" })]}
      />
    );

    userEvent.hover(getByTestId("studies-content-basic-test"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    userEvent.unhover(getByTestId("studies-content-basic-test"));

    await waitFor(() => {
      expect(queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});

describe("Implementation Requirements", () => {
  it("should render 'other X' when there are more than one study", () => {
    const { getByText } = render(
      <StudyTooltip
        _id="implementation-test"
        studies={[
          createApprovedStudy({ studyName: "Study Name", studyAbbreviation: "SN" }),
          createApprovedStudy({ studyName: "Study Name 2", studyAbbreviation: "SN2" }),
          createApprovedStudy({ studyName: "Study Name 3", studyAbbreviation: "SN3" }),
          createApprovedStudy({ studyName: "Study Name 4", studyAbbreviation: "SN4" }),
        ]}
      />
    );

    expect(getByText("other 3")).toBeInTheDocument();
  });

  it("should contain the full list of studies in the tooltip", async () => {
    const studies = [
      createApprovedStudy({ studyName: "Study Name", studyAbbreviation: "SN" }),
      createApprovedStudy({ studyName: "Study Name 2", studyAbbreviation: "SN2" }),
      createApprovedStudy({ studyName: "Study Name 3", studyAbbreviation: "SN3" }),
      createApprovedStudy({ studyName: "Study Name 4", studyAbbreviation: "SN4" }),
    ];

    const { getByTestId, getByRole } = render(
      <StudyTooltip _id="implementation-test" studies={studies} />
    );

    userEvent.hover(getByTestId("studies-content-implementation-test"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    studies.forEach(({ studyName, studyAbbreviation }) => {
      // NOTE: This hardcodes the expected format of formatFullStudyName. If that changes,
      // this test will need to be updated.
      expect(getByRole("tooltip")).toHaveTextContent(`${studyName} (${studyAbbreviation})`);
    });
  });
});
