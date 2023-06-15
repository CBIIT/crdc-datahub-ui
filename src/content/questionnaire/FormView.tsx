import React, { FC, createRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { WithStyles, withStyles } from "@mui/styles";
import ForwardArrowIcon from '@mui/icons-material/ArrowForwardIos';
import BackwardArrowIcon from '@mui/icons-material/ArrowBackIos';
import { Status as FormStatus, useFormContext } from '../../components/Contexts/FormContext';
import SuspenseLoader from '../../components/SuspenseLoader';
import StatusBar from '../../components/Questionnaire/StatusBar';
import ProgressBar from '../../components/Questionnaire/ProgressBar';
import Section, { map } from './sections';

type Props = {
  section?: string;
  classes: WithStyles<typeof styles>['classes'];
};

const validateSection = (section: string) => typeof map[section] !== 'undefined';

/**
 * Intake Form View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FormView: FC<Props> = ({ section, classes } : Props) => {
  const navigate = useNavigate();
  const { status, data, error } = useFormContext();
  const [activeSection, setActiveSection] = useState(validateSection(section) ? section : "A");
  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);

  const refs = {
    saveFormRef: createRef<HTMLButtonElement>(),
    submitFormRef: createRef<HTMLButtonElement>(),
  };

  /**
   * Trigger navigation to a specific section
   *
   * @param section string
   * @returns void
   */
  const navigateToSection = (section: string) => {
    if (!validateSection(section.toUpperCase())) {
      return;
    }
    if (section.toUpperCase() === activeSection) {
      return;
    }

    navigate(`/questionnaire/${data?.id}/${section}`);
    setActiveSection(section);
  };

  /**
   * Traverse to the previous section
   *
   * @returns void
   */
  const goBack = () => {
    const previousSection = sectionKeys[sectionIndex - 1];

    if (previousSection) {
      navigateToSection(previousSection);
    }
  };

  /**
   * Traverse to the next section
   *
   * @returns void
   */
  const goForward = () => {
    const nextSection = sectionKeys[sectionIndex + 1];

    if (nextSection) {
      navigateToSection(nextSection);
    }
  };

  if (status === FormStatus.LOADING) {
    return <SuspenseLoader />;
  }

  if (status === FormStatus.ERROR || !data) {
    navigate('/questionnaire', {
      state: { error: error || 'Unknown form loading error' },
    });
    return null;
  }

  return (
    <div>
      <StatusBar />
      <ProgressBar />
      <Section section={activeSection} refs={refs} />

      <div className={classes.formControls}>
        <Button
          variant="outlined"
          type="button"
          onClick={goBack}
          disabled={status === FormStatus.SAVING || !sectionKeys[sectionIndex - 1]}
          size="large"
          startIcon={<BackwardArrowIcon />}
        >
          Back
        </Button>
        <LoadingButton
          variant="outlined"
          type="button"
          ref={refs.saveFormRef}
          size="large"
          loading={status === FormStatus.SAVING}
        >
          Save
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          type="submit"
          ref={refs.submitFormRef}
          size="large"
        >
          Submit
        </LoadingButton>
        <Button
          variant="outlined"
          type="button"
          onClick={goForward}
          disabled={status === FormStatus.SAVING || !sectionKeys[sectionIndex + 1]}
          size="large"
          endIcon={<ForwardArrowIcon />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const styles = () => ({
  formControls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "transparent",
    margin: "25px 0",
    color: "#000000",
    "& button": {
      margin: "0 6px",
      padding: "10px 20px",
      minWidth: "115px",
      borderRadius: "24px",
      color: "inherit",
      borderColor: "#8B9EB3 !important",
      background: "#fff",
      textTransform: "none",
    },
    "& button:disabled": {
      background: "#D9DEE4",
    },
    "& button:hover:not([disabled])": {
      color: "#fff",
      background: "#2A2A2A",
    },
  },
});

export default withStyles(styles)(FormView);
