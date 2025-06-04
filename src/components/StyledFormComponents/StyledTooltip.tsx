import { Tooltip as MuiToolTip, TooltipProps, styled } from "@mui/material";

type TooltipPropsWithDynamic = TooltipProps & {
  /**
   * Indicates when text content within tooltip is dynamic. This
   * increases the maxWidth of the tooltip.
   *
   * NOTE: It is is false by default
   */
  dynamic?: boolean;
};

const StyledTooltip = styled(
  ({ dynamic, ...tooltipProps }: TooltipPropsWithDynamic) => (
    <MuiToolTip classes={{ popper: tooltipProps.className }} {...tooltipProps} />
  ),
  { shouldForwardProp: (prop) => prop !== "dynamic" }
)(({ dynamic = false }) => ({
  "& .MuiTooltip-tooltip": {
    maxWidth: dynamic ? "1000px" : "412px",
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
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.15)",
  },
}));

export default StyledTooltip;
