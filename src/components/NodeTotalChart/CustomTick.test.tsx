import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import CustomTick from "./CustomTick";

const mockTitleCase = jest.fn().mockImplementation((str) => str);
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  titleCase: (...args) => mockTitleCase(...args),
}));

const TestParent = ({ children }) => <svg>{children}</svg>;

describe("Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<CustomTick x={0} y={25} payload={{ value: "node456" }} />, {
      wrapper: TestParent,
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("renders without crashing", () => {
    const { container } = render(<CustomTick x={0} y={25} payload={{ value: "" }} />, {
      wrapper: TestParent,
    });
    expect(container).toBeInTheDocument();
  });

  it("renders without crashing (null payload)", () => {
    const { container } = render(<CustomTick x={0} y={25} payload={null} />, {
      wrapper: TestParent,
    });
    expect(container).toBeInTheDocument();
  });
});

describe("Implementation Requirements", () => {
  it.each<[input: string, expected: string]>([
    ["node_name", "node name"],
    ["", ""],
    [" long node name ", " long node name "],
    ["genomic_info", "genomic info"],
    ["multiple_under_scores", "multiple under scores"],
    [null, undefined], // NOTE: short-circuiting null results in undefined
  ])("should call titleCase after reformatting %p to %p", (input, output) => {
    render(<CustomTick x={0} y={25} payload={{ value: input }} />, {
      wrapper: TestParent,
    });

    expect(mockTitleCase).toHaveBeenCalledWith(output);
  });
});
