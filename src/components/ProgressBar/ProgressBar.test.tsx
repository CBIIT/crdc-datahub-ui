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

describe("questionnaire ProgressBar tests", () => {
  const keys = Object.keys(config);
  const sections = Object.values(config);

  it("renders the progress bar with all config-defined sections", () => {
    const screen = render(<BaseComponent section={keys[0]} data={{}} />);

    sections.forEach((section, index) => {
      const root = screen.getByText(section.title).closest("a");

      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute("id", `progress-bar-section-${index}`);
      expect(root).toHaveAttribute("href");
      expect(root).toHaveAttribute("aria-disabled");
    });
  });

  it("renders sections with not started and in progress roles identically", () => {
    const data = {
      sections: keys.slice(0, keys.length - 1).map((s, index) => ({
        name: s,
        status: index % 2 === 0 ? "Not Started" : "In Progress"
      })),
    };

    const screen = render(<BaseComponent section={keys[0]} data={data} />);

    sections.slice(0, sections.length - 1).forEach((section, index) => {
      const sectionLink = screen.getByText(section.title).closest("a");
      expect(sectionLink).toHaveAttribute("id", `progress-bar-section-${index}`);
    });
  });

  it("renders the currently active section", () => {
    const { container } = render(<BaseComponent section={keys[1]} data={{}} />);
    const activeLinks = container.querySelectorAll("a[aria-selected='true']");

    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]).toBe(container.querySelector("#progress-bar-section-1"));
    expect(activeLinks[0].querySelector(".MuiButtonBase-root")).toHaveClass("Mui-selected");
  });

  it("renders the completed sections with a checkmark", () => {
    const data = {
      sections: [
        { name: keys[1], status: "Completed" },
      ],
    };

    const { container } = render(<BaseComponent section={keys[0]} data={data} />);

    expect(container.querySelector("#progress-bar-section-1 .MuiAvatar-root svg")).toHaveAttribute("data-testid", "CheckIcon");
  });

  it("renders the review section as disabled by default", () => {
    const screen = render(<BaseComponent section={keys[0]} data={{}} />);
    const reviewSection = screen.container.querySelector(`#progress-bar-section-${keys.length - 1}`);

    expect(reviewSection).toBeInTheDocument();
    expect(reviewSection).toHaveAttribute("aria-disabled", "true");
  });

  it("renders the review section as enabled only when all sections are completed", () => {
    const data = {
      sections: keys.slice(0, keys.length - 1).map((s) => ({ name: s, status: "Completed" })),
    };

    const { container } = render(<BaseComponent section={keys[0]} data={data} />);

    sections.slice(0, sections.length - 1).forEach((_, index) => {
      const sectionLink = container.querySelector(`#progress-bar-section-${index}`);
      expect(sectionLink).toHaveAttribute("aria-disabled", "false");
      expect(sectionLink.querySelector(".MuiAvatar-root svg")).toHaveAttribute("data-testid", "CheckIcon");
    });

    expect(container.querySelector(`#progress-bar-section-${keys.length - 1}`)).toHaveAttribute("aria-disabled", "false");
  });
});
