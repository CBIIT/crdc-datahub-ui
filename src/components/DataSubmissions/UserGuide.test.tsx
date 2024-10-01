import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { axe } from "jest-axe";
import { UserGuide } from "./UserGuide";

jest.mock("../../config/globalHeaderData", () => ({
  ...jest.requireActual("../../config/globalHeaderData"),
  DataSubmissionInstructionsLink: "/data-submission-instructions",
}));

describe("Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<UserGuide />, { wrapper: Router });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Implementation Requirements", () => {
  it("should have a link to the instructions", () => {
    const { getByText, getByRole } = render(<UserGuide />, { wrapper: Router });

    const linkElement = getByRole("link", { name: /Data Submission Instructions/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toBe(getByText(/Data Submission Instructions/i));
    expect(linkElement).toHaveAttribute("href", "/data-submission-instructions");
    expect(linkElement).toHaveAttribute("target", "_blank");
  });
});
