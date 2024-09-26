import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import NotesView from "./NotesView";

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(<NotesView md="# Test markdown" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() => render(<NotesView md="# Test markdown" />)).not.toThrow();
  });

  it("should render the markdown content", () => {
    const { getByText } = render(<NotesView md="# Test markdown" />);

    expect(getByText("# Test markdown")).toBeInTheDocument();
  });
});
