import React, { ElementType, FC, memo, useMemo } from "react";
import { Typography, styled } from "@mui/material";
import Tooltip from "../../Tooltip";
import { formatFullStudyName } from "../../../utils";

const StyledStudyCount = styled(Typography)<{ component: ElementType }>(({ theme }) => ({
  textDecoration: "underline",
  cursor: "pointer",
  color: theme.palette.primary.main,
}));

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

type Props = {
  _id: Organization["_id"];
  studies: Organization["studies"];
};

/**
 * Organization list view tooltip for studies
 *
 * @param Props
 * @returns {React.FC}
 */
const StudyTooltip: FC<Props> = ({ _id, studies }) => {
  const tooltipContent = useMemo<React.ReactNode>(
    () => (
      <StyledList>
        {studies?.map(({ studyName, studyAbbreviation }) => (
          <StyledListItem key={`${_id}_study_${studyName}_abbrev_${studyAbbreviation}`}>
            {formatFullStudyName(studyName, studyAbbreviation)}
          </StyledListItem>
        ))}
      </StyledList>
    ),
    [studies]
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="top"
      open={undefined}
      disableHoverListener={false}
      arrow
    >
      <StyledStudyCount variant="body2" component="span">
        other {studies.length - 1}
      </StyledStudyCount>
    </Tooltip>
  );
};

export default memo<Props>(StudyTooltip);
