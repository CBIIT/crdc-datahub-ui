import React, { FC, createRef, useEffect, useRef, useState } from "react";
import {
  useNavigate,
  unstable_useBlocker as useBlocker,
  unstable_Blocker as Blocker,
  Navigate,
} from "react-router-dom";
import { isEqual, cloneDeep } from "lodash";
import {
  Alert,
  Container,
  Divider,
  Stack,
  styled,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from 'notistack';
import { ReactComponent as ChevronLeft } from "../../assets/icons/chevron_left.svg";
import { ReactComponent as ChevronRight } from "../../assets/icons/chevron_right.svg";
import {
  Status as FormStatus,
  useFormContext,
} from "../../components/Contexts/FormContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import StatusBar from "../../components/StatusBar/StatusBar";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import Section from "./sections";
import map, { InitialSections } from "../../config/SectionConfig";
import UnsavedChangesDialog from "../../components/Questionnaire/UnsavedChangesDialog";
import SubmitFormDialog from "../../components/Questionnaire/SubmitFormDialog";
import useFormMode from "../../hooks/useFormMode";
import InquireFormDialog from "../../components/Questionnaire/InquireFormDialog";
import RejectFormDialog from "../../components/Questionnaire/RejectFormDialog";
import ApproveFormDialog from "../../components/Questionnaire/ApproveFormDialog";
import PageBanner from "../../components/PageBanner";
import bannerPng from "../../assets/banner/submission_banner.png";
import {
  Status as AuthStatus,
  useAuthContext,
} from "../../components/Contexts/AuthContext";
import ErrorCodes from "../../config/ErrorCodes";
import usePageTitle from '../../hooks/usePageTitle';

const StyledContainer = styled(Container)(() => ({
  "&.MuiContainer-root": {
    padding: 0,
    minHeight: "300px",
    scrollMarginTop: "-60px",
  },
}));

const StyledSidebar = styled(Stack)({
  position: "sticky",
  top: 0,
  marginTop: "90px",
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
  scrollMarginTop: "64px",
});

const StyledContent = styled(Stack)({
  width: "100%",
  maxWidth: "980px",
  marginLeft: "41px",
});

const StyledControls = styled(Stack)({
  color: "#FFFFFF",
  marginTop: "15px !important",
  "& .MuiButton-root": {
    margin: "0 6px",
    padding: "10px 28px 10px !important",
    minWidth: "128px",
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    letterSpacing: "0.32px",
    lineHeight: "24px",
    borderRadius: "8px",
    textTransform: "none",
  },
  "& a": {
    color: "inherit",
    textDecoration: "none",
  },
  "& .MuiButton-startIcon": {
    marginRight: "20px",
    marginLeft: 0,
  },
  "& .MuiButton-endIcon": {
    marginRight: 0,
    marginLeft: "20px",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
  },
});

const StyledLoadingButton = styled(LoadingButton)({
  "&.MuiButton-root": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "128px",
    padding: "10px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    lineHeight: "24px",
    letterSpacing: "0.32px",
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
    },
  },
});

const StyledExtendedLoadingButton = styled(StyledLoadingButton)({
  "&.MuiButton-root": {
    minWidth: "137px",
  },
});

const validateSection = (section: string) => typeof map[section] !== "undefined";

export type SaveForm =
  | { status: "success"; id: string }
  | { status: "failed"; errorMessage: string };

type Props = {
  section?: string;
};

/**
 * Intake Form View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FormView: FC<Props> = ({ section } : Props) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { status, data, setData, submitData, approveForm, inquireForm, rejectForm, reopenForm, reviewForm, error } = useFormContext();
  const { user, status: authStatus } = useAuthContext();
  const [activeSection, setActiveSection] = useState<string>(validateSection(section) ? section : "A");
  const [blockedNavigate, setBlockedNavigate] = useState<boolean>(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState<boolean>(false);
  const [openApproveDialog, setOpenApproveDialog] = useState<boolean>(false);
  const [openInquireDialog, setOpenInquireDialog] = useState<boolean>(false);
  const [openRejectDialog, setOpenRejectDialog] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const { formMode, readOnlyInputs } = useFormMode();
  const [allSectionsComplete, setAllSectionsComplete] = useState<boolean>(false);

  const sectionKeys = Object.keys(map);
  const sectionIndex = sectionKeys.indexOf(activeSection);
  const prevSection = sectionKeys[sectionIndex - 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex - 1]}` : null;
  const nextSection = sectionKeys[sectionIndex + 1] ? `/submission/${data?.['_id']}/${sectionKeys[sectionIndex + 1]}` : null;
  const isSectionD = activeSection === "D";
  const errorAlertRef = useRef(null);
  const formContentRef = useRef(null);
  const lastSectionRef = useRef(null);
  const hasReopenedFormRef = useRef(false);
  const hasUpdatedReviewStatusRef = useRef(false);

  const refs = {
    saveFormRef: createRef<HTMLButtonElement>(),
    submitFormRef: createRef<HTMLButtonElement>(),
    nextButtonRef: createRef<HTMLButtonElement>(),
    approveFormRef: createRef<HTMLButtonElement>(),
    inquireFormRef: createRef<HTMLButtonElement>(),
    rejectFormRef: createRef<HTMLButtonElement>(),
    getFormObjectRef: useRef<(() => FormObject) | null>(null),
  };

  usePageTitle(`Submission Request ${data?._id || ""}`);

  useEffect(() => {
    const formLoaded = status === FormStatus.LOADED && authStatus === AuthStatus.LOADED && data;
    const invalidFormAuth = formMode === "Unauthorized" || authStatus === AuthStatus.ERROR || !user;

    if (formLoaded && invalidFormAuth) {
      navigate("/");
    }
  }, [formMode, navigate, status, authStatus, user, data]);

  useEffect(() => {
    const isComplete = isAllSectionsComplete();
    setAllSectionsComplete(isComplete);
  }, [status, data]);

  useEffect(() => {
    if (hasError && errorAlertRef?.current) {
      errorAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasError, errorAlertRef]);

  useEffect(() => {
    if (status !== FormStatus.LOADED && authStatus !== AuthStatus.LOADED) {
      return;
    }
    if (!hasReopenedFormRef.current && data?.status === "Inquired" && formMode === "Edit") {
      handleReopenForm();
      hasReopenedFormRef.current = true;
    }
  }, [status, authStatus, formMode, data?.status]);

  useEffect(() => {
    if (status !== FormStatus.LOADED && authStatus !== AuthStatus.LOADED) {
      return;
    }
    if (!hasUpdatedReviewStatusRef.current && data?.status === "Submitted" && formMode === "Review") {
      handleReviewForm();
      hasUpdatedReviewStatusRef.current = true;
    }
  }, [status, authStatus, formMode, data?.status]);

  // Intercept React Router navigation actions with unsaved changes
  const blocker: Blocker = useBlocker(() => {
    // if unauthorized, skip blocker and redirect away
    if (formMode === "Unauthorized" && status === FormStatus.LOADED && authStatus === AuthStatus.LOADED) {
      return false;
    }
    if (!isDirty() || readOnlyInputs) {
      return false;
    }

    // If there are no validation errors, save form data without a prompt
    const { ref } = refs.getFormObjectRef.current?.() || {};
    if (ref?.current?.checkValidity() === true) {
      saveForm();
      return false;
    }

    setBlockedNavigate(true);
    return true;
  });

  // Intercept browser navigation actions (e.g. closing the tab) with unsaved changes
  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (!isDirty()) {
        return;
      }

      // If there are no validation errors, save form data without a prompt
      const { ref } = refs.getFormObjectRef.current?.() || {};
      if (ref?.current?.checkValidity() === true) {
        saveForm();
        return;
      }

      event.preventDefault();
      event.returnValue = 'You have unsaved form changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });

  useEffect(() => {
    const newSection = validateSection(section) ? section : "A";
    setActiveSection(newSection);
    lastSectionRef.current = newSection;
  }, [section]);

  const isAllSectionsComplete = (): boolean => {
    if (status === FormStatus.LOADING) {
      return false;
    }

    // form has not been created
    if (!data?.questionnaireData || data?.questionnaireData?.sections?.length !== Object.keys(map).length - 1) {
      return false;
    }

    return data?.questionnaireData?.sections?.every((section) => section.status === "Completed");
  };

  /**
   * Determines if the form has unsaved changes.
   *
   * @returns {boolean} true if the form has unsaved changes, false otherwise
   */
  const isDirty = () : boolean => {
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    return ref && (!data || !isEqual(data.questionnaireData, newData));
  };

  /**
   * submit the form data to the database.
   *
   * @returns {Promise<boolean>} true if the submit was successful, false otherwise
   */
  const submitForm = async (): Promise<string | boolean> => {
    if (readOnlyInputs || formMode !== "Edit") {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    try {
      const r = await submitData();
      setOpenSubmitDialog(false);
      navigate('/submissions');
      setHasError(false);
      return r;
    } catch (err) {
      setOpenSubmitDialog(false);
      setHasError(true);
      return false;
    }
  };

  /**
   * submit the approval comment from the form submission to the database.
   *
   * @returns {Promise<boolean>} true if the approval submission was successful, false otherwise
   */
  const submitApproveForm = async (reviewComment): Promise<string | boolean> => {
    if (formMode !== "Review") {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    try {
      const res = await approveForm(reviewComment, true);
      setOpenApproveDialog(false);
      if (res) {
        setHasError(false);
        navigate('/submissions');
      }
      return res;
    } catch (err) {
      setOpenApproveDialog(false);
      setHasError(true);
      return false;
    }
  };

  /**
   * submit the inquire comment from the form submission to the database.
   *
   *
   * @returns {Promise<boolean>} true if the inquire submission was successful, false otherwise
   */
  const submitInquireForm = async (reviewComment: string): Promise<string | boolean> => {
    if (formMode !== "Review") {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    try {
      const res = await inquireForm(reviewComment);
      setOpenInquireDialog(false);
      navigate('/submissions');
      setHasError(false);
      return res;
    } catch (err) {
      setOpenInquireDialog(false);
      setHasError(true);
      return false;
    }
  };

    /**
   * submit the reject comment from the form submission to the database.
   *
   *
   * @returns {Promise<boolean>} true if the reject submission was successful, false otherwise
   */
    const submitRejectForm = async (reviewComment: string): Promise<string | boolean> => {
      if (formMode !== "Review") {
        return false;
      }
      const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

      if (!ref?.current || !newData) {
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
        setHasError(true);
        return false;
      }
    };

  /**
   * Reopen the form when it has already been inquired
   * and the user wants to retry submission
   *
   *
   * @returns {Promise<boolean>} true if the review submit was successful, false otherwise
   */
  const handleReopenForm = async (): Promise<string | boolean> => {
    if (formMode !== "Edit") {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    try {
      const res = await reopenForm();
      setHasError(false);
      return res;
    } catch (err) {
      setHasError(true);
      return false;
    }
  };

  /**
   * Set form to In Review when it has been submitted
   *
   *
   * @returns {Promise<boolean>} true if the review submit was successful, false otherwise
   */
  const handleReviewForm = async (): Promise<string | boolean> => {
    if (formMode !== "Review") {
      return false;
    }
    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    try {
      const res = await reviewForm();
      setHasError(false);
      return res;
    } catch (err) {
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
  const saveForm = async (): Promise<SaveForm> => {
    if (readOnlyInputs || formMode !== "Edit") {
      return {
        status: 'failed',
        errorMessage: null
      };
    }

    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return {
        status: 'failed',
        errorMessage: null
      };
    }

    // Update section status
    if (newData?.sections?.length !== Object.keys(map).length - 1) { // Not including review section
      newData.sections = cloneDeep(InitialSections);
    }
    const newStatus = ref.current.checkValidity() ? "Completed" : "In Progress";
    const currentSection : Section = newData.sections.find((s) => s.name === activeSection);
    if (currentSection) {
      currentSection.status = newStatus;
    } else {
      newData.sections.push({ name: activeSection, status: newStatus });
    }

    // Skip state update if there are no changes
    if (!isEqual(data.questionnaireData, newData) || error === ErrorCodes.DUPLICATE_STUDY_ABBREVIATION) {
      const res = await setData(newData);
      if (res?.status === "failed" && res?.errorMessage === ErrorCodes.DUPLICATE_STUDY_ABBREVIATION) {
        enqueueSnackbar("The Study Abbreviation already existed in the system. Your changes were unable to be saved.", { variant: 'error' });
      } else {
        enqueueSnackbar(`Your changes for the ${map[activeSection].title} section have been successfully saved.`, { variant: 'success' });
      }

      if (!blockedNavigate && res?.status === "success" && data["_id"] === "new" && res.id !== data?.['_id']) {
        // NOTE: This currently triggers a form data refetch, which is not ideal
        navigate(`/submission/${res.id}/${activeSection}`, { replace: true });
      }

      if (res?.status === "success") {
        return {
          status: 'success',
          id: res.id
        };
      }
      return {
        status: 'failed',
        errorMessage: res?.errorMessage
      };
    }

    return {
      status: 'success',
      id: data?.["_id"]
    };
  };

  const areSectionsValid = (): boolean => {
    if (status === FormStatus.LOADING) {
      return false;
    }

    const { ref, data: newData } = refs.getFormObjectRef.current?.() || {};

    if (!ref?.current || !newData) {
      return false;
    }

    const sectionsClone = cloneDeep(data?.questionnaireData?.sections);
    if (sectionsClone?.length !== Object.keys(map).length - 1) { // Not including review section
      return false;
    }

    const newStatus = ref.current.checkValidity() ? "Completed" : "In Progress";
    const currentSection : Section = sectionsClone.find((s) => s.name === activeSection);
    if (currentSection) {
      currentSection.status = newStatus;
    } else {
      sectionsClone.push({ name: activeSection, status: newStatus });
    }

    return sectionsClone?.every((section) => section.status === "Completed");
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
    const res = await saveForm();
    const reviewSectionUrl = `/submission/${data["_id"]}/REVIEW`; // TODO: Update to dynamic url instead
    const isNavigatingToReviewSection = blocker?.location?.pathname === reviewSectionUrl;

    setBlockedNavigate(false);

    // if invalid data, then block navigation
    if ((isNavigatingToReviewSection && ((res?.status === "success" && !res?.id) || !areSectionsValid()))) {
      return;
    }
    // if duplicate study error, then block navigation
    if (res?.status === "failed" && res?.errorMessage === ErrorCodes.DUPLICATE_STUDY_ABBREVIATION) {
      return;
    }

    blocker.proceed?.();
    if (res?.status === "success" && res.id) {
      // NOTE: This currently triggers a form data refetch, which is not ideal
      navigate(blocker.location.pathname.replace("new", res.id), { replace: true });
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
    if (readOnlyInputs || formMode !== "Edit") {
      return;
    }
    setOpenSubmitDialog(true);
  };

  const handleApproveForm = () => {
    if (formMode !== "Review") {
      return;
    }
    setOpenApproveDialog(true);
  };

  const handleInquireForm = () => {
    if (formMode !== "Review") {
      return;
    }
    setOpenInquireDialog(true);
  };

  const handleRejectForm = () => {
    if (formMode !== "Review") {
      return;
    }
    setOpenRejectDialog(true);
  };
  const handleCloseApproveFormDialog = () => {
    setOpenApproveDialog(false);
  };

  const handleCloseInquireFormDialog = () => {
    setOpenInquireDialog(false);
  };

  const handleCloseRejectFormDialog = () => {
    setOpenRejectDialog(false);
  };

  const handleBackClick = () => {
    if (status === FormStatus.SAVING || !prevSection) {
      return;
    }
    navigate(prevSection);
  };

  const handleNextClick = () => {
    if (status === FormStatus.SAVING || !nextSection) {
      return;
    }
    if (isSectionD && !allSectionsComplete) {
      return;
    }
    navigate(nextSection);
  };

  if (status === FormStatus.LOADING || authStatus === AuthStatus.LOADING) {
    return <SuspenseLoader />;
  }

  // hide content while being re-routed
  if (authStatus === AuthStatus.ERROR) {
    return null;
  }

  if ((status === FormStatus.ERROR && error !== ErrorCodes.DUPLICATE_STUDY_ABBREVIATION) || !data) {
    return <Navigate to="/submissions" state={{ error: error || 'Unknown error' }} />;
  }

  return (
    <>
      <PageBanner
        title="Submission Request Form"
        subTitle="The following set of high-level questions are intended to provide insight to the CRDC, related to data storage, access, secondary sharing needs and other requirements of data submitters."
        bannerSrc={bannerPng}
      />

      <StyledContainer ref={formContentRef} maxWidth="xl">
        <StyledContentWrapper direction="row" justifyContent="center">
          <StyledSidebar
            direction="row"
            justifyContent="center"
            alignSelf="flex-start"
          >
            <ProgressBar section={activeSection} />
            <StyledDivider orientation="vertical" />
          </StyledSidebar>

          <StyledContent direction="column" spacing={5}>
            <StatusBar />

            {hasError && <StyledAlert ref={errorAlertRef} severity="error">Oops! An error occurred. Please refresh the page or try again later.</StyledAlert>}

            <Section section={activeSection} refs={refs} />

            <StyledControls
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <StyledLoadingButton
                id="submission-form-back-button"
                variant="contained"
                color="info"
                type="button"
                disabled={status === FormStatus.SAVING || !prevSection}
                onClick={handleBackClick}
                size="large"
                startIcon={<ChevronLeft />}
              >
                Back
              </StyledLoadingButton>
              <StyledLoadingButton
                id="submission-form-save-button"
                variant="contained"
                color="success"
                ref={refs.saveFormRef}
                loading={status === FormStatus.SAVING}
                onClick={() => saveForm()}
                sx={{ display: readOnlyInputs ? "none !important" : "flex" }}
              >
                Save
              </StyledLoadingButton>
              <StyledExtendedLoadingButton
                id="submission-form-submit-button"
                variant="contained"
                color="primary"
                type="submit"
                ref={refs.submitFormRef}
                size="large"
                onClick={handleSubmitForm}
                sx={{ display: readOnlyInputs ? "none !important" : "flex" }}
              >
                Submit
              </StyledExtendedLoadingButton>
              <StyledExtendedLoadingButton
                id="submission-form-approve-button"
                variant="contained"
                color="primary"
                ref={refs.approveFormRef}
                size="large"
                onClick={handleApproveForm}
              >
                Approve
              </StyledExtendedLoadingButton>
              <StyledLoadingButton
                id="submission-form-inquire-button"
                variant="contained"
                color="error"
                ref={refs.inquireFormRef}
                size="large"
                onClick={handleInquireForm}
              >
                Request Additional Information
              </StyledLoadingButton>
              <StyledExtendedLoadingButton
                id="submission-form-reject-button"
                variant="contained"
                color="error"
                ref={refs.rejectFormRef}
                size="large"
                onClick={handleRejectForm}
              >
                Reject
              </StyledExtendedLoadingButton>
              <StyledLoadingButton
                id="submission-form-next-button"
                variant="contained"
                color="info"
                type="button"
                ref={refs.nextButtonRef}
                onClick={handleNextClick}
                disabled={status === FormStatus.SAVING || !nextSection || (isSectionD && !allSectionsComplete)}
                size="large"
                endIcon={<ChevronRight />}
              >
                Next
              </StyledLoadingButton>
            </StyledControls>
          </StyledContent>
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
        onCancel={handleCloseApproveFormDialog}
        onSubmit={(reviewComment) => submitApproveForm(reviewComment)}
      />
      <InquireFormDialog
        open={openInquireDialog}
        onCancel={handleCloseInquireFormDialog}
        onSubmit={(reviewComment) => submitInquireForm(reviewComment)}
      />
      <RejectFormDialog
        open={openRejectDialog}
        onCancel={handleCloseRejectFormDialog}
        onSubmit={(reviewComment) => submitRejectForm(reviewComment)}
      />
    </>
  );
};

export default FormView;
