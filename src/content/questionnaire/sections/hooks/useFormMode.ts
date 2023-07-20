import { useAuthContext } from "../../../../components/Contexts/AuthContext";
import { useFormContext } from "../../../../components/Contexts/FormContext";

const testUser = {
  _id: "abc123-def456",
  email: "testEmail@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "User",
  IDP: "nih",
  userStatus: "Active",
};

const testFederalLead = {
  _id: "abc123-def456",
  email: "testEmail@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "FederalLead",
  IDP: "nih",
  userStatus: "Active",
};

export type FormMode = "Unauthorized" | "Edit" | "View Only" | "Review";

export const formModes = {
  UNAUTHORIZED: "Unauthorized",
  EDIT: "Edit",
  VIEW_ONLY: "View Only",
  REVIEW: "Review",
} as const;

const useFormMode = () => {
  const { isLoggedIn, user } = useAuthContext();
  const { data } = useFormContext();
  const { status: formStatus } = { status: "In Progress" } || data || {}; // TODO: Testing purposes, fix when finished
  const { role } = user || testUser || {};

  console.log({ data, formStatus, role });

  const isStatusViewOnlyForUser = (): boolean => ["Submitted", "In Review", "Approved", "Rejected"].includes(formStatus);
  const isStatusViewOnlyForLead = (): boolean => ["New", "In Progress", "Approved", "Rejected"].includes(formStatus);
  const isStatusEdit = (): boolean => ["New", "In Progress"].includes(formStatus);
  const isStatusReview = (): boolean => ["Submitted", "In Review"].includes(formStatus);

  const authorizedRolesForReview = ["FederalLead"];
  const authorizedRolesForEdit = ["User"];

  const userCanReview = isStatusReview() && authorizedRolesForReview?.includes(role);
  const userCanEdit = isStatusEdit() && authorizedRolesForEdit?.includes(role);

  const formBelongsToUser = (): boolean => data?.applicant?.applicantID !== user?.["_id"];

  const getFormModeForUser = (): FormMode => {
   /*  if (!formBelongsToUser()) { // TODO: Add back when made available
      return formModes.UNAUTHORIZED;
    } */
    if (isStatusViewOnlyForUser()) {
      return formModes.VIEW_ONLY;
    }
    if (isStatusEdit()) {
      return formModes.EDIT;
    }
    return formModes.UNAUTHORIZED;
  };

  const getFormModeForFederalLead = (): FormMode => {
    if (isStatusReview()) {
      return formModes.REVIEW;
    }
    if (isStatusViewOnlyForLead()) {
      return formModes.VIEW_ONLY;
    }
    return formModes.UNAUTHORIZED;
  };

  let formMode: FormMode = formModes.UNAUTHORIZED;

  if (role === "User") {
    formMode = getFormModeForUser();
  }

  if (role === "FederalLead") {
    formMode = getFormModeForFederalLead();
  }

  const readOnlyInputs: boolean = formMode === formModes.VIEW_ONLY || formMode === formModes.REVIEW;

  console.log({ formMode });

  return { formMode, readOnlyInputs, userCanReview, userCanEdit };
};

export default useFormMode;
