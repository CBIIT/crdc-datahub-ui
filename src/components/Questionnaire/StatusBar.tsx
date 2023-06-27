/* eslint-disable */
/* TODO: Remove above during component development */
import React, { FC } from 'react';
import { WithStyles, withStyles } from '@mui/styles';
import { useFormContext } from '../Contexts/FormContext';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
};

/**
 * Form Overview/Status Bar Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const StatusBar: FC<Props> = ({ classes }) => {
  // Access the data from the form context
  // console.log(data);

  return (
    <div style={{ textAlign: "center" }}>
      <i>Status Bar</i>
    </div>
  );
};

const styles = () => ({
  // TODO: Add styles
});

export default withStyles(styles, { withTheme: true })(StatusBar);
