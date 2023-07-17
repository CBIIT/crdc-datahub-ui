import React, { FC, createRef, useEffect, useRef, useState } from 'react';
import {
  Link, useNavigate,
  unstable_useBlocker as useBlocker, unstable_Blocker as Blocker
} from 'react-router-dom';
import { isEqual } from 'lodash';
import { Button, Container, Divider, Stack, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { WithStyles, withStyles } from "@mui/styles";
import ForwardArrowIcon from '@mui/icons-material/ArrowForwardIos';
import BackwardArrowIcon from '@mui/icons-material/ArrowBackIos';
import { Status as FormStatus, useFormContext } from '../../components/Contexts/FormContext';
import SuspenseLoader from '../../components/SuspenseLoader';
import StatusBar from '../../components/StatusBar/StatusBar';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Section from './sections';
import map from '../../config/SectionConfig';
import UnsavedChangesDialog from '../../components/Questionnaire/UnsavedChangesDialog';
import PageBanner from '../../components/PageBanner';
import bannerPng from "../../assets/banner/banner_background.png";

const StyledContainer = styled(Container)(() => ({
  "&.MuiContainer-root": {
    padding: 0,
    minHeight: "300px",
  }
}));

type Props = {
  section?: string;
  classes: WithStyles<typeof styles>['classes'];
};

const validateSection = (section: string) => typeof map[section] !== 'undefined';

const StyledSidebar = styled(Stack)({
  position: "sticky",
  top: "25px",
  paddingTop: "45px",
});

const StyledDivider = styled(Divider)({
  height: "520px",
  width: "1px",
  borderRightWidth: "2px",
  borderRightColor: "#E8EAEE9",
  margin: "0 23px",
});

const StyledContentWrapper = styled(Stack)({
  paddingBottom: "75px",
});

/**
 * Intake Form View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FormView: FC<Props> = ({ section, classes } : Props) => {
  const navigate = useNavigate();
  const { status, data, setData, error } = useFormContext();
  const [activeSection, setActiveSection] = useState<string>(validateSection(section) ? section : "A");
  const [blockedNavigate, setBlockedNavigate] = useState<boolean>(false);

  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);
  const prevSection = sectionKeys[sectionIndex - 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex - 1]}` : null;
  const nextSection = sectionKeys[sectionIndex + 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex + 1]}` : null;

  const refs = {
    saveFormRef: createRef<HTMLButtonElement>(),
    submitFormRef: createRef<HTMLButtonElement>(),
    getFormObjectRef: useRef<(() => FormObject) | null>(null),
  };

  // Intercept React Router navigation actions with unsaved changes
  const blocker: Blocker = useBlocker(() => {
    if (isDirty()) {
      setBlockedNavigate(true);
      return true;
    }

    return false;
  });

  // Intercept browser navigation actions (e.g. closing the tab) with unsaved changes
  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (isDirty()) {
        event.preventDefault();
        event.returnValue = 'You have unsaved form changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });

  useEffect(() => {
    setActiveSection(validateSection(section) ? section : "A");
  }, [section]);

  /**
   * Determines if the form has unsaved changes.
   *
   * @returns {boolean} true if the form has unsaved changes, false otherwise
   */
  const isDirty = () : boolean => {
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    return ref && (!data || !isEqual(data, newData));
  };

  /**
   * Saves the form data to the database.
   *
   * NOTE:
   * - This function relies on HTML5 reportValidity() to
   *   validate the form section status.
   *
   * @returns {Promise<boolean>} true if the save was successful, false otherwise
   */
  const saveForm = async (hideValidation = false) => {
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref.current || !newData) {
      return false;
    }

    // Update section status
    const newStatus = ref.current.checkValidity() ? "Completed" : "In Progress";
    if (!hideValidation) {
      ref.current.reportValidity();
    }
    const currentSection : Section = newData.sections.find((s) => s.name === activeSection);
    if (currentSection) {
      currentSection.status = newStatus;
    } else {
      newData.sections.push({ name: activeSection, status: newStatus });
    }

    // Skip state update if there are no changes
    if (!isEqual(data, newData)) {
      const r = await setData(newData);

      if (!blockedNavigate && r && data["_id"] === "new" && r !== data?.['_id']) {
        navigate(`/submission/${r}/${activeSection}`, { replace: true });
      }

      return r;
    }

    return data?.["_id"];
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
    const newId = await saveForm(true);

    if (newId) {
      setBlockedNavigate(false);
      blocker.proceed?.();
      navigate(blocker.location.pathname.replace("new", newId), { replace: true });
    }
  };

  /**
   * Provides a discard handler for the Unsaved Changes
   * dialog. Will discard the form changes and then navigate to the
   * blocked section.
   *
   * @returns {void}
   */
  const discardAndNavigate = () => {
    setBlockedNavigate(false);
    blocker.proceed?.();
  };

  if (status === FormStatus.LOADING) {
    return <SuspenseLoader />;
  }

  if (status === FormStatus.ERROR || !data) {
    navigate('/submissions', {
      state: { error: error || 'Unknown form loading error' },
    });
    return null;
  }

  return (
    <>
      <PageBanner
        title="Submission Request"
        pageTitle="Submission Request Form"
        subTitle="The following set of high-level questions are intended to provide insight to the CRDC Data Hub, related to data storage, access, secondary sharing needs and other requirements of data submitters."
        bannerSrc={bannerPng}
      />

      <StyledContainer maxWidth="xl">
        <StyledContentWrapper direction="row" justifyContent="center">
          <StyledSidebar
            direction="row"
            justifyContent="center"
            alignSelf="flex-start"
          >
            <ProgressBar section={activeSection} />
            <StyledDivider orientation="vertical" />
          </StyledSidebar>

          <Stack className={classes.content} direction="column" spacing={5}>
            <StatusBar />

            <Section section={activeSection} refs={refs} />

            <Stack
              className={classes.controls}
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Link to={prevSection} style={{ pointerEvents: prevSection ? "initial" : "none" }}>
                <Button
                  id="submission-form-back-button"
                  className={classes.backButton}
                  variant="outlined"
                  type="button"
                  disabled={status === FormStatus.SAVING || !prevSection}
                  size="large"
                  startIcon={<BackwardArrowIcon />}
                >
                  Back
                </Button>
              </Link>
              <LoadingButton
                id="submission-form-save-button"
                className={classes.saveButton}
                variant="outlined"
                type="button"
                ref={refs.saveFormRef}
                size="large"
                loading={status === FormStatus.SAVING}
                onClick={() => saveForm()}
              >
                Save
              </LoadingButton>
              <LoadingButton
                id="submission-form-submit-button"
                className={classes.submitButton}
                variant="outlined"
                type="submit"
                ref={refs.submitFormRef}
                size="large"
              >
                Submit
              </LoadingButton>
              <Link to={nextSection} style={{ pointerEvents: nextSection ? "initial" : "none" }}>
                <Button
                  id="submission-form-next-button"
                  className={classes.nextButton}
                  variant="outlined"
                  type="button"
                  disabled={status === FormStatus.SAVING || !nextSection}
                  size="large"
                  endIcon={<ForwardArrowIcon />}
                >
                  Next
                </Button>
              </Link>
            </Stack>
          </Stack>
        </StyledContentWrapper>
      </StyledContainer>

      <UnsavedChangesDialog
        open={blockedNavigate}
        onCancel={() => setBlockedNavigate(false)}
        onSave={saveAndNavigate}
        onDiscard={discardAndNavigate}
        disableActions={status === FormStatus.SAVING}
      />
    </>
  );
};

const styles = () => ({
  header: {
    width: "100%",
    height: "300px",
    background: "#F2F4F8",
  },
  content: {
    width: "100%",
    maxWidth: "980px",
    marginLeft: '41px',
  },
  controls: {
    color: "#FFFFFF",
    marginTop: "15px !important",
    "& button": {
      margin: "0 6px",
      padding: "14px 11px",
      minWidth: "128px",
      fontWeight: 700,
      fontSize: '16px',
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      letterSpacing: "2%",
      lineHeight: "20.14px",
      borderRadius: "8px",
      borderColor: "#828282",
      background: "#949494",
      color: "inherit",
      textTransform: "none",
    },
    "& button:disabled": {
      background: "#D9DEE4",
    },
    "& button:hover:not([disabled])": {
      color: "#fff",
      background: "#2A2A2A",
    },
    "& a": {
      color: "inherit",
      textDecoration: "none",
    },
    "& .MuiButton-startIcon": {
      marginRight: "20px",
    },
    "& .MuiButton-endIcon": {
      marginLeft: "20px"
    },
    "& .MuiSvgIcon-root": {
      fontSize: "20px"
    }
  },
  backButton: {
    "&.MuiButton-root": {
      display: "flex",
      justifyContent: "flex-start"
    }
  },
  nextButton: {
    "&.MuiButton-root": {
      display: "flex",
      justifyContent: "flex-end"
    }
  },
  saveButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#22A584"
    }
  },
  submitButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#22A584"
    }
  },
});

export default withStyles(styles)(FormView);
