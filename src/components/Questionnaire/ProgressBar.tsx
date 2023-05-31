import React, { FC } from 'react';
import { withStyles } from '@mui/styles';
import { useFormContext } from '../Contexts/FormContext';

type Props = {
  classes: any;
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
    <div style={{textAlign: "center"}}>
      <i>Section Progress Bar</i>
    </div>
  );
};

const styles = (theme: any) => ({
  // TODO: Add styles
});

export default withStyles(styles, { withTheme: true })(ProgressBar);
