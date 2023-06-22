import { IconButton, Tooltip as MuiToolTip, TooltipProps, styled } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

const StyledTooltip = styled((props: TooltipProps) => (
  <MuiToolTip classes={{ popper: props.className }} {...props} />
))(() => ({
  "& .MuiTooltip-tooltip": {
    minWidth: "412px",
    minHeight: "43px",
    color: "#2B528B",
    border: "1px solid #2B528B",
    background: "#FFFFFF",
    padding: "12px 15px",
    borderRadius: "12px",
    fontWeight: "400",
    fontFamily: "'Inter', 'Rubik', sans-serif",
    fontSize: "16px",
    lineHeight: "19px",
  },
}));

const TooltipButton = styled(IconButton)(() => ({
  padding: 0,
  fontSize: "12px",
  verticalAlign: "top",
  marginLeft: '6px',
  color: '#000000',
}));

const TooltipIcon = styled(InfoIcon)`
  font-size: 12px;
  color: inherit;
`;

type Props = {
  icon?: React.ReactElement | JSX.Element;
} & Partial<TooltipProps>;

const Tooltip = ({ classes, icon, children, title, ...rest }: Props) => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState<boolean>(false);

  const toggleTooltip = () => {
    setTooltipIsOpen((tooltipIsOpen) => !tooltipIsOpen);
  };

  const closeTooltip = () => {
    setTooltipIsOpen(false);
  };

  return (
    <StyledTooltip
      open={tooltipIsOpen}
      onBlur={closeTooltip}
      title={title || ""}
      disableHoverListener
      {...rest}
    >
      {children ?? (
        <TooltipButton onClick={toggleTooltip} disableRipple>
          {icon ?? <TooltipIcon />}
        </TooltipButton>
      )}
    </StyledTooltip>
  );
};

export default Tooltip;
