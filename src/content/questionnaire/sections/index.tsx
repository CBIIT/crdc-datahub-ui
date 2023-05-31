import React, { createElement } from "react";
import A from "./A";
import B from "./B";

export const map = {
  A,
  B,
};

type Props = {
  section: string;
  refs: any;
};

/**
 * Generate the correct section component based on the section name
 *
 * @param {Props} props
 * @returns {FunctionComponentElement} - Section component
 */
export default ({ section, ...props }: Props) => {
  const sectionName = section.toUpperCase();

  // Create the section component
  if (typeof map[sectionName] !== "undefined") {
    return createElement(map[sectionName], props);
  }

  // Render a fallback component if the section is not found
  // Note: Validation should prevent this from ever happening
  return createElement(() => <div>Oops! Form section not found</div>);
};
