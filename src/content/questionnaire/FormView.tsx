import React, { FC, createRef, useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  unstable_useBlocker as useBlocker, unstable_Blocker as Blocker
} from 'react-router-dom';
import { isEqual } from 'lodash';
import { Alert, Button, Container, Divider, Stack, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { WithStyles, withStyles } from "@mui/styles";
import ForwardArrowIcon from '@mui/icons-material/ArrowForwardIos';
import BackwardArrowIcon from '@mui/icons-material/ArrowBackIos';
import { Status as FormStatus, useFormContext } from '../../components/Contexts/FormContext';
import SuspenseLoader from '../../components/SuspenseLoader';
import StatusBar from '../../components/StatusBar/StatusBar';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Section from './sections';
import map, { InitialSections } from '../../config/SectionConfig';
import UnsavedChangesDialog from '../../components/Questionnaire/UnsavedChangesDialog';
import SubmitFormDialog from '../../components/Questionnaire/SubmitFormDialog';
import useFormMode from './sections/hooks/useFormMode';
import RejectFormDialog from '../../components/Questionnaire/RejectFormDialog';
import ApproveFormDialog from '../../components/Questionnaire/ApproveFormDialog';
import PageBanner from '../../components/PageBanner';
import bannerPng from "../../assets/banner/banner_background.png";
import GenericAlert from '../../components/GenericAlert';
import { Status as AuthStatus, useAuthContext } from '../../components/Contexts/AuthContext';

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

const StyledAlert = styled(Alert)({
  fontWeight: 400,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  scrollMarginTop: "64px"
});

/**
 * Intake Form View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FormView: FC<Props> = ({ section, classes } : Props) => {
  const navigate = useNavigate();
  const { status, data, setData, submitData, approveForm, rejectForm, error } = useFormContext();
  const { status: authStatus } = useAuthContext();
  const [activeSection, setActiveSection] = useState<string>(validateSection(section) ? section : "A");
  const [blockedNavigate, setBlockedNavigate] = useState<boolean>(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState<boolean>(false);
  const [openApproveDialog, setOpenApproveDialog] = useState<boolean>(false);
  const [openRejectDialog, setOpenRejectDialog] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const { formMode, readOnlyInputs, userCanReview, userCanEdit } = useFormMode();
  const [changesAlert, setChangesAlert] = useState<string>("");
  const [allSectionsComplete, setAllSectionsComplete] = useState<boolean>(false);

  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);
  const prevSection = sectionKeys[sectionIndex - 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex - 1]}` : null;
  const nextSection = sectionKeys[sectionIndex + 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex + 1]}` : null;
  const isSectionD = activeSection === "D";
  const errorAlertRef = useRef(null);
  const formContentRef = useRef(null);

  const refs = {
    saveFormRef: createRef<HTMLButtonElement>(),
    submitFormRef: createRef<HTMLButtonElement>(),
    nextButtonRef: createRef<HTMLButtonElement>(),
    approveFormRef: createRef<HTMLButtonElement>(),
    rejectFormRef: createRef<HTMLButtonElement>(),
    getFormObjectRef: useRef<(() => FormObject) | null>(null),
  };

  useEffect(() => {
    const isComplete = isAllSectionsComplete();
    setAllSectionsComplete(isComplete);
  }, [status]);

  useEffect(() => {
    if (hasError && errorAlertRef?.current) {
      errorAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasError, errorAlertRef]);

  // Intercept React Router navigation actions with unsaved changes
  const blocker: Blocker = useBlocker(() => {
    if (!readOnlyInputs && isDirty()) {
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

  const isAllSectionsComplete = (): boolean => {
    if (status === FormStatus.LOADING) {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    // form has not been created
    if (newData?.sections?.length !== Object.keys(map).length - 1) {
      return false;
    }

    return newData?.sections?.every((section) => section.status === "Completed");
  };

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
   * submit the form data to the database.
   *
   *
   * @returns {Promise<boolean>} true if the submit was successful, false otherwise
   */
  const submitForm = async (): Promise<string | boolean> => {
    if (readOnlyInputs || !userCanEdit) {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref.current || !newData) {
      return false;
    }

    try {
      const r = await submitData();
      setOpenSubmitDialog(false);
      setReviewComment("");
      navigate('/submissions');
      setHasError(false);
      return r;
    } catch (err) {
      setOpenSubmitDialog(false);
      setReviewComment("");
      setHasError(true);
      return false;
    }
  };

  /**
   * submit the review response to the form submission to the database.
   *
   *
   * @returns {Promise<boolean>} true if the review submit was successful, false otherwise
   */
  const submitApproveForm = async (): Promise<string | boolean> => {
    if (!userCanReview) {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref.current || !newData) {
      return false;
    }

    try {
      const res = await approveForm(reviewComment, true);
      setOpenApproveDialog(false);
      setReviewComment("");
      if (res) {
        setHasError(false);
        navigate('/submissions');
      }
      return res;
    } catch (err) {
      setOpenApproveDialog(false);
      setReviewComment("");
      setHasError(true);
      return false;
    }
  };

  /**
   * submit the review response to the form submission to the database.
   *
   *
   * @returns {Promise<boolean>} true if the review submit was successful, false otherwise
   */
  const submitRejectForm = async (): Promise<string | boolean> => {
    if (!userCanReview) {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref.current || !newData) {
      return false;
    }

    try {
      const res = await rejectForm(reviewComment);
      setOpenRejectDialog(false);
      navigate('/submissions');
      setHasError(false);
      return res;
    } catch (err) {
      setOpenRejectDialog(false);
      setReviewComment("");
      setHasError(true);
      return false;
    }
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
    if (readOnlyInputs || !userCanEdit) {
      return false;
    }

    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref.current || !newData) {
      return false;
    }

    // Update section status
    if (newData?.sections?.length !== Object.keys(map).length - 1) { // Not including review section
      newData.sections = InitialSections;
    }
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
      setChangesAlert(`Your changes for the ${map[activeSection].title} section have been successfully saved.`);

      if (!blockedNavigate && r && data["_id"] === "new" && r !== data?.['_id']) {
        // NOTE: This currently triggers a form data refetch, which is not ideal
        navigate(`/submission/${r}/${activeSection}`, { replace: true });
      }

      setTimeout(() => setChangesAlert(""), 10000);
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
    const reviewSectionUrl = `/submission/${data["_id"]}/REVIEW`; // TODO: Update to dynamic url instead
    const isNavigatingToReviewSection = blocker?.location?.pathname === reviewSectionUrl;

    setBlockedNavigate(false);

    if (isNavigatingToReviewSection && !isAllSectionsComplete()) {
      return;
    }

    blocker.proceed?.();
    if (newId) {
      // NOTE: This currently triggers a form data refetch, which is not ideal
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

  const handleSubmitForm = () => {
    if (readOnlyInputs || !userCanEdit) {
      return;
    }
    setOpenSubmitDialog(true);
  };

  const handleApproveForm = () => {
    if (!userCanReview) {
      return;
    }
    setOpenApproveDialog(true);
  };

  const handleRejectForm = () => {
    if (!userCanReview) {
      return;
    }
    setOpenRejectDialog(true);
  };

  const handleCloseApproveFormDialog = () => {
    setReviewComment("");
    setOpenApproveDialog(false);
  };

  const handleCloseRejectFormDialog = () => {
    setReviewComment("");
    setOpenRejectDialog(false);
  };

  const handleBackClick = () => {
    if (status === FormStatus.SAVING || !prevSection) {
      return;
    }
    navigate(prevSection);
    formContentRef.current?.scrollIntoView();
  };

  const handleNextClick = () => {
    if (status === FormStatus.SAVING || !nextSection) {
      return;
    }
    if (isSectionD && !allSectionsComplete) {
      return;
    }
    navigate(nextSection);
    formContentRef.current?.scrollIntoView();
  };

  const handleReviewCommentChange = (newComment: string) => {
    if (!userCanReview) {
      return;
    }
    setReviewComment(newComment);
  };

  if (status === FormStatus.LOADING || authStatus === AuthStatus.LOADING) {
    return <SuspenseLoader />;
  }

  if (status === FormStatus.ERROR || !data) {
    navigate('/submissions', {
      state: { error: error || 'Unknown form loading error' },
    });
    return null;
  }

  if (authStatus === AuthStatus.ERROR) {
    navigate('/submissions', {
      state: { error: error || 'Unknown authorization error' },
    });
    return null;
  }

  if (formMode === "Unauthorized" && status === FormStatus.LOADED && authStatus === AuthStatus.LOADED) {
    navigate('/submissions');
    return null;
  }

  return (
    <>
      <GenericAlert open={changesAlert !== ""} key="formview-changes-alert">
        <span>
          {changesAlert}
        </span>
      </GenericAlert>

      <PageBanner
        title="Submission Request Form"
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

          <Stack ref={formContentRef} className={classes.content} direction="column" spacing={5}>
            <StatusBar />

            {hasError && <StyledAlert ref={errorAlertRef} severity="error">Oops! An error occurred. Please refresh the page or try again later.</StyledAlert>}

            <Section section={activeSection} refs={refs} />

            <Stack
              className={classes.controls}
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Button
                id="submission-form-back-button"
                className={classes.backButton}
                variant="outlined"
                type="button"
                disabled={status === FormStatus.SAVING || !prevSection}
                onClick={handleBackClick}
                size="large"
                startIcon={<BackwardArrowIcon />}
              >
                Back
              </Button>
              <LoadingButton
                id="submission-form-save-button"
                className={classes.saveButton}
                variant="outlined"
                type="button"
                ref={refs.saveFormRef}
                size="large"
                loading={status === FormStatus.SAVING}
                onClick={() => saveForm()}
                sx={{ display: readOnlyInputs ? "none !important" : "initial" }}
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
                onClick={handleSubmitForm}
                sx={{ display: readOnlyInputs ? "none !important" : "initial" }}
              >
                Submit
              </LoadingButton>
              <LoadingButton
                id="submission-form-approve-button"
                className={classes.approveButton}
                variant="outlined"
                ref={refs.approveFormRef}
                size="large"
                onClick={handleApproveForm}
              >
                Approve
              </LoadingButton>
              <LoadingButton
                id="submission-form-approve-button"
                className={classes.rejectButton}
                variant="outlined"
                ref={refs.rejectFormRef}
                size="large"
                onClick={handleRejectForm}
              >
                Reject
              </LoadingButton>
              <Button
                id="submission-form-next-button"
                className={classes.nextButton}
                variant="outlined"
                type="button"
                ref={refs.nextButtonRef}
                onClick={handleNextClick}
                disabled={status === FormStatus.SAVING || !nextSection || (isSectionD && !allSectionsComplete)}
                size="large"
                endIcon={<ForwardArrowIcon />}
              >
                Next
              </Button>
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
      <SubmitFormDialog
        open={openSubmitDialog}
        onCancel={() => setOpenSubmitDialog(false)}
        onSubmit={submitForm}
        disableActions={status === FormStatus.SUBMITTING}
      />
      <ApproveFormDialog
        open={openApproveDialog}
        reviewComment={reviewComment}
        onReviewCommentChange={handleReviewCommentChange}
        onCancel={handleCloseApproveFormDialog}
        onSubmit={submitApproveForm}
      />
      <RejectFormDialog
        open={openRejectDialog}
        reviewComment={reviewComment}
        onReviewCommentChange={handleReviewCommentChange}
        onCancel={handleCloseRejectFormDialog}
        onSubmit={submitRejectForm}
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
      letterSpacing: "0.32px",
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
  approveButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#22A584"
    }
  },
  rejectButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#D54309"
    }
  },
  submitButton: {
    "&.MuiButton-root": {
      display: "flex",
      width: "128px",
      height: "50.593px",
      padding: "11px",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
      borderRadius: "8px",
      border: "1px solid #828282",
      background: "#0B7F99",
    }
  },
});

export default withStyles(styles)(FormView);
