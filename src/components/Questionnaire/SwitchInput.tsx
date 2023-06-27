import React, { FC, ReactElement, useId, useState } from 'react';
import { WithStyles, withStyles } from '@mui/styles';
import { SwitchProps, Grid } from '@mui/material';
import Switch from '@material-ui/core/Switch';
import Tooltip from "./Tooltip";

type Props = {
  classes: WithStyles<typeof styles>['classes'],
  label: string,
  name: string,
  tooltipText?: string;
  required?: boolean;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  value: boolean;
  toggleContent?: ReactElement;
} & Omit<SwitchProps, "color">;

// Define your custom styles
const styles = () => ({
  root: {
    marginBottom: 16,
  },
  // Customize the root class
  switchRoot: {
    width: 65,
    height: 35,
    padding: 0,
  },
  // Customize the switchBase class
  switchBase: {
    paddingTop: 5,
    paddingLeft: 7,
    // Checked Themes
    '&$checked': {
      transform: 'translateX(26px)',
      '& + $track': {
        backgroundColor: '#fff',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  // Customize the thumb class
  thumb: {
    color: "#1D91AB",
    width: 25,
    height: 25,
  },
  // Customize the track class
  track: {
    borderRadius: "60px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #DBDBDB",
    opacity: 1,
  },
  // Customize the checked class
  checked: {},
  // Customize the focusVisible class
  focusVisible: {},
  unchecked: { // Additional style for unchecked state
    // Add your styles for the unchecked state here
  },
  text: {
    display: "inline",
    fontFamily: 'Lato',
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#89A2A7",
    marginLeft: 4,
    marginRight: 4,
  },
  textChecked: {
    display: "inline",
    fontFamily: 'Lato',
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#4E5F63",
    marginLeft: 4,
    marginRight: 4,
  },
  input: {
    display: "none",
  },
  container: {
    display: "flex",
    FlexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#083A50",
    fontSize: "16px",
    fontFamily: "Nunito",
    fontWeight: "700",
    lineHeight: "19.6px",
    minHeight: "20px",
  },
  asterisk: {
    color: "#D54309",
    marginLeft: "6px",
  },
  labelContainer: {
    display: "flex",
    alignItems: "center",
    height: "40px",
  },
  switchYesNoContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "32px",
  },
  tooltip: {
    alignSelf: "start"
  }
});

const CustomSwitch: FC<Props> = ({ classes, label, required, value, name, tooltipText, gridWidth, toggleContent, ...rest }) => {
  const id = useId();
  const [val, setVal] = useState(value || false);
  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <div className={classes.container} style={{ flexWrap: "wrap" }}>
        <div className={classes.labelContainer}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
          {tooltipText && <Tooltip placement="right" className={classes.tooltip} title={tooltipText} />}
        </div>
        <div className={classes.switchYesNoContainer}>
          <div className={val ? classes.text : classes.textChecked}>No</div>
          <Switch
            inputProps={{ datatype: "boolean" }}
            focusVisibleClassName={classes.focusVisible}
            id={id}
            checked={val}
            onChange={(_, c) => { setVal(c); }}
            classes={{
          root: classes.switchRoot,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
            {...rest}
          />
          {/* To satisfy the form parser. The mui switch value is not good for the form parser */}
          <input onChange={() => {}} className={classes.input} name={name} type="radio" data-type="boolean" value={val.toString()} checked />
          <div className={val ? classes.textChecked : classes.text}>Yes</div>
        </div>
      </div>
      {val ? toggleContent : <div />}
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(CustomSwitch);
