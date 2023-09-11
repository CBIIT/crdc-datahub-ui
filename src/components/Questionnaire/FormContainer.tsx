import React, { HTMLProps, MutableRefObject, forwardRef, useId } from 'react';
import { Button, ButtonProps, Typography, styled } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import useFormMode from '../../content/questionnaire/sections/hooks/useFormMode';

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isVisible"
})<ButtonProps & { isVisible: boolean; }>(({ isVisible }) => ({
  visibility: isVisible ? "visible" : "hidden",
  fontWeight: 700,
  fontSize: "14px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  color: "#2E5481",
  padding: 0,
  marginTop: 0,
  marginBottom: "16px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  verticalAlign: "middle",
  textTranform: "initial",
  "& svg": {
    marginRight: "8px"
  }
}));

const StyledFormContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "returnIsVisible"
})<HTMLProps<HTMLDivElement> & { returnIsVisible: boolean; }>(({ returnIsVisible }) => ({
  background: "transparent",
  borderRadius: "8px",
  paddingBottom: "25px",
  marginTop: returnIsVisible ? "0 !important" : "-36px !important",
  scrollMarginTop: "0px",
}));

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
const FormContainer = forwardRef<HTMLDivElement, Props>(({
  description,
  classes,
  children,
  formRef,
  hideReturnToSubmissions = true,
}, ref) => {
  const id = useId();
  const navigate = useNavigate();
  const { readOnlyInputs } = useFormMode();

  const returnToSubmissions = () => {
    navigate("/submissions");
  };

  return (
    <StyledFormContainer ref={ref} returnIsVisible={!hideReturnToSubmissions && readOnlyInputs}>
      <StyledButton
        isVisible={!hideReturnToSubmissions && readOnlyInputs}
        variant="text"
        onClick={returnToSubmissions}
      >
        <ArrowBackIcon fontSize="small" />
        Return to all Submissions
      </StyledButton>
      <div className={classes.titleGroup}>
        <Typography className={classes.sectionTitle} variant="h2">
          {description}
        </Typography>
      </div>
      <form
        id={id}
        ref={formRef}
        className={classes.form}
        onSubmit={(e) => e.preventDefault()}
      >
        {children}
      </form>
    </StyledFormContainer>
  );
});

const styles = () => ({
  formContainer: {
    background: "transparent",
    borderRadius: "8px",
    paddingBottom: "25px",
    marginTop: "0px !important",
    scrollMarginTop: "30px"
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
