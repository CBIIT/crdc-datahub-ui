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
        <Typography className={classes.sectionTitle} variant="h2">
          {description}
        </Typography>
      </div>
      <form id={id} ref={formRef} className={classes.form} onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
    </div>
  );
};

const styles = () => ({
  formContainer: {
    background: "transparent",
    borderRadius: "8px",
    paddingBottom: "25px",
    marginTop: "50px !important"
  },
  form: {
    fontWeight: 400,
    fontSize: '16px',
    fontFamily: "'Nunito', 'Rubik', sans-serif",
  },
  titleGroup: {
    background: "transparent",
    color: "#327E8F",
    paddingBottom: "40px",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: "24px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "32.74px",
  },
});

export default withStyles(styles, { withTheme: true })(FormContainer);
