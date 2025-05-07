import { FC, memo } from "react";
import { isEqual } from "lodash";
import { formatFullStudyName } from "../../utils";
import SummaryList from "../SummaryList";

export type StudyListProps = {
  /**
   * The list of studies to display. Must contain a minimum of:
   * - `_id`
   * - `studyName`
   * - `studyAbbreviation`
   */
  studies: Partial<ApprovedStudy>[];
  /**
   * Provides a custom render for the approved study.
   *
   * @param study The study to be rendered.
   * @returns A string or ReactNode being rendered.
   */
  renderStudy?: (study: Partial<ApprovedStudy>) => string | React.ReactNode;
};

/**
 * A component which handles the display of a list of studies.
 *
 * Prioritizes the Study Abbreviation, otherwise Study Name if
 * the abbreviation is not available or provided.
 *
 * Scenarios covered by this component include:
 * - No Studies – "None."
 * - The "All" Study – "All"
 * - 1 study – "Study Abbreviation" || "Study Name"
 * - >1 study – "Study Abbreviation and other X" with tooltip
 *
 * @returns The formatted list of studies
 */
const StudyList: FC<StudyListProps> = ({ studies, renderStudy }: StudyListProps) => {
  if (studies.findIndex((s) => s?._id === "All") !== -1) {
    return <span>All</span>;
  }

  return (
    <SummaryList
      data={studies}
      emptyText=""
      getItemKey={(s) => s._id}
      renderItem={(s) => renderStudy?.(s) ?? (s.studyAbbreviation || s.studyName)}
      renderTooltipItem={({ studyName, studyAbbreviation }) =>
        formatFullStudyName(studyName, studyAbbreviation)
      }
    />
  );
};

export default memo<StudyListProps>(StudyList, isEqual);
