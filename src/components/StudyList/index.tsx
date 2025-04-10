import { FC, memo, useMemo } from "react";
import { isEqual } from "lodash";
import { styled, Typography } from "@mui/material";
import { formatFullStudyName } from "../../utils";
import Tooltip from "../Tooltip";

const StyledList = styled("ul")({
  paddingInlineStart: 16,
  marginBlockStart: 6,
  marginBlockEnd: 6,
});

const StyledListItem = styled("li")({
  "&:not(:last-child)": {
    marginBottom: 8,
  },
  fontSize: 14,
});

const StyledTypography = styled(Typography)<{ component: React.ElementType }>(() => ({
  textDecoration: "underline",
  cursor: "pointer",
  color: "#0B6CB1",
}));

export type StudyListProps = {
  /**
   * The list of studies to display. Must contain a minimum of:
   * - `_id`
   * - `studyName`
   * - `studyAbbreviation`
   */
  studies:
    | Partial<ApprovedStudy>[]
    | Pick<ApprovedStudy, "_id" | "studyName" | "studyAbbreviation">[];
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
const StudyList: FC<StudyListProps> = ({ studies }: StudyListProps) => {
  const tooltipContent = useMemo<React.ReactNode>(
    () => (
      <StyledList>
        {studies?.map(({ _id, studyName, studyAbbreviation }) => (
          <StyledListItem key={_id} data-testid={_id}>
            {formatFullStudyName(studyName, studyAbbreviation)}
          </StyledListItem>
        ))}
      </StyledList>
    ),
    [studies]
  );

  if (!studies || !Array.isArray(studies) || studies.length === 0) {
    return <span>None.</span>;
  }

  if (studies.findIndex((s) => s?._id === "All") !== -1) {
    return <span>All</span>;
  }

  return (
    <span>
      {studies[0].studyAbbreviation || studies[0].studyName}
      {studies.length > 1 && (
        <>
          {" and "}
          <Tooltip
            title={tooltipContent}
            placement="top"
            open={undefined}
            disableHoverListener={false}
            arrow
          >
            <StyledTypography component="span" data-testid="study-list-other-count">
              other {studies.length - 1}
            </StyledTypography>
          </Tooltip>
        </>
      )}
    </span>
  );
};

export default memo<StudyListProps>(StudyList, isEqual);
