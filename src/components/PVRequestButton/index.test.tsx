import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { useMemo } from "react";
import { axe } from "vitest-axe";

import { submissionFactory } from "@/factories/submission/SubmissionFactory";
import { render } from "@/test-utils";

import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../Contexts/SubmissionContext";

import Button from "./index";

type TestParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: React.FC<TestParentProps> = ({ mocks = [], children }) => {
  const submissionContextState = useMemo<SubmissionCtxState>(
    () => ({
      data: {
        getSubmission: submissionFactory.build({
          _id: "mock-submission-id",
        }),
        submissionStats: null,
        getSubmissionAttributes: null,
      },
      status: SubmissionCtxStatus.LOADED,
      error: null,
    }),
    []
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <SubmissionContext.Provider value={submissionContextState}>
        {children}
      </SubmissionContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should have no violations for the button", async () => {
    const { container, getByTestId } = render(
      <Button nodeName="mock-node" offendingProperty="mock-prop" offendingValue="mock-val" />,
      {
        wrapper: TestParent,
      }
    );

    expect(getByTestId("request-pv-button")).toBeEnabled(); // Sanity check for enabled button
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the button (disabled)", async () => {
    const { container, getByTestId } = render(
      <Button
        nodeName="mock-node"
        offendingProperty="mock-prop"
        offendingValue="mock-val"
        disabled
      />,
      {
        wrapper: TestParent,
      }
    );

    expect(getByTestId("request-pv-button")).toBeDisabled(); // Sanity check for disabled
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render without crashing", async () => {
    expect(() =>
      render(
        <Button nodeName="mock-node" offendingProperty="mock-prop" offendingValue="mock-val" />,
        { wrapper: TestParent }
      )
    ).not.toThrow();
  });

  it.todo("should show a snackbar when the PV request operation fails (GraphQL Error)");

  it.todo("should show a snackbar when the PV request operation fails (Network Error)");

  it.todo("should show a snackbar when the PV request operation fails (API Error)");

  it.todo("should call the onSubmit callback when the operation is successful");

  it.todo("should not call the onSubmit callback when the PV request operation fails");
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it.todo("should have a button labeled with 'Request New PV'");

  it.todo("should have a tooltip only when the button is disabled");

  it.todo("should display a success message when the request is successful");

  it.todo("should label the dialog buttons as 'Cancel' and 'Submit'");

  it.todo("should require that the comment field is not empty");

  it.todo("should display the property and term in the dialog");

  it.todo("should disable the property and term inputs in the dialog");
});
