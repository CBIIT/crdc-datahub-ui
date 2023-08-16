import { useEffect, useState } from "react";
import { Status as AuthStatus, useAuthContext } from "../../../../components/Contexts/AuthContext";
import { Status as FormStatus, useFormContext } from "../../../../components/Contexts/FormContext";
import { FormMode, FormModes, getFormMode } from "../../../../utils";

const useFormMode = () => {
  const { user, status: authStatus } = useAuthContext();
  const { data, status } = useFormContext();
  const [formMode, setFormMode] = useState<FormMode>(undefined);
  const [readOnlyInputs, setReadOnlyInputs] = useState<boolean>(false);

  useEffect(() => {
    if (status === FormStatus.LOADING || authStatus === AuthStatus.LOADING) {
      return;
    }

    const updatedFormMode: FormMode = getFormMode(user, data);
    setFormMode(updatedFormMode);
    setReadOnlyInputs(updatedFormMode === FormModes.VIEW_ONLY || updatedFormMode === FormModes.REVIEW);
  }, [user, data]);

  return { formMode, readOnlyInputs };
};

export default useFormMode;
