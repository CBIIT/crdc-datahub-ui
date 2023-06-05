import React, { createElement } from "react";
import A from "./A";
import B from "./B";

export const map = {
  A,
  B,
};

type Props = FormSectionProps & {
  section: string;
  refs: {
    saveForm: React.RefObject<HTMLButtonElement>;
    submitForm: React.RefObject<HTMLButtonElement>;
  };
};

/**
 * Generate the correct section component based on the section name
 *
 * NOTE:
 * - This component is not rendered until we have form data
 *   status validation is NOT needed
 *
 * @param {Props} props
 * @returns {FunctionComponentElement} - Section component
 */
export default ({ section, ...rest }: Props) => {
  const sectionName = section.toUpperCase();

  // Create the section component
  if (typeof map[sectionName] !== "undefined") {
    return createElement(map[sectionName], rest);
  }

  // Render a fallback component if the section is not found
  // Note: Validation should prevent this from ever happening
  return createElement(() => <div>Oops! Form section not found</div>);
};
