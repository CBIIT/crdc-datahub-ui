import React, { FC } from 'react';
import styled from '@emotion/styled';
import { Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

type Props = {
  icon: SectionStatus | "Review" | "ReviewDisabled";
};

const BaseAvatar = styled(Avatar)({
  width: "27px",
  height: "27px",
  backgroundColor: "transparent",
  "& > *": {
    width: "20px",
  }
});

const CompleteAvatar = styled(BaseAvatar)({
  backgroundColor: "#26B893",
});

const NotStartedAvatar = styled(BaseAvatar)({
  border: "2.25px solid #26B893",
});

const InProgressAvatar = styled(NotStartedAvatar)({
  position: "relative",
  backgroundColor: "#26B893",
  "&::after": {
    content: "''",
    position: "absolute",
    width: "100%",
    height: "50%",
    top: "0",
    backgroundColor: "#fff",
  },
});

const ReviewAvatar = styled(BaseAvatar)({
  backgroundColor: "#CFCFCF",
});

const ReviewActiveAvatar = styled(ReviewAvatar)({
  backgroundColor: "#888888",
});

/**
 * Progress Bar Icon/Adornment Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const StatusAdornment: FC<Props> = ({ icon }) => {
  switch (icon) {
    case "Completed":
      return (
        <CompleteAvatar>
          <CheckIcon />
        </CompleteAvatar>
      );
    case "In Progress":
      return (
        <InProgressAvatar>
          {" "}
        </InProgressAvatar>
      );
    case "Review":
      return (
        <ReviewActiveAvatar>
          <ArrowUpwardIcon />
        </ReviewActiveAvatar>
      );
    case "ReviewDisabled":
      return (
        <ReviewAvatar>
          <ArrowUpwardIcon />
        </ReviewAvatar>
      );
    default:
      return (
        <NotStartedAvatar>
          {" "}
        </NotStartedAvatar>
      );
  }
};

export default StatusAdornment;
