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
import useFormMode from '../../content/questionnaire/sections/hooks/useFormMode';

type Props = {
  section: string;
};

type ProgressSection = {
  title: string;
  id: string;
  url: string;
  icon: SectionStatus | "Review" | "ReviewDisabled";
  disabled?: boolean;
  selected?: boolean;
};

const StyledList = styled(List)({
  marginTop: "22px",
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
  const { formMode } = useFormMode();
  const { _id, status, questionnaireData } = data;
  const sectionStatuses = questionnaireData?.sections;

  const [sections, setSections] = useState<ProgressSection[]>([]);

  useEffect(() => {
    const newSections: ProgressSection[] = [];
    let completedSections = 0;

    // Dynamically build the progress bar with section statuses
    sectionKeys.forEach((s) => {
      const { title, id } = config[s];
      const status = sectionStatuses?.find((sec) => sec.name === s)?.status || "Not Started";
      completedSections += status === "Completed" ? 1 : 0;

      newSections.push({
        title,
        id,
        url: `/submission/${_id}/${s}`,
        icon: status,
        selected: s === section,
      });
    });

    // Special icon and title for the review section
    const reviewSection = newSections.find((s) => s.id === "review");
    const reviewUnlocked = completedSections === sectionKeys.length - 1;
    if (reviewSection) {
      // eslint-disable-next-line no-nested-ternary
      reviewSection.icon = ["Approved"].includes(status) && reviewUnlocked
        ? "Completed"
        : reviewUnlocked ? "Review" : "ReviewDisabled";
      reviewSection.disabled = completedSections !== sectionKeys.length - 1;
      reviewSection.title = formMode === "Review" ? "Review" : "Review & Submit";
    }

    setSections(newSections);
  }, [section, sectionStatuses, formMode]);

  return (
    <StyledList>
      {sections.map(({ url, id, icon, title, disabled, selected }, idx) => (
        <Link
          id={`progress-bar-section-${id}`}
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
