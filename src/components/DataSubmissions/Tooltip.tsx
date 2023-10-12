import {
  Tooltip as MuiToolTip,
  TooltipProps,
  Typography,
  styled,
} from "@mui/material";

const StyledTooltip = styled((props: TooltipProps) => (
  <MuiToolTip classes={{ popper: props.className }} {...props} />
))(() => ({
  cursor: "pointer",
  "& .MuiTooltip-tooltip": {
    cursor: "initial",
    maxWidth: "264px",
    width: "264px",
    minHeight: "43px",
    color: "#2B528B",
    border: "1px solid #2B528B",
    background: "#FFFFFF",
    padding: "13px 21px 17px",
    borderRadius: "12px",
    fontWeight: "400",
    fontFamily: "'Inter', 'Rubik', sans-serif",
    fontSize: "16px",
    lineHeight: "19px",
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTitle = styled(Typography)(() => ({
  color: "#346798",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "20px",
}));

const StyledSubtitle = styled(Typography)(() => ({
  color: "#346798",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontSize: "18px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "20px",
}));

const StyledBodyWrapper = styled("div")(() => ({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
}));

type Props = {
  icon?: React.ReactElement | JSX.Element;
  title?: string;
  subtitle?: string;
  body?: string | JSX.Element;
} & Partial<TooltipProps>;

const Tooltip = ({
  classes,
  icon,
  children,
  title,
  subtitle,
  body,
  placement,
  ...rest
}: Props) => (
  <StyledTooltip
    title={(
      <>
        {title && <StyledTitle variant="h5">{title}</StyledTitle>}
        {subtitle && <StyledSubtitle variant="h6">{subtitle}</StyledSubtitle>}
        {body && <StyledBodyWrapper>{body}</StyledBodyWrapper>}
      </>
    )}
    placement={placement || "bottom"}
    {...rest}
  >
    {children}
  </StyledTooltip>
);

export default Tooltip;
