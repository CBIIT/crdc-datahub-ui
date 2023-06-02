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
  <>
    {divider && <Divider className={classes.divider} />}
    <Grid className={classes.group} container rowSpacing={1} columnSpacing={8}>
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
  </>
);

const styles = () => ({
  group: {
    marginTop: "25px",
    padding: "0 82px",
  },
  groupTitle: {
    fontWeight: 600,
    color: "green",
    fontSize: "17px",
    margin: "0 -25px",
    marginBottom: "10px",
  },
  divider: {
    borderColor: "#3b3b3b",
    borderStyle: "solid",
    width: "100%",
    marginTop: "25px",
    marginBottom: "35px",
  },
});

export default withStyles(styles, { withTheme: true })(SectionGroup);
