import React, { FC } from "react";
import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  title?: string | JSX.Element;
  description?: string | JSX.Element;
  endButton?: JSX.Element;
  divider?: boolean;
  children: React.ReactNode;
};

/**
 * Generic Form Section Grouping (e.g. PI, Primary Contact, etc.)
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SectionGroup: FC<Props> = ({
  title,
  description,
  classes,
  children,
  endButton,
  divider = false,
}) => (
  <>
    {divider && <Divider className={classes.divider} />}
    <Grid
      className={classes.group}
      container
      rowSpacing={0}
      columnSpacing={1.5}
    >
      <Grid className={classes.groupHeader} xs={12} item>
        <Stack direction="row" alignItems="center">
          {title && (
            <Typography className={classes.groupTitle} variant="h6">
              {title}
              {description && (
                <span className={classes.groupDescription}>
                  {' '}
                  {description}
                </span>
              )}
            </Typography>
          )}
          {endButton && (
            <Box className={classes.endButtonWrapper}>{endButton}</Box>
          )}
        </Stack>
      </Grid>
      {children}
    </Grid>
  </>
);

const styles = () => ({
  group: {
    marginTop: "70px",
    "&:first-of-type": {
      marginTop: 0,
    },
    "& > .MuiGrid-container": {
      marginTop: "24px",
    },
    "& > .MuiGrid-item + .MuiGrid-container": {
      marginTop: 0,
    },
  },
  groupHeader: {
    marginBottom: "24px",
  },
  groupTitle: {
    fontWeight: 700,
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "19.6px",
    color: "#34A286",
    fontSize: "16px",
  },
  groupDescription: {
    fontWeight: 400,
  },
  divider: {
    borderColor: "#ACC7E5",
    borderStyle: "solid",
    width: "100%",
    marginTop: "25px",
    marginBottom: "0",
  },
  endButtonWrapper: {
    marginLeft: "auto",
  },
});

export default withStyles(styles, { withTheme: true })(SectionGroup);
