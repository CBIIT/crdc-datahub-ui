import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import StudyList from "./index";

describe("Accessibility", () => {
  it.each<[string, Partial<ApprovedStudy>[]]>([
    ["no studies", []],
    ["single study", [{ _id: "mock-1", studyName: "mock-1" }]],
    [
      "multiple studies",
      [
        { _id: "mock-1", studyName: "mock-1" },
        { _id: "mock-2", studyName: "mock-2 " },
      ],
    ],
    ["ALL study", [{ _id: "All", studyName: "All" }]],
  ])("should have no violations (%s)", async (_, studies) => {
    const { container } = render(<StudyList studies={studies} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render 'All' when the studies prop contains a study with `_id` of 'All'", () => {
    const { getByText } = render(<StudyList studies={[{ _id: "All", studyName: "All" }]} />);

    expect(getByText("All")).toBeInTheDocument();
  });

  it("should render 'None.' when the studies prop is an empty array", () => {
    const { getByText } = render(<StudyList studies={[]} />);

    expect(getByText("None.")).toBeInTheDocument();
  });

  it("should render the full list of Study Names when provided with a list of studies", () => {
    const studies = [
      { _id: "mock-1", studyName: "mock-1" },
      { _id: "mock-2", studyName: "mock-2" },
    ];

    const { getByText } = render(<StudyList studies={studies} />);

    expect(getByText("mock-1, mock-2")).toBeInTheDocument();
  });
});
