import React, { FC, createRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withStyles } from "@mui/styles";
import ForwardArrowIcon from '@mui/icons-material/ArrowForwardIos';
import BackwardArrowIcon from '@mui/icons-material/ArrowBackIos';
import { Status as FormStatus, useFormContext } from '../../components/Contexts/FormContext';
import SuspenseLoader from '../../components/SuspenseLoader';
import StatusBar from '../../components/Questionnaire/StatusBar';
import ProgressBar from '../../components/Questionnaire/ProgressBar';
import { default as Section, map } from './sections';

type Props = {
  section?: string;
  classes: any;
};

const validateSection = (section: string) => {
  return typeof map[section] !== 'undefined';
};

/**
 * Intake Form View Component
 *
 * @param {object} classes - Classes passed from Material UI Theme
 * @param {string} section - Current form section
 * @returns {JSX.Element}
 */
const FormView: FC<Props> = ({ section, classes } : Props) => {
  const navigate = useNavigate();
  const [form] = useFormContext();
  const { status, data, error } = form;
  const [activeSection, setActiveSection] = useState(validateSection(section) ? section : "A");
  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);

  const refs = {
    saveForm: createRef<HTMLButtonElement>(),
    submitForm: createRef<HTMLButtonElement>(),
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
    return;
  }

  return (
    <div>
      <StatusBar />
      <ProgressBar />
      <Section section={activeSection} refs={refs} />

      {/* TODO: section navigation styles */}
      <div>
        <button onClick={goBack} disabled={!sectionKeys[sectionIndex - 1]}>
          <BackwardArrowIcon />
        </button>
        <button onClick={goForward} disabled={!sectionKeys[sectionIndex + 1]}>
          <ForwardArrowIcon />
        </button>
      </div>

      {/* TODO: form control styles */}
      <div className={classes.formControls}>
        <button ref={refs.saveForm}>Save</button>
        <button ref={refs.submitForm}>Submit</button>
      </div>
    </div>
  );
};

const styles = () => ({
  formControls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
    padding: "10px",
  },
});

export default withStyles(styles)(FormView);
