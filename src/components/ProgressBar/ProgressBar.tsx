import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Stack,
  ListItemAvatar,
  styled,
} from "@mui/material";
import config from "../../config/SectionConfig";
import { Status, useFormContext } from "../Contexts/FormContext";
import StatusAdornment from "./StatusAdornment";
import useFormMode from "../../hooks/useFormMode";

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
  width: "250px",
  "& li:not(:first-of-type) .MuiStack-root": {
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

const StyledListItem = styled(ListItem)({
  padding: 0,
  "& a": {
    width: "100%",
    color: "inherit",
    textDecoration: "none",
    cursor: "unset",
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

  const { data, status: formStatus } = useFormContext();
  const { formMode } = useFormMode();
  const { _id, status, questionnaireData } = data;
  const sectionStatuses = questionnaireData?.sections;

  const [sections, setSections] = useState<ProgressSection[]>([]);

  useEffect(() => {
    if (formStatus === Status.LOADING || formStatus === Status.SAVING) {
      return;
    }
    const newSections: ProgressSection[] = [];
    let completedSections = 0;

    // Dynamically build the progress bar with section statuses
    sectionKeys.forEach((s) => {
      const { title, id } = config[s];
      const status =
        sectionStatuses?.find((sec) => sec.name === s)?.status || "Not Started";
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
      const showReviewTitle = formMode === "View Only" || formMode === "Review";
      const reviewIcon = reviewUnlocked ? "Review" : "ReviewDisabled";
      reviewSection.icon =
        ["Approved"].includes(status) && reviewUnlocked
          ? "Completed"
          : reviewIcon;
      reviewSection.disabled = completedSections !== sectionKeys.length - 1;
      reviewSection.title = showReviewTitle ? "Review" : reviewSection.title;
    }

    setSections(newSections);
  }, [section, sectionStatuses, formMode, formStatus]);

  return (
    <StyledList>
      {sections.map(({ url, id, icon, title, disabled, selected }, idx) => (
        <StyledListItem key={title}>
          <Link
            id={`progress-bar-section-${id}`}
            to={url}
            style={{ pointerEvents: !disabled ? "initial" : "none" }}
            data-testid={`progress-bar-section-${idx}`}
            aria-disabled={disabled || false}
            data-selected={selected || false}
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
        </StyledListItem>
      ))}
    </StyledList>
  );
};

export default ProgressBar;
