import React, { FC } from 'react';
import { Divider, Grid, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';

type Props = {
  classes: any;
  title: string;
  divider?: boolean;
  children: any;
};

/**
 * Generic Form Section Grouping (e.g. PI, Primary Contact, etc.)
 *
 * @param {Props} props
 * @param {string} props.title The title of the form section group
 * @param {object} props.classes The classes passed from Material UI Theme
 * @param {boolean} [props.divider] Whether or not to display a divider
 * @param {any} props.children The children of the form section group
 * @returns {JSX.Element}
 */
const SectionGroup: FC<Props> = ({ title, classes, divider = true, children }) => {
  return (
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
};

const styles = (theme: any) => ({
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
