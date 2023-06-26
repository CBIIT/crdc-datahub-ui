import React, { FC } from 'react';
import { WithStyles, withStyles } from '@mui/styles';
import { useLocation } from 'react-router-dom';
import { Alert } from '@mui/material';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
};

/*
  TODO
  - Create a context for the listing view (similar to FormContext)
  - Fetch & render the list of applications from the API
  - Update Props type as necessary
  - ...etc
*/

const ListingView: FC<Props> = ({ classes } : Props) => {
  const { state } = useLocation();

  return (
    <div>
      {state?.error && (<Alert severity="error">{state?.error}</Alert>)}
      <ul>
        <li><a className={classes.example} href="questionnaire/1234">Application #248191 – Approved</a></li>
        <li><a href="questionnaire/ABC">Application #931344 – Invalid ID example</a></li>
      </ul>
      <button type="button">Create new app</button>
    </div>
  );
};

const styles = () => ({
  example: {
    fontWeight: 'bold',
    color: 'red',
  }
});

export default withStyles(styles)(ListingView);
