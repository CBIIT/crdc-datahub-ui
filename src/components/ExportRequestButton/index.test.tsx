import { FC, useMemo } from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import ExportRequestButton from "./index";
import {
  ContextState as FormContextState,
  Context as FormContext,
  Status as FormStatus,
} from "../Contexts/FormContext";
import { ContextState, Context as AuthCtx, Status as AuthStatus } from "../Contexts/AuthContext";
import { InitialApplication, InitialQuestionnaire } from "../../config/InitialValues";

const mockGenerate = jest.fn();
jest.mock("./pdf/Generate", () => ({
  GenerateDocument: (...args) => mockGenerate(...args),
}));

type TestParentProps = {
  /**
   * The status of the form context.
   */
  formStatus?: FormStatus;
  /**
   * The role of the "current user" viewing the element
   */
  userRole?: UserRole;
  /**
   * The children to render within the test parent.
   */
  children: React.ReactNode;
};

const TestParent: FC<TestParentProps> = ({
  formStatus = FormStatus.LOADED,
  userRole = "User",
  children,
}: TestParentProps) => {
  const formValue = useMemo<FormContextState>(
    () => ({
      status: formStatus,
      // NOTE: This component does not use any data, so we're just using the initial values here.
      data:
        formStatus === FormStatus.LOADED
          ? { ...InitialApplication, questionnaireData: { ...InitialQuestionnaire } }
          : null,
    }),
    [formStatus]
  );

  const authValue = useMemo<ContextState>(
    () => ({
      status: AuthStatus.LOADED,
      user: { role: userRole } as User,
      isLoggedIn: true,
    }),
    [userRole]
  );

  return (
    <AuthCtx.Provider value={authValue}>
      <FormContext.Provider value={formValue}>{children}</FormContext.Provider>
    </AuthCtx.Provider>
  );
};

describe("Accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not have any violations", async () => {
    const { container } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have any violations (hover)", async () => {
    const { container, getByTestId, getByRole } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    userEvent.hover(getByTestId("export-submission-request-button"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have any violations (disabled)", async () => {
    const { container } = render(<ExportRequestButton disabled />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should render without crashing", () => {
    expect(() =>
      render(<ExportRequestButton />, { wrapper: (p) => <TestParent {...p} /> })
    ).not.toThrow();
  });

  it("should disable the button when building the document", async () => {
    jest.useFakeTimers();
    mockGenerate.mockImplementation(
      () =>
        new Promise((res) => {
          setTimeout(() => {
            res("mock pdf data"); // NOTE: This is a placeholder value.
          }, 1000);
        })
    );

    const { getByTestId } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    userEvent.click(getByTestId("export-submission-request-button"));

    await waitFor(() => {
      expect(getByTestId("export-submission-request-button")).toBeDisabled();
    });

    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("should disable the button when the disabled prop is passed", () => {
    const { getByTestId } = render(<ExportRequestButton disabled />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    expect(getByTestId("export-submission-request-button")).toBeDisabled();
  });

  it("should disable the button when the FormContext is not loaded", () => {
    const { getByTestId } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent formStatus={FormStatus.LOADING} {...p} />,
    });

    expect(getByTestId("export-submission-request-button")).toBeDisabled();
  });

  it("should display an error message on failed export", async () => {
    mockGenerate.mockRejectedValue(new Error("mock error"));

    const { getByTestId } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    userEvent.click(getByTestId("export-submission-request-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "An error occurred while exporting the Submission Request to PDF.",
        { variant: "error" }
      );
    });
  });
});

describe("Implementation Requirements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have a tooltip on hover", async () => {
    const { getByTestId, getByRole, queryByRole } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent {...p} />,
    });

    userEvent.hover(getByTestId("export-submission-request-button"));

    await waitFor(() => {
      expect(getByRole("tooltip")).toBeInTheDocument();
    });

    expect(getByRole("tooltip")).toHaveTextContent(
      "Click to export this Submission Request as a PDF."
    );

    userEvent.unhover(getByTestId("export-submission-request-button"));

    await waitFor(() => {
      expect(queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // NOTE: This component does not currently implement any authorization,
  // this is just future-proofing test coverage.
  it.each<UserRole>([
    "User",
    "Submitter",
    "Organization Owner",
    "Federal Lead",
    "Admin",
    "fake role" as UserRole,
  ])("should be enabled for the user role %s if they can access the page", (role) => {
    const { getByTestId } = render(<ExportRequestButton />, {
      wrapper: (p) => <TestParent userRole={role} {...p} />,
    });

    expect(getByTestId("export-submission-request-button")).toBeEnabled();
  });
});
