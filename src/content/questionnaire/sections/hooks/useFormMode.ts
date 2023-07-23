import { useEffect, useState } from "react";
import { Status as AuthStatus, useAuthContext } from "../../../../components/Contexts/AuthContext";
import { Status as FormStatus, useFormContext } from "../../../../components/Contexts/FormContext";

export type FormMode = "Unauthorized" | "Edit" | "View Only" | "Review";

export const formModes = {
  UNAUTHORIZED: "Unauthorized",
  EDIT: "Edit",
  VIEW_ONLY: "View Only",
  REVIEW: "Review",
} as const;

const useFormMode = () => {
  const { user, status: authStatus } = useAuthContext();
  const { data, status } = useFormContext();
  const fedLeadUser = { ...data, role: "FederalLead" };
  const { status: formStatus } = data || {};
  const { role } = /* fedLeadUser ||  */user || {};

  const [formMode, setFormMode] = useState<FormMode>(undefined);
  const [readOnlyInputs, setReadOnlyInputs] = useState<boolean>(false);

  const isStatusViewOnlyForUser = (): boolean => ["Submitted", "In Review", "Approved", "Rejected"].includes(formStatus);
  const isStatusViewOnlyForLead = (): boolean => ["In Progress", "Approved", "Rejected"].includes(formStatus);
  const isStatusEdit = (): boolean => ["New", "In Progress"].includes(formStatus);
  const isStatusReview = (): boolean => ["Submitted", "In Review"].includes(formStatus);

  const authorizedRolesForReview = ["FederalLead"];
  const authorizedRolesForEdit = ["User"];

  const userCanReview = isStatusReview() && authorizedRolesForReview?.includes(role);
  const userCanEdit = isStatusEdit() && authorizedRolesForEdit?.includes(role);

  const formBelongsToUser = (): boolean => data?.applicant?.applicantID === user?.["_id"];

  const getFormModeForUser = (): FormMode => {
    if (formStatus !== "New" && !formBelongsToUser()) {
      return formModes.UNAUTHORIZED;
    }
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

  useEffect(() => {
    if (status === FormStatus.LOADING || authStatus === AuthStatus.LOADING) {
      return;
    }
    let updatedFormMode: FormMode = formModes.UNAUTHORIZED;
    if (role === "User") {
      updatedFormMode = getFormModeForUser();
    } else if (role === "FederalLead") {
      updatedFormMode = getFormModeForFederalLead();
    }
    console.log({ data, status, authStatus, formStatus, role, updatedFormMode });

    setFormMode(updatedFormMode);
    setReadOnlyInputs(updatedFormMode === formModes.VIEW_ONLY || updatedFormMode === formModes.REVIEW);
  }, [user, data, formStatus]);

  return { formMode, readOnlyInputs, userCanReview, userCanEdit };
};

export default useFormMode;
