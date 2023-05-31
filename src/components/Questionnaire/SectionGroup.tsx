import React, { FC } from 'react';
import { Divider, Grid, Typography } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
  title: string;
  divider?: boolean;
  children: React.ReactNode;
};

/**
 * Generic Form Section Grouping (e.g. PI, Primary Contact, etc.)
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SectionGroup: FC<Props> = ({ title, classes, divider = true, children }) => (
  <Grid className={classes.group} container spacing={2}>
    {divider && <Divider className={classes.divider} />}
    <Grid xs={12} item>
      <Typography
        className={classes.groupTitle}
        variant="h6"
      >
        {title}
      </Typography>
    </Grid>
    {children}
  </Grid>
);

const styles = () => ({
  group: {
    marginTop: "25px",
  },
  groupTitle: {
    fontWeight: 600,
    color: "green",
    fontSize: "16px",
  },
  divider: {
    width: "calc(100% - 16px)",
    marginLeft: "16px",
    borderColor: "#3b3b3b",
    borderStyle: "dashed",
  },
});

export default withStyles(styles, { withTheme: true })(SectionGroup);
