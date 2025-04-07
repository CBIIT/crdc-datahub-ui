import { isEqual } from "lodash";
import React, { FC, memo } from "react";

export type StudyListProps = {
  /**
   * The list of studies to display. Must contain a minimum of `_id` and `studyName` for each study.
   */
  studies: Partial<ApprovedStudy>[] | Pick<ApprovedStudy, "_id" | "studyName">[];
};

/**
 * A component which handles the display of a list of studies.
 *
 * Scenarios covered by this component include:
 * - `ALL` Study – "All"
 * - No Studies – "None."
 * - Otherwise, list of study names
 *
 * @returns The rendered list of studies or a message indicating no studies are available.
 */
const StudyList: FC<StudyListProps> = ({ studies }: StudyListProps) => {
  if (!studies || studies?.length === 0 || !Array.isArray(studies)) {
    return <span>None.</span>;
  }

  if (studies.findIndex((s) => s?._id === "All") !== -1) {
    return <span>All</span>;
  }

  return <span>{studies.map((s) => s.studyName).join(", ")}</span>;
};

export default memo<StudyListProps>(StudyList, isEqual);
