import { FC, memo } from "react";
import { styled } from "@mui/material";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";

const StyledText = styled("span")(() => ({
  display: "block",
  textDecoration: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const StyledTextWrapper = styled("span", {
  shouldForwardProp: (p) => p !== "truncated" && p !== "underline" && p !== "styles",
})<{ truncated: boolean; underline: boolean; styles: React.CSSProperties }>(
  ({ truncated, underline, styles }) => ({
    display: "block",
    textDecoration: truncated && underline ? "underline" : "none",
    textDecorationStyle: "dashed",
    textUnderlineOffset: "4px",
    cursor: truncated ? "pointer" : "inherit",
    width: "fit-content",
    ...styles,
  })
);

type Props = {
  /**
   * The displayed text that will be hoverable
   * when a truncation tooltip is available
   */
  text: string;
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
   * Optional custom styling to apply on the wrapper element
   */
  wrapperStyles?: React.CSSProperties;
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
  wrapperStyles = {},
}: Props) => {
  const isTruncated = text?.length > maxCharacters;
  const displayText = isTruncated
    ? `${text?.trim()?.slice(0, maxCharacters)?.trim()}${ellipsis ? "..." : ""}`
    : text;

  return (
    <StyledTooltip
      placement="top"
      title={tooltipText || text || ""}
      disableHoverListener={!isTruncated}
      disableInteractive
      data-testid="truncated-text-tooltip"
    >
      <StyledTextWrapper
        truncated={isTruncated}
        underline={underline}
        data-testid="truncated-text-wrapper"
        styles={wrapperStyles}
      >
        <StyledText data-testid="truncated-text-label">{displayText}</StyledText>
      </StyledTextWrapper>
    </StyledTooltip>
  );
};

export default memo<Props>(TruncatedText);
