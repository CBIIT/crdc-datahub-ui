import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import CustomTick from "./CustomTick";

const mockTitleCase = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  titleCase: (...args) => mockTitleCase(...args),
}));

const originalTitleCase = jest.requireActual("../../utils").titleCase;
beforeEach(() => {
  mockTitleCase.mockImplementation(originalTitleCase);
});

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

  it("should render the tick label with the correct text", async () => {
    const { findByText } = render(<CustomTick x={0} y={25} payload={{ value: "node1" }} />, {
      wrapper: TestParent,
    });

    expect(await findByText("Node1")).toBeInTheDocument();
  });

  it.each<[input: string, expected: string, maxLen: number]>([
    // Default label lengths
    ["node1", "Node1", 8],
    ["sample", "Sample", 8],
    ["genomic_info", "Genomic...", 8],
    ["multiple_under_scores", "Multiple...", 8],
    // Non-default label lengths
    ["hello world", "Hello...", 5],
    ["long node name", "Long Node Name", 20],
  ])(
    "should render the original tick label %p as %p if it exceeds the label length of %p",
    async (input, expected, maxLength) => {
      const { findByText } = render(
        <CustomTick x={0} y={25} payload={{ value: input }} labelLength={maxLength} />,
        {
          wrapper: TestParent,
        }
      );

      expect(await findByText(expected)).toBeInTheDocument();
    }
  );
});
