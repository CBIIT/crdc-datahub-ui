import { IconButton, IconButtonProps, styled, TooltipProps } from "@mui/material";
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
  disabled?: boolean;
  tooltipProps?: TooltipProps;
  copyText: string;
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
    onCopy(copyText);
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
      <span>
        <CopyButton onClick={handleCopyText} disabled={disabled} {...rest} />
      </span>
    </Tooltip>
  ) : (
    <CopyButton onClick={handleCopyText} disabled={disabled} {...rest} />
  );
};

export default CopyTextButton;
