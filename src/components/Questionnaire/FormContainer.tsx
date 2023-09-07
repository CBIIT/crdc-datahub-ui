import React, { FC, MutableRefObject, useId } from 'react';
import { Button, Typography } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import useFormMode from '../../content/questionnaire/sections/hooks/useFormMode';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
  description: string;
  hideReturnToSubmissions?: boolean;
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
  description, classes, children, formRef, hideReturnToSubmissions = true
}) => {
  const id = useId();
  const navigate = useNavigate();
  const { readOnlyInputs } = useFormMode();

  const returnToSubmissions = () => {
    navigate("/submissions");
  };

  return (
    <div className={classes.formContainer}>
      {!hideReturnToSubmissions && readOnlyInputs ? (
        <Button variant="text" className={classes.returnToSubmissions} onClick={returnToSubmissions}>
          <ArrowBackIcon fontSize="small" />
          Return to all Submissions
        </Button>
      ) : null}
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
    color: "#337E90",
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
  returnToSubmissions: {
    fontWeight: 700,
    fontSize: "14px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "19.6px",
    color: "#2E5481",
    padding: 0,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    verticalAlign: "middle",
    textTranform: "initial",
    "& svg": {
      marginRight: "8px"
    }
  },
});

export default withStyles(styles, { withTheme: true })(FormContainer);
