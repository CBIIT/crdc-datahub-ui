import { FC } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { DataUpload } from "./DataUpload";
import { RETRIEVE_CLI_CONFIG, RetrieveCLIConfigResp } from "../../graphql";

jest.mock("../../env", () => ({
  ...jest.requireActual("../../env"),
  REACT_APP_BACKEND_API: "mocked-backend-api-url",
}));

const mockDownloadBlob = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  downloadBlob: (...args) => mockDownloadBlob(...args),
}));

const baseSubmission: Omit<Submission, "_id"> = {
  name: "",
  submitterID: "",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  createdAt: "",
  updatedAt: "",
  crossSubmissionStatus: null,
  otherSubmissions: null,
};

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks = [], children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter basename="">{children}</MemoryRouter>
  </MockedProvider>
);

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(
      <TestParent>
        <DataUpload submission={{ ...baseSubmission, _id: "accessibility-base" }} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <DataUpload submission={{ ...baseSubmission, _id: "smoke-test-id" }} />
      </TestParent>
    );

    expect(getByTestId("uploader-cli-footer")).toBeVisible();
  });

  it("should not crash when the submission is null", () => {
    const { getByTestId } = render(
      <TestParent>
        <DataUpload submission={null} />
      </TestParent>
    );

    expect(getByTestId("uploader-cli-footer")).toBeVisible();
  });

  it("should handle API network errors gracefully", async () => {
    const mocks: MockedResponse<RetrieveCLIConfigResp>[] = [
      {
        request: {
          query: RETRIEVE_CLI_CONFIG,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    const { getByTestId, getByText } = render(
      <TestParent mocks={mocks}>
        <DataUpload submission={{ ...baseSubmission, _id: "network-error-handling" }} />
      </TestParent>
    );

    // Open the dialog
    userEvent.click(getByTestId("uploader-cli-config-button"));

    // Skip filling the fields and click the download button
    userEvent.click(getByText("Download"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to download Uploader CLI config file",
        {
          variant: "error",
        }
      );
    });
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const mocks: MockedResponse<RetrieveCLIConfigResp>[] = [
      {
        request: {
          query: RETRIEVE_CLI_CONFIG,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    const { getByTestId, getByText } = render(
      <TestParent mocks={mocks}>
        <DataUpload submission={{ ...baseSubmission, _id: "graphql-error-handling" }} />
      </TestParent>
    );

    // Open the dialog
    userEvent.click(getByTestId("uploader-cli-config-button"));

    // Skip filling the fields and click the download button
    userEvent.click(getByText("Download"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to download Uploader CLI config file",
        {
          variant: "error",
        }
      );
    });
  });
});

describe("Implementation Requirements", () => {
  it("should have the Uploader CLI download dialog button", async () => {
    const { getByText, getByTestId } = render(
      <TestParent>
        <DataUpload submission={{ ...baseSubmission, _id: "cli-download-link-id" }} />
      </TestParent>
    );

    const link = getByTestId("uploader-cli-download-button");

    expect(getByText(/CLI Tool download/i)).toBeVisible();
    expect(link).toContainElement(getByText(/CLI Tool download/i));

    userEvent.click(link);

    await waitFor(() => {
      expect(getByText(/Uploader CLI Tool/i)).toBeInTheDocument();
    });
  });

  it("should have the Configuration download link", async () => {
    const mocks: MockedResponse[] = [];

    const { getByText, getByTestId } = render(
      <TestParent mocks={mocks}>
        <DataUpload submission={{ ...baseSubmission, _id: "config-download-link-id" }} />
      </TestParent>
    );
    const button = getByTestId("uploader-cli-config-button");

    expect(getByText(/download configuration file/i)).toBeVisible();
    expect(button).toBeVisible();
  });

  it("should download the Uploader CLI configuration file on click", async () => {
    let called = false;
    const mocks: MockedResponse<RetrieveCLIConfigResp>[] = [
      {
        request: {
          query: RETRIEVE_CLI_CONFIG,
        },
        variableMatcher: () => true,
        result: () => {
          called = true;

          return {
            data: {
              retrieveCLIConfig: `abc_file_one=123\nline_two=456\nline_three=789\n`,
            },
          };
        },
      },
    ];

    const { getByTestId, getByText } = render(
      <TestParent mocks={mocks}>
        <DataUpload submission={{ ...baseSubmission, _id: "cli-download-on-click" }} />
      </TestParent>
    );

    expect(called).toBe(false);

    // Open the dialog
    userEvent.click(getByTestId("uploader-cli-config-button"));

    // Skip filling the fields and click the download button
    // eslint-disable-next-line testing-library/no-unnecessary-act -- RHF is throwing an error without act
    await act(async () => {
      userEvent.click(getByText("Download"));
    });

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it.each<{ input: string; expected: string }>([
    { input: "A B C 1 2 3", expected: "cli-config-A-B-C-1-2-3.yml" },
    { input: "long name".repeat(100), expected: `cli-config-${"long-name".repeat(100)}.yml` },
    { input: "", expected: "cli-config.yml" }, // NOTE: empty string should default to "cli-config.yml"
    { input: `non $alpha name $@!819`, expected: "cli-config-non-alpha-name-819.yml" },
    { input: "  ", expected: "cli-config.yml" }, // NOTE: empty whitespace is trimmed down to nothing
    { input: `_-"a-b+c=d`, expected: "cli-config--a-bcd.yml" },
    { input: "CRDCDH-1234", expected: "cli-config-CRDCDH-1234.yml" },
    { input: "SPACE-AT-END ", expected: "cli-config-SPACE-AT-END.yml" },
  ])(
    "should safely name the Uploader CLI config file based on the submission name",
    async ({ input, expected }) => {
      const mocks: MockedResponse<RetrieveCLIConfigResp>[] = [
        {
          request: {
            query: RETRIEVE_CLI_CONFIG,
          },
          variableMatcher: () => true,
          result: {
            data: {
              retrieveCLIConfig: `abc_file_one=123\nline_two=456\nline_three=789\n`,
            },
          },
        },
      ];

      const { getByTestId, getByText } = render(
        <TestParent mocks={mocks}>
          <DataUpload submission={{ ...baseSubmission, _id: "safe-filename-test", name: input }} />
        </TestParent>
      );

      // Open the dialog
      userEvent.click(getByTestId("uploader-cli-config-button"));

      // Skip filling the fields and click the download button
      userEvent.click(getByText("Download"));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(
          expect.any(String),
          expected,
          "application/yaml"
        );
      });
    }
  );
});
