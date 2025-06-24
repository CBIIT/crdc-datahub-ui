import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import UserEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { FC } from "react";
import { axe } from "vitest-axe";

import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
} from "../../graphql";
import { render, fireEvent, waitFor } from "../../test-utils";

import { ExportNodeDataButton } from "./ExportNodeDataButton";

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

const mockDownloadBlob = vi.fn();
vi.mock("../../utils", async () => ({
  ...(await vi.importActual("../../utils")),
  downloadBlob: (...args) => mockDownloadBlob(...args),
}));

describe("Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container, getByTestId } = render(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "example-sub-id", name: "test-accessibility" }}
          nodeType={null}
        />
      </TestParent>
    );

    expect(getByTestId("export-node-data-button")).toBeEnabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have accessibility violations (disabled)", async () => {
    const { container, getByTestId } = render(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "example-sub-id", name: "test-accessibility" }}
          nodeType={null}
          disabled
        />
      </TestParent>
    );

    expect(getByTestId("export-node-data-button")).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should only execute the GET_SUBMISSION_NODES query onClick", async () => {
    const submissionID = "example-execute-test-sub-id";
    const nodeType = "participant";

    let called = false;
    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: () => {
          called = true;

          return {
            data: {
              getSubmissionNodes: {
                total: 1,
                IDPropName: null,
                properties: [],
                nodes: [{ nodeType, nodeID: "example-node-id", props: "", status: null }],
              },
            },
          };
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <ExportNodeDataButton
          submission={{ _id: submissionID, name: "test-onclick" }}
          nodeType={nodeType}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    // NOTE: This must be separate from the expect below to ensure its not called multiple times
    UserEvent.click(getByTestId("export-node-data-button"));
    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it("should handle network errors when fetching the QC Results without crashing", async () => {
    const submissionID = "random-010101-sub-id";

    const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput>[] = [
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <ExportNodeDataButton
          submission={{ _id: submissionID, name: "network-error-test" }}
          nodeType="abc"
        />
      </TestParent>
    );

    fireEvent.click(getByTestId("export-node-data-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to retrieve data for the selected node.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should handle GraphQL errors when fetching the QC Results without crashing", async () => {
    const submissionID = "example-GraphQL-level-errors-id";

    const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput>[] = [
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <ExportNodeDataButton
          submission={{ _id: submissionID, name: "graphql-error-test" }}
          nodeType="abc"
        />
      </TestParent>
    );

    fireEvent.click(getByTestId("export-node-data-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to retrieve data for the selected node.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should alert the user if there is no Node Data to export", async () => {
    const submissionID = "example-no-results-to-export-id";

    const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput>[] = [
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 0,
              IDPropName: null,
              properties: [],
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <ExportNodeDataButton
          submission={{ _id: submissionID, name: "no-nodes-test" }}
          nodeType="sample"
        />
      </TestParent>
    );

    fireEvent.click(getByTestId("export-node-data-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "There is no data to export for the selected node.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should handle invalid datasets without crashing", async () => {
    const submissionID = "example-dataset-level-errors-id";

    const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput>[] = [
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 1,
              IDPropName: null,
              properties: [],
              nodes: [
                {
                  nodeType: ["aaaa"] as unknown as string,
                  nodeID: 123 as unknown as string,
                  status: null,
                  props: "this is not JSON",
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <ExportNodeDataButton
          submission={{ _id: submissionID, name: "invalid-data" }}
          nodeType="aaaa"
        />
      </TestParent>
    );

    fireEvent.click(getByTestId("export-node-data-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Failed to export TSV for the selected node.",
        {
          variant: "error",
        }
      );
    });
  });
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should have a tooltip present on the button for Metadata", async () => {
    const { getByTestId, findByRole } = render(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "example-tooltip-id", name: "test-tooltip" }}
          nodeType="sample"
        />
      </TestParent>
    );

    UserEvent.hover(getByTestId("export-node-data-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Export submitted metadata for selected node type");
  });

  it("should have a tooltip present on the button for Data Files", async () => {
    const { getByTestId, findByRole } = render(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "data-file-tooltip-id", name: "test-tooltip" }}
          nodeType="Data File"
        />
      </TestParent>
    );

    UserEvent.hover(getByTestId("export-node-data-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Export a list of all uploaded data files");
  });

  it("should change the tooltip when the nodeType prop changes", async () => {
    const { getByTestId, findByRole, rerender } = render(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "example-tooltip-id", name: "test-tooltip" }}
          nodeType="sample"
        />
      </TestParent>
    );

    UserEvent.hover(getByTestId("export-node-data-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Export submitted metadata for selected node type");

    rerender(
      <TestParent mocks={[]}>
        <ExportNodeDataButton
          submission={{ _id: "example-tooltip-id", name: "test-tooltip" }}
          nodeType="Data File"
        />
      </TestParent>
    );

    UserEvent.hover(getByTestId("export-node-data-button"));

    expect(tooltip).toHaveTextContent("Export a list of all uploaded data files");
  });

  it.each<{ name: string; nodeType: string; date: Date; expected: string }>([
    {
      name: "Brain",
      nodeType: "participant",
      date: new Date("2024-05-25T15:20:01Z"),
      expected: "Brain_participant_202405251520.tsv",
    },
    {
      name: "long name".repeat(100),
      nodeType: "sample",
      date: new Date("2007-11-13T13:01:01Z"),
      expected: `${"long-name".repeat(100)}_sample_200711131301.tsv`,
    },
    {
      name: "",
      nodeType: "genomic_info",
      date: new Date("2019-01-13T01:12:00Z"),
      expected: "_genomic_info_201901130112.tsv",
    },
    {
      name: "non $alpha name $@!819",
      nodeType: "sample",
      date: new Date("2015-02-27T23:23:19Z"),
      expected: "non-alpha-name-819_sample_201502272323.tsv",
    },
    {
      name: "  ",
      nodeType: "sample",
      date: new Date("2018-01-01T01:01:01Z"),
      expected: "_sample_201801010101.tsv",
    },
    {
      name: "_-'a-b+c=d",
      nodeType: "sample",
      date: new Date("2031-07-04T18:22:15Z"),
      expected: "-a-bcd_sample_203107041822.tsv",
    },
    {
      name: "CRDCDH-1234",
      nodeType: "sample",
      date: new Date("2023-05-22T07:02:01Z"),
      expected: "CRDCDH-1234_sample_202305220702.tsv",
    },
    {
      name: "SPACE-AT-END ",
      nodeType: "sample",
      date: new Date("1999-03-13T04:04:03Z"),
      expected: "SPACE-AT-END_sample_199903130404.tsv",
    },
  ])(
    "should safely create the TSV filename using Submission Name, Node Type, and Exported Date",
    async ({ name, nodeType, date, expected }) => {
      vi.useFakeTimers().setSystemTime(date);

      const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput>[] = [
        {
          request: {
            query: GET_SUBMISSION_NODES,
          },
          variableMatcher: () => true,
          result: {
            data: {
              getSubmissionNodes: {
                total: 1,
                IDPropName: "a",
                properties: ["a"],
                nodes: [
                  {
                    nodeType,
                    nodeID: "example-node-id",
                    props: JSON.stringify({ a: 1 }),
                    status: null,
                  },
                ],
              },
            },
          },
        },
      ];

      const { getByTestId } = render(
        <TestParent mocks={mocks}>
          <ExportNodeDataButton
            submission={{ _id: "test-export-filename", name }}
            nodeType={nodeType}
          />
        </TestParent>
      );

      fireEvent.click(getByTestId("export-node-data-button"));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(
          expect.any(String),
          expected,
          expect.any(String)
        );
      });

      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  );
});
