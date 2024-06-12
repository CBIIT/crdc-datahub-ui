import { Box, styled } from "@mui/material";
import { useMemo } from "react";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";
import RedBell from "../../assets/icons/red_bell.svg";
import GreenBell from "../../assets/icons/green_bell.svg";
import { FormatDate } from "../../utils";

const StyledChip = styled(Box, { shouldForwardProp: (p) => p !== "variant" })<{
  variant: "green" | "red";
}>(({ variant }) => ({
  backgroundColor: variant === "green" ? "#EDF5F3" : "#FCF7F2",
  border: `1px solid ${variant === "green" ? "#2A836D" : "#F87C46"}`,
  borderRadius: "8px",
  color: variant === "green" ? "#165848" : "#903813",
  fontWeight: 600,
  fontFamily: "Public Sans",
  fontSize: "13px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  maxWidth: "229px",
  padding: "5px 9px",
}));

const StyledImage = styled("img")({
  width: "17px",
  height: "auto",
  marginRight: "7px",
});

export type Props = {
  /**
   * The relevant Data Submission object.
   *
   * Accepts either a Submission object or a subset of its properties.
   */
  submission:
    | Pick<
        Submission,
        "validationStarted" | "validationEnded" | "validationType" | "validationScope"
      >
    | Submission;
};

/**
 * Provides the implementation for the ValidationControls current validation Status text.
 *
 * @returns {React.FC}
 */
export const ValidationStatus: React.FC<Props> = ({ submission }: Props) => {
  const { validationStarted, validationEnded, validationScope, validationType } = submission || {};

  const hadValidation: boolean = useMemo<boolean>(
    () => !!validationStarted || !!validationEnded || !!validationScope || !!validationType,
    [validationStarted, validationEnded, validationScope, validationType]
  );

  const typeDescription: string = useMemo<string>(() => {
    if (validationType?.length === 1 && validationType.includes("file")) {
      return "Data files";
    }
    if (validationType?.length === 1 && validationType.includes("metadata")) {
      return "Metadata";
    }

    return "Both";
  }, [validationType]);

  // No validation has ever been run, hide the component
  if (!hadValidation) {
    return null;
  }

  return (
    <StyledTooltip
      title={
        `The ${
          validationEnded ? "last" : ""
        } validation (Type: ${typeDescription}, Target: ${validationScope} Uploaded Data) ` +
        `${!validationEnded ? "started on" : "that ran on"} ${FormatDate(
          validationStarted,
          "MM-DD-YYYY [at] hh:mm A",
          "N/A"
        )} ` +
        `${
          !validationEnded
            ? "and is still in progress..."
            : `was completed on ${FormatDate(validationEnded, "MM-DD-YYYY [at] hh:mm A", "N/A")}.`
        }`
      }
      placement="bottom"
      data-testid="validation-status-tooltip"
    >
      <StyledChip data-testid="validation-status-chip" variant={validationEnded ? "green" : "red"}>
        <StyledImage
          src={validationEnded ? GreenBell : RedBell}
          alt="Validation Status"
          data-testid="validation-status-icon"
        />
        {`VALIDATION ${validationEnded ? "COMPLETED" : "IN-PROGRESS..."}`}
      </StyledChip>
    </StyledTooltip>
  );
};
