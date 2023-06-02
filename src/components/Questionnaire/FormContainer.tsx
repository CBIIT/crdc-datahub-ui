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
        <Typography className={classes.sectionTitle} variant="h1">
          {title}
        </Typography>
        <Typography className={classes.sectionDesc} variant="h2">
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
    border: "2px solid #3b3b3b",
    background: "transparent",
    borderRadius: "4px",
  },
  titleGroup: {
    background: "#ddd",
    color: "#3b3b3b",
    padding: "25px 40px",
    marginBottom: "10px",
    borderRadius: "4px 4px 0 0",
    display: "flex",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: 500,
    marginRight: "30px",
    fontSize: "30px",
  },
  sectionDesc: {
    fontWeight: 300,
    fontSize: "23px",
  },
});

export default withStyles(styles, { withTheme: true })(FormContainer);
