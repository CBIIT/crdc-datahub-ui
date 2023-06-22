import React, { FC, useId, useState } from 'react';
import { WithStyles, withStyles } from '@mui/styles';
import { SwitchProps } from '@mui/material';
import Switch from '@material-ui/core/Switch';

type Props = {
  classes: WithStyles<typeof styles>['classes'],
  label: string,
  name: string,
  required: boolean;
  value: boolean;
} & Omit<SwitchProps, "color">;

// Define your custom styles
const styles = (theme) => ({
  // Customize the root class
  root: {
    width: 65,
    height: 35,
    padding: 0,
    margin: theme.spacing(1),
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
  },
  textChecked: {
    display: "inline",
    fontFamily: 'Lato',
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#4E5F63",
  }
});

// Create the customized Switch component using withStyles HOC
const CustomSwitch: FC<Props> = ({ classes, label, required, value, ...rest }) => {
    const id = useId();
    const [val, setVal] = useState(value);
    return (
      <div>
        <div className={val ? classes.text : classes.textChecked}>No</div>
        <Switch
          focusVisibleClassName={classes.focusVisible}
          id={id}
          checked={val}
          value={val}
          onChange={(e, c) => { setVal(c); console.log('event:', `new value is: ${c}`); }}
          classes={{
            root: classes.root,
            switchBase: classes.switchBase,
            thumb: classes.thumb,
            track: classes.track,
            checked: classes.checked,
          }}
          {...rest}
        />
        <div className={val ? classes.textChecked : classes.text}>Yes</div>
      </div>
  );
};

export default withStyles(styles, { withTheme: true })(CustomSwitch);
