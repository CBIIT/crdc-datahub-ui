import { FC, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "vitest-axe";

import { applicationFactory } from "@/test-utils/factories/application/ApplicationFactory";
import { formContextStateFactory } from "@/test-utils/factories/application/FormContextStateFactory";
import { authCtxStateFactory } from "@/test-utils/factories/auth/AuthCtxStateFactory";
import { userFactory } from "@/test-utils/factories/auth/UserFactory";

import { InitialApplication, InitialQuestionnaire } from "../../config/InitialValues";
import config from "../../config/SectionConfig";
import { render } from "../../test-utils";
import { ContextState, Context as AuthCtx } from "../Contexts/AuthContext";
import { ContextState as FormCtxState, Context as FormCtx } from "../Contexts/FormContext";

import ProgressBar from "./ProgressBar";

const BaseApplication: Application = {
  ...InitialApplication,
  questionnaireData: { ...InitialQuestionnaire },
};

type Props = {
  section: string;
  user?: Partial<User>;
  data?: Partial<Application>;
};

const BaseComponent: FC<Props> = ({ section, user = {}, data = {} }: Props) => {
  const formValue = useMemo<FormCtxState>(
    () =>
      formContextStateFactory.build({
        data: applicationFactory.build({ ...data }),
      }),
    [data]
  );

  const authValue = useMemo<ContextState>(
    () =>
      authCtxStateFactory.build({
        user: userFactory.build({ ...user }),
      }),
    [user]
  );

  return (
    <BrowserRouter>
      <AuthCtx.Provider value={authValue}>
        <FormCtx.Provider value={formValue}>
          <ProgressBar section={section} />
        </FormCtx.Provider>
      </AuthCtx.Provider>
    </BrowserRouter>
  );
};

describe("Accessibility", () => {
  const keys = Object.keys(config);

  it("has no base accessibility violations", async () => {
    const { container } = render(<BaseComponent section={keys[0]} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when all sections are completed", async () => {
    const data: Application = {
      ...BaseApplication,
      questionnaireData: {
        ...BaseApplication.questionnaireData,
        sections: keys.map((s) => ({ name: s, status: "Completed" })),
      },
    };

    const { container } = render(<BaseComponent section={keys[0]} data={data} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when the review section is accessible", async () => {
    const data: Application = {
      ...BaseApplication,
      status: "Approved",
      questionnaireData: {
        ...BaseApplication.questionnaireData,
        sections: keys.map((s) => ({ name: s, status: "Completed" })),
      },
    };

    const { container } = render(<BaseComponent section={keys[0]} data={data} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when the review section is inaccessible", async () => {
    const data: Application = {
      ...BaseApplication,
      status: "New",
      questionnaireData: {
        ...BaseApplication.questionnaireData,
        sections: keys.map((s) => ({ name: s, status: "Completed" })),
      },
    };

    const { container } = render(<BaseComponent section={keys[0]} data={data} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  const keys = Object.keys(config);
  const sections = Object.values(config);

  it("renders the progress bar with all A-D config-defined sections", () => {
    const { getByText } = render(<BaseComponent section={keys[0]} />);

    sections
      .filter((section) => section.id !== config.REVIEW.id)
      .forEach(({ title }, index) => {
        const root = getByText(title).closest("a");

        expect(root).toBeVisible();
        expect(root).toHaveAttribute("data-testId", `progress-bar-section-${index}`);
        expect(root).toHaveAttribute("href");
        expect(root).toHaveAttribute("aria-disabled");
      });
  });

  it("renders the currently active section as highlighted", () => {
    const { container, getByTestId } = render(<BaseComponent section={keys[1]} />);
    const activeLinks = container.querySelectorAll("a[data-selected='true']");

    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]).toBe(getByTestId("progress-bar-section-1"));
    expect(activeLinks[0].querySelector(".MuiButtonBase-root")).toHaveClass("Mui-selected");
  });

  it("renders the completed sections with a checkmark", () => {
    const data: Application = {
      ...BaseApplication,
      questionnaireData: {
        ...BaseApplication.questionnaireData,
        sections: [{ name: keys[1], status: "Completed" }],
      },
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
    const element = getByTestId("progress-bar-section-1");

    expect(element.querySelector(".MuiAvatar-root svg")).toHaveAttribute(
      "data-testid",
      "CheckIcon"
    );
  });

  it("renders the Review section as disabled by default", () => {
    const { getByTestId } = render(<BaseComponent section={keys[0]} />);
    const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

    expect(reviewSection).toBeVisible();
    expect(reviewSection).toHaveAttribute("aria-disabled", "true");
    expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute(
      "data-testid",
      "ArrowUpwardIcon"
    );
  });

  it("renders the Review section as enabled only when all sections are completed", () => {
    const data: Application = {
      ...BaseApplication,
      questionnaireData: {
        ...BaseApplication.questionnaireData,
        sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
      },
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);

    sections.slice(0, sections.length - 1).forEach((_, index) => {
      const sectionLink = getByTestId(`progress-bar-section-${index}`);
      expect(sectionLink).toHaveAttribute("aria-disabled", "false");
      expect(sectionLink.querySelector(".MuiAvatar-root svg")).toHaveAttribute(
        "data-testid",
        "CheckIcon"
      );
    });

    expect(getByTestId(`progress-bar-section-${keys.length - 1}`)).toHaveAttribute(
      "aria-disabled",
      "false"
    );
  });

  it.each<ApplicationStatus>(["Approved"])(
    "renders the Review section as accessible and completed for status %s",
    (status) => {
      const data: Application = {
        ...BaseApplication,
        status,
        questionnaireData: {
          ...BaseApplication.questionnaireData,
          sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
        },
      };

      const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
      const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

      expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute(
        "data-testid",
        "CheckIcon"
      );
    }
  );

  it.each<ApplicationStatus>(["New", "In Progress", "Submitted", "In Review", "Rejected"])(
    "renders the Review section as accessible and incomplete for status %s",
    (status) => {
      const data: Application = {
        ...BaseApplication,
        status,
        questionnaireData: {
          ...BaseApplication.questionnaireData,
          sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
        },
      };

      const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
      const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

      expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute(
        "data-testid",
        "ArrowUpwardIcon"
      );
    }
  );

  it.each<ApplicationStatus>(["In Progress", "Inquired"])(
    "should use the review title 'Review and Submit' for the status '%s' when the user has the permission to submit (owner)",
    (status) => {
      const data: Application = {
        ...BaseApplication,
        status,
        applicant: {
          ...BaseApplication.applicant,
          applicantID: "owner-of-sr",
        },
        questionnaireData: {
          ...BaseApplication.questionnaireData,
          sections: keys.map((s) => ({ name: s, status: "Completed" })),
        },
      };

      const { getByTestId } = render(
        <BaseComponent
          section={config.REVIEW.title}
          data={data}
          user={{
            _id: "owner-of-sr",
            permissions: ["submission_request:view", "submission_request:submit"],
          }}
        />
      );

      const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

      expect(reviewSection.textContent).toBe("Review and Submit");
    }
  );

  it.each<ApplicationStatus>(["In Progress", "Inquired"])(
    "should use the review title 'Review and Submit' for the status '%s' when the user has the permission to submit (non-owner)",
    (status) => {
      const data: Application = {
        ...BaseApplication,
        status,
        applicant: {
          ...BaseApplication.applicant,
          applicantID: "the-owner-is-not-me",
        },
        questionnaireData: {
          ...BaseApplication.questionnaireData,
          sections: keys.map((s) => ({ name: s, status: "Completed" })),
        },
      };

      const { getByTestId } = render(
        <BaseComponent
          section={config.REVIEW.title}
          data={data}
          user={{
            _id: "some-other-user",
            role: "Admin",
            permissions: ["submission_request:view", "submission_request:submit"],
          }}
        />
      );

      const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

      expect(reviewSection.textContent).toBe("Review and Submit");
    }
  );

  it.each<ApplicationStatus>(["In Progress", "Inquired", "Submitted", "In Review"])(
    "shows the review section title as 'Review' when submit button is not visible and status is %s",
    (status) => {
      const data: Application = {
        ...BaseApplication,
        status,
        applicant: {
          ...BaseApplication.applicant,
          applicantID: "user-2-owns-the-sr",
        },
        questionnaireData: {
          ...BaseApplication.questionnaireData,
          sections: keys.map((s) => ({ name: s, status: "Completed" })),
        },
      };

      const { getByTestId } = render(
        <BaseComponent
          section={config.REVIEW.title}
          data={data}
          user={{
            _id: "user-id-01",
            role: "Admin",
            permissions: ["submission_request:view"], // Only possible to view the submission request, no submit or review
          }}
        />
      );

      const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

      expect(reviewSection.textContent).toBe("Review");
    }
  );
});
