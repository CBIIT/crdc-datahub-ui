import React, { FC, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import config from '../../config/SectionConfig';
import ProgressBar from './ProgressBar';
import {
  ContextState,
  Context as FormCtx,
  Status as FormStatus,
} from '../Contexts/FormContext';

type Props = {
  section: string;
  data: object;
};

const BaseComponent: FC<Props> = ({ section, data = {} } : Props) => {
  const value = useMemo<ContextState>(() => ({
    data: data as Application, status: FormStatus.LOADED
  }), [data]);

  return (
    <BrowserRouter>
      <FormCtx.Provider value={value}>
        <ProgressBar section={section} />
      </FormCtx.Provider>
    </BrowserRouter>
  );
};

describe("ProgressBar General Tests", () => {
  const keys = Object.keys(config);
  const sections = Object.values(config);

  it("renders the progress bar with all config-defined sections", () => {
    const screen = render(<BaseComponent section={keys[0]} data={{}} />);

    sections.forEach(({ id, title }, index) => {
      const isReviewSection = id === "review";
      const root = screen.getByText(isReviewSection ? title || "Review" : title).closest("a");

      expect(root).toBeVisible();
      expect(root).toHaveAttribute("data-testId", `progress-bar-section-${index}`);
      expect(root).toHaveAttribute("href");
      expect(root).toHaveAttribute("aria-disabled");
    });
  });

  it("renders the currently active section", () => {
    const { container, getByTestId } = render(<BaseComponent section={keys[1]} data={{}} />);
    const activeLinks = container.querySelectorAll("a[aria-selected='true']");

    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]).toBe(getByTestId("progress-bar-section-1"));
    expect(activeLinks[0].querySelector(".MuiButtonBase-root")).toHaveClass("Mui-selected");
  });

  it("renders the completed sections with a checkmark", () => {
    const data = {
      sections: [
        { name: keys[1], status: "Completed" },
      ],
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
    const element = getByTestId("progress-bar-section-1");

    expect(element.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "CheckIcon");
  });

  it("renders the review section as disabled by default", () => {
    const { getByTestId } = render(<BaseComponent section={keys[0]} data={{}} />);
    const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

    expect(reviewSection).toBeVisible();
    expect(reviewSection).toHaveAttribute("aria-disabled", "true");
    expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "ArrowUpwardIcon");
  });

  it("renders the review section as enabled only when all sections are completed", () => {
    const data = {
      sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);

    sections.slice(0, sections.length - 1).forEach((_, index) => {
      const sectionLink = getByTestId(`progress-bar-section-${index}`);
      expect(sectionLink).toHaveAttribute("aria-disabled", "false");
      expect(sectionLink.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "CheckIcon");
    });

    expect(getByTestId(`progress-bar-section-${keys.length - 1}`)).toHaveAttribute("aria-disabled", "false");
  });

  const completedStates : ApplicationStatus[] = ["Submitted", "In Review", "Approved", "Rejected"];
  it.each(completedStates)("renders the Review section as unlocked with a CheckIcon icon for status %s", (status) => {
    const data = {
      sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
      status,
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
    const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

    expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "CheckIcon");
  });

  const incompleteStates : ApplicationStatus[] = ["New", "In Progress"];
  it.each(incompleteStates)("renders the Review section as unlocked with an ArrowUpwardIcon icon for status %s", (status) => {
    const data = {
      sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
      status,
    };

    const { getByTestId } = render(<BaseComponent section={keys[0]} data={data} />);
    const reviewSection = getByTestId(`progress-bar-section-${keys.length - 1}`);

    expect(reviewSection.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "ArrowUpwardIcon");
  });
});
