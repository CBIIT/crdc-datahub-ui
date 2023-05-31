/* eslint-disable */
/* TODO: Remove above during component development */
import React, { FC } from 'react';
import { WithStyles, withStyles } from '@mui/styles';
import { useFormContext } from '../Contexts/FormContext';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
};

/**
 * Form Section Progress Bar Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProgressBar: FC<Props> = ({ classes }) => {
  // Access the data from the form context
  // console.log(data);

  return (
    <div style={{ textAlign: "center" }}>
      <i>Section Progress Bar</i>
    </div>
  );
};

const styles = () => ({
  // TODO: Add styles
});

export default withStyles(styles, { withTheme: true })(ProgressBar);
