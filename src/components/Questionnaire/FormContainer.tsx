import React, { FC, MutableRefObject, useId } from 'react';
import { Typography } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
  title: string;
  description: string;
  children: React.ReactNode;
  formRef?: MutableRefObject<HTMLFormElement>;
};

/**
 * Generic Outtermost Form Section Container Element (e.g. Section A, ...)
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FormContainer: FC<Props> = ({
  title, description, classes, children,
  formRef,
}) => {
  const id = useId();

  return (
    <div className={classes.formContainer}>
      <div className={classes.titleGroup}>
        <Typography className={classes.sectionTitle} variant="h5">
          {title}
        </Typography>
        <Typography className={classes.sectionDesc} variant="h6">
          {description}
        </Typography>
      </div>
      <form id={id} ref={formRef} onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
    </div>
  );
};

const styles = () => ({
  formContainer: {
    padding: "20px",
    border: "1px solid #3b3b3b",
    background: "#f2f5f7",
    borderRadius: "4px",
  },
  titleGroup: {
    background: "#f2f2f2",
    padding: "20px",
    margin: "-20px",
    marginBottom: "10px",
    borderRadius: "4px 4px 0 0",
    display: "flex",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: 600,
    color: "blue",
    marginRight: "20px",
  },
  sectionDesc: {
    fontWeight: 300,
    color: "blue",
  },
});

export default withStyles(styles, { withTheme: true })(FormContainer);
