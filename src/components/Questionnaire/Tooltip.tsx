import { Tooltip as MuiToolTip, TooltipProps } from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import InfoIcon from "@mui/icons-material/Info";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
} & Partial<TooltipProps>;

const Tooltip = ({ classes, children, ...rest }: Props) => (
  <MuiToolTip title="" classes={{ popper: classes.root }} {...rest}>
    {children || <InfoIcon className={classes.icon} />}
  </MuiToolTip>
);

const styles = () => ({
  root: {
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
  },
  icon: {
    fontSize: "12px",
    verticalAlign: "top",
    marginLeft: "6px",
  },
});

export default withStyles(styles)(Tooltip);
