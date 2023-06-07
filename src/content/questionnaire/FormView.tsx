import React, { FC, createRef, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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
  const [blockedNavigate, setBlockedNavigate] = useState(null);
  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);

  const refs = {
    saveFormRef: createRef<HTMLButtonElement>(),
    submitFormRef: createRef<HTMLButtonElement>(),
    saveHandlerRef: useRef<(() => Promise<boolean>) | null>(null),
    isDirtyHandlerRef: useRef<(() => boolean) | null>(null),
  };

  // Intercept browser navigation actions (e.g. closing the tab) with unsaved changes
  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (refs.isDirtyHandlerRef.current?.()) {
        event.preventDefault();
        event.returnValue = 'You have unsaved form changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });

  /**
   * Handles the actual navigation to a specific section
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
   * Wrapper for navigating to the next section
   * will catch an unsaved form and open the prompt
   *
   * @param {number} direction
   * @returns {void}
   */
  const goToSection = (direction: -1 | 1) => {
    const section = sectionKeys[sectionIndex + direction];

    if (!section) {
      return;
    }
    if (refs.isDirtyHandlerRef.current?.()) {
      // TODO: React Router removed the ability to intercept navigation events in v6, thus
      // we cannot block react-router-dom navigation actions. Once useBlocker is added back in, we
      // can remove the blockedNavigate state and use the navigateToSection function directly
      // by blocking navigation at the Form Section level.
      setBlockedNavigate(section);
      return;
    }

    navigateToSection(section);
  };

  /**
   * Provides a save handler for the Unsaved Changes
   * dialog. Will save the form and then navigate to the
   * blocked section.
   *
   * @returns {void}
   */
  const saveAndNavigate = async () => {
    // Wait for the save handler to complete
    await refs.saveHandlerRef.current?.();
    setBlockedNavigate(null);
    navigateToSection(blockedNavigate);
  };

  /**
   * Provides a discard handler for the Unsaved Changes
   * dialog. Will discard the form changes and then navigate to the
   * blocked section.
   *
   * @returns {void}
   */
  const discardAndNavigate = () => {
    setBlockedNavigate(null);
    navigateToSection(blockedNavigate);
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
          onClick={() => goToSection(-1)}
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
          onClick={() => refs.saveHandlerRef.current?.()}
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
          onClick={() => goToSection(1)}
          disabled={status === FormStatus.SAVING || !sectionKeys[sectionIndex + 1]}
          size="large"
          endIcon={<ForwardArrowIcon />}
        >
          Next
        </Button>
      </div>

      <Dialog open={blockedNavigate !== null}>
        <DialogTitle>
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Your changes will be lost if you leave this section without saving.
            Do you want to save your data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockedNavigate(null)} disabled={status === FormStatus.SAVING}>Cancel</Button>
          <Button onClick={saveAndNavigate} disabled={status === FormStatus.SAVING} autoFocus>Save</Button>
          <Button onClick={discardAndNavigate} disabled={status === FormStatus.SAVING} color="error">Discard</Button>
        </DialogActions>
      </Dialog>
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
