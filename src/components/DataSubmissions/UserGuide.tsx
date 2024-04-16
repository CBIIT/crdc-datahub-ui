import { FC } from "react";
import { Typography, styled } from "@mui/material";
import { Link } from "react-router-dom";
import Guide from "../../assets/pdf/Data_Submission_User_Guide.pdf";

const StyledText = styled(Typography)({
  fontFamily: "Nunito",
  fontWeight: 400,
  fontSize: "16px",
  marginBottom: "16px",
  "& a": {
    fontWeight: 700,
    color: "#005999",
  },
});

/**
 * Provides contextual information about the Data Submission flow.
 *
 * @returns {React.FC}
 */
export const UserGuide: FC = () => (
  <StyledText variant="body1">
    Prior to beginning uploading process, read detailed instructions available in the{" "}
    <Link to={Guide} target="_blank">
      Data Submission User Guide
    </Link>
    .
  </StyledText>
);
