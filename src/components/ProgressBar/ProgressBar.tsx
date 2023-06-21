import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  List, ListItemText, ListItemButton,
  Stack, ListItemAvatar
} from '@mui/material';
import config from '../../config/SectionConfig';
import { useFormContext } from '../Contexts/FormContext';
import StatusAdornment from './StatusAdornment';

type Props = {
  section: string;
};

type ProgressSection = {
  title: string;
  url: string;
  icon: SectionStatus | "Review" | "ReviewDisabled";
  disabled?: boolean;
  selected?: boolean;
};

const StyledList = styled(List)({
  marginTop: "30px",
  width: '250px',
  "& a": {
    color: "inherit",
    textDecoration: "none",
    cursor: "unset",
  },
  "& a:not(:first-of-type) .MuiStack-root": {
    marginTop: "24px",
  },
  "& .MuiListItemText-root": {
    margin: 0,
  },
  "& .MuiListItemText-primary": {
    color: "#737373",
    fontWeight: "700",
  },
  "& .Mui-selected .MuiListItemText-primary": {
    color: "#156071",
  },
});

const StyledAvatar = styled(ListItemAvatar)({
  minWidth: "43px",
});

const StyledButton = styled(ListItemButton)({
  padding: "12px 14px",
  borderRadius: "8px",
  "&.Mui-selected": {
    background: "#DDF4F4",
  },
  "&.Mui-disabled": {
    cursor: "not-allowed !important",
  },
});

/**
 * Form Section Progress Bar Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProgressBar: FC<Props> = ({ section }) => {
  const sectionKeys = Object.keys(config);

  const { data } = useFormContext();
  const { id, sections: sectionStatuses } = data;

  const [sections, setSections] = useState<ProgressSection[]>([]);

  useEffect(() => {
    const newSections: ProgressSection[] = [];
    let completedSections = 0;

    // Dynamically build the progress bar with section statuses
    sectionKeys.forEach((s) => {
      const { title } = config[s];
      const status = sectionStatuses?.find((sec) => sec.name === s)?.status || "Not Started";
      completedSections += status === "Completed" ? 1 : 0;

      newSections.push({
        title,
        url: `/questionnaire/${id}/${s}`,
        icon: status,
        selected: s === section,
      });
    });

    // Special icon for the review section
    const reviewSection = newSections.find((s) => s.title === "Review & Submit");
    if (reviewSection) {
      reviewSection.icon = completedSections === sectionKeys.length - 1 ? "Review" : "ReviewDisabled";
      reviewSection.disabled = completedSections !== sectionKeys.length - 1;
    }

    setSections(newSections);
  }, [section, sectionStatuses]);

  return (
    <StyledList>
      {sections.map(({ url, icon, title, disabled, selected }, idx) => (
        <Link
          key={title}
          to={url}
          style={{ pointerEvents: !disabled ? "initial" : "none" }}
          data-testid={`progress-bar-section-${idx}`}
          aria-disabled={disabled || false}
          aria-selected={selected}
        >
          <Stack direction="row" alignItems="center" justifyContent="center">
            <StyledAvatar>
              <StatusAdornment icon={icon} />
            </StyledAvatar>
            <StyledButton selected={selected} disabled={disabled}>
              <ListItemText primary={title} />
            </StyledButton>
          </Stack>
        </Link>
      ))}
    </StyledList>
  );
};

export default ProgressBar;
