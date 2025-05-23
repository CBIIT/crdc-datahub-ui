import { memo } from "react";
import { Box, IconButton, IconButtonProps, styled, TooltipProps } from "@mui/material";
import Tooltip from "../Tooltip";
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon_2.svg";

const StyledCopyIDButton = styled(IconButton)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: 0,
  height: "fit-content",
  margin: 0,
  "&.MuiIconButton-root.Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
    cursor: "not-allowed",
  },
}));

const CopyButton = (props: IconButtonProps) => (
  <StyledCopyIDButton data-testid="copy-text-button" aria-label="Copy text to clipboard" {...props}>
    <CopyIconSvg />
  </StyledCopyIDButton>
);

type Props = {
  /**
   * Indicates whether the button should be disabled.
   */
  disabled?: boolean;
  /**
   * The props that will be assigned to the tooltip component.
   */
  tooltipProps?: TooltipProps;
  /**
   * The text that will be copied to clipboard.
   */
  copyText: string;
  /**
   * The callback function after the text is copied to clipbaord.
   * @param text the text that was copied.
   * @returns void
   */
  onCopy?: (text: string) => void;
} & IconButtonProps;

const CopyTextButton = ({
  title,
  disabled = false,
  copyText,
  onCopy,
  tooltipProps,
  ...rest
}: Props) => {
  const handleCopyText = () => {
    if (!copyText?.trim()) {
      return;
    }

    navigator.clipboard.writeText(copyText);
    onCopy?.(copyText);
  };

  return title && !disabled ? (
    <Tooltip
      placement="top"
      title={title}
      open={undefined}
      disableHoverListener={!title}
      arrow
      {...tooltipProps}
    >
      <Box component="span" display="inline-flex" alignItems="center" lineHeight={0}>
        <CopyButton onClick={handleCopyText} disabled={disabled} {...rest} />
      </Box>
    </Tooltip>
  ) : (
    <CopyButton onClick={handleCopyText} disabled={disabled} {...rest} />
  );
};

export default memo(CopyTextButton);
