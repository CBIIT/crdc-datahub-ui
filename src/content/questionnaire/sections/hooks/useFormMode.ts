import { useAuthContext } from "../../../../components/Contexts/AuthContext";
import { useFormContext } from "../../../../components/Contexts/FormContext";

const testUser: User = {
  email: "testEmail@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "User",
  IDP: "nih",
  userStatus: "Active",
};

const testFederalLead: User = {
  email: "testEmail@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "FederalLead",
  IDP: "nih",
  userStatus: "Active",
};

export type FormMode = "Unauthorized" | "Edit" | "View Only" | "Review";

export const formModes: { [key: string]: FormMode } = {
  UNAUTHORIZED: "Unauthorized",
  EDIT: "Edit",
  VIEW_ONLY: "View Only",
  REVIEW: "Review",
};

const useFormMode = () => {
  const { isLoggedIn, user } = useAuthContext();
  const { data } = useFormContext();
  const { status: formStatus } = { status: "In Review" } || data || {}; // TODO: Testing purposes, fix when finished
  const { role } = user || testFederalLead || {};

  console.log({ data, formStatus, role });

  const isStatusViewOnlyForUser = (): boolean => ["Submitted", "In Review", "Approved", "Rejected"].includes(formStatus);
  const isStatusViewOnlyForLead = (): boolean => ["New", "In Progress", "Approved", "Rejected"].includes(formStatus);
  const isStatusEdit = (): boolean => ["New", "In Progress"].includes(formStatus);
  const isStatusReview = (): boolean => ["Submitted", "In Review"].includes(formStatus);

  const getFormModeForUser = (): FormMode => {
    if (isStatusViewOnlyForUser()) {
      return formModes.VIEW_ONLY;
    }
    if (isStatusEdit()) {
      return formModes.EDIT;
    }
    return formModes.UNAUTHORIZED;
  };

  const getFormModeForLead = (): FormMode => {
    if (isStatusReview()) {
      return formModes.REVIEW;
    }
    if (isStatusViewOnlyForLead()) {
      return formModes.VIEW_ONLY;
    }
    return formModes.UNAUTHORIZED;
  };

  /* if (!isLoggedIn) {
    return formModes.UNAUTHORIZED;
  } */

  let formMode: FormMode = formModes.UNAUTHORIZED;

  if (role === "User") {
    formMode = getFormModeForUser();
  }

  if (role === "FederalLead") {
    formMode = getFormModeForLead();
  }

  const readOnlyInputs: boolean = formMode === formModes.VIEW_ONLY || formMode === formModes.REVIEW;

  return { formMode, readOnlyInputs };
};

export default useFormMode;
