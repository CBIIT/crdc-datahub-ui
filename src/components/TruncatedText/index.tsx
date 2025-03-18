import { FC, memo, useMemo } from "react";
import { styled, SxProps } from "@mui/material";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";
import { coerceToString } from "../../utils";

const StyledText = styled("span")(() => ({
  display: "block",
  textDecoration: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const StyledTextWrapper = styled("span", {
  shouldForwardProp: (p) => p !== "truncated" && p !== "underline",
})<{ truncated: boolean; underline: boolean }>(({ truncated, underline }) => ({
  display: "block",
  textDecoration: truncated && underline ? "underline" : "none",
  textDecorationStyle: "dashed",
  textUnderlineOffset: "4px",
  cursor: truncated ? "pointer" : "inherit",
  width: "fit-content",
}));

type Props = {
  /**
   * The text to be truncated. It can be a string, number, or any other type
   * If it can be converted to a string, it will be displayed as such.
   */
  text: unknown;
  /**
   * Provide custom text to show in the tooltip,
   * otherwise 'text' will be used
   */
  tooltipText?: string;
  /**
   * The max number of characters allowed before
   * truncation will occur
   */
  maxCharacters?: number;
  /**
   * A boolean indicating whether or not to display
   * an underline when truncation occurs
   */
  underline?: boolean;
  /**
   * A boolean indicating whether or not to display
   * an ellipsis when truncation occurs
   */
  ellipsis?: boolean;
  /**
   * A boolean indicating whether or not the user
   * can hover over the tooltip
   */
  disableInteractiveTooltip?: boolean;
  /**
   * Optional custom styling to apply on the wrapper element
   */
  wrapperSx?: SxProps;
  /**
   * Optional custom styling to apply on the label element
   */
  labelSx?: SxProps;
};

/**
 * A component that truncates text to a specified number of characters.
 * If truncated, it displays an ellipsis and shows the full text in a tooltip on hover.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const TruncatedText: FC<Props> = ({
  text,
  tooltipText,
  maxCharacters = 10,
  underline = true,
  ellipsis = true,
  disableInteractiveTooltip = true,
  wrapperSx,
  labelSx,
}: Props) => {
  const coercedValue = useMemo<string>(() => coerceToString(text), [text]);
  const isTruncated = coercedValue?.length > maxCharacters;
  const displayText = isTruncated
    ? `${coercedValue?.trim()?.slice(0, maxCharacters)?.trim()}${ellipsis ? "..." : ""}`
    : coercedValue;

  return (
    <StyledTooltip
      placement="top"
      title={tooltipText || coercedValue || ""}
      disableHoverListener={!isTruncated}
      disableInteractive={disableInteractiveTooltip}
      data-testid="truncated-text-tooltip"
    >
      <StyledTextWrapper
        truncated={isTruncated}
        underline={underline}
        data-testid="truncated-text-wrapper"
        sx={wrapperSx}
      >
        <StyledText data-testid="truncated-text-label" sx={labelSx}>
          {displayText}
        </StyledText>
      </StyledTextWrapper>
    </StyledTooltip>
  );
};

export default memo<Props>(TruncatedText);
