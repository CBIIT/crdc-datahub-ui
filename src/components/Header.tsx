import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
  classes: WithStyles<typeof styles>['classes'];
};

/**
 * Header Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const Header: FC<Props> = ({ classes } : Props) => {
  return (
    <div className={classes.header}>
      <div>This is Header</div>
      <Button />
      <Link to="/login">
        <Button
          variant="text"
          type="button"
          size="large"
        >
          Login
        </Button>
      </Link>
    </div>
  );
};

const styles = () => ({
  header: {
    alignItems: 'center',
    display: 'flex',
  },
});

export default withStyles(styles)(Header);
