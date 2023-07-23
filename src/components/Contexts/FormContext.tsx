/* eslint-disable no-console */
import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyQuery, useMutation } from '@apollo/client';
import dayjs from "dayjs";
import { merge, cloneDeep } from "lodash";
import omitDeep from "omit-deep";
import { mutation as APPROVE_APP, Response as ApproveAppResp } from '../../graphql/approveApplication';
import { mutation as REJECT_APP, Response as RejectAppResp } from '../../graphql/rejectApplication';
import { query as LAST_APP, Response as LastAppResp } from '../../graphql/getMyLastApplication';
import { query as GET_APP, Response as GetAppResp } from '../../graphql/getApplication';
import { mutation as SAVE_APP, Response as SaveAppResp } from '../../graphql/saveApplication';
import { mutation as SUBMIT_APP, Response as SubmitAppResp } from '../../graphql/submitApplication';
import initialValues from "../../config/InitialValues";
import { FormatDate, omitForApi } from "../../utils";

export type ContextState = {
  status: Status;
  data: Application;
  submitData?: () => Promise<string | boolean>;
  approveForm?: (comment: string, wholeProgram: boolean) => Promise<string | boolean>;
  rejectForm?: (comment: string) => Promise<string | boolean>;
  setData?: (Application) => Promise<string | false>;
  error?: string;
};

export enum Status {
  LOADING = "LOADING", // Loading initial data
  LOADED = "LOADED", // Successfully loaded data
  ERROR = "ERROR", // Error loading data
  SAVING = "SAVING", // Saving data to the API
  SUBMITTING = "SUBMITTING", // Submitting data to the API
}

const initialState: ContextState = { status: Status.LOADING, data: null };

/**
 * Form Context
 *
 * NOTE: Do NOT use this context directly. Use the useFormContext hook instead.
 *       this is exported for testing purposes only.
 *
 * @see ContextState – Form context state
 * @see useFormContext – Form context hook
 */
export const Context = createContext<ContextState>(initialState);
Context.displayName = "FormContext";

/**
 * Form Context Hook
 *
 * @see FormProvider – Must be wrapped in a FormProvider component
 * @see ContextState – Form context state returned by the hook
 * @returns {ContextState} - Form context
 */
export const useFormContext = (): ContextState => {
  const context = useContext<ContextState>(Context);

  if (!context) {
    throw new Error("FormContext cannot be used outside of the FormProvider component");
  }

  return context;
};

type ProviderProps = {
  id: string;
  children: React.ReactNode;
};

/**
 * Creates a form context for the given form ID
 *
 * @see useFormContext – Form context hook
 * @param {ProviderProps} props - Form context provider props
 * @returns {JSX.Element} - Form context provider
 */
export const FormProvider: FC<ProviderProps> = ({ children, id } : ProviderProps) => {
  const [state, setState] = useState<ContextState>(initialState);

  const datePattern = "MM/DD/YYYY";
  const dateTodayFallback = dayjs().format(datePattern);

  const [lastApp] = useLazyQuery<LastAppResp>(LAST_APP, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [getApp] = useLazyQuery<GetAppResp>(GET_APP, {
    variables: { id },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [saveApp] = useMutation<SaveAppResp>(SAVE_APP, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [submitApp] = useMutation<SubmitAppResp>(SUBMIT_APP, {
    variables: { id },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [approveApp] = useMutation<ApproveAppResp>(APPROVE_APP, {
    variables: { id },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [rejectApp] = useMutation<RejectAppResp>(REJECT_APP, {
    variables: { id },
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const setData = async (data: Application) => {
    let newState = { ...state, data };
    setState({ ...newState, status: Status.SAVING });

    const { data: d, errors } = await saveApp({ variables: omitForApi(data) });

    if (errors) {
      setState({ ...newState, status: Status.LOADED });
      return false;
    }

    if (d?.saveApplication?.["_id"] && data?.["_id"] === "new") {
      newState = { ...newState, data: { ...data, _id: d.saveApplication["_id"] } };
    }

    setState({ ...newState, status: Status.LOADED });
    return d?.saveApplication?.["_id"] || false;
  };

  const submitData = async () => {
    setState((prevState) => ({ ...prevState, status: Status.SUBMITTING }));

    const { data: res, errors } = await submitApp({
      variables: {
        _id: state?.data["_id"]
      }
    });

    if (errors) {
      setState((prevState) => ({ ...prevState, status: Status.LOADED }));
      return false;
    }

    setState((prevState) => ({ ...prevState, status: Status.LOADED }));
    return res?.submitApplication?.["_id"] || false;
  };

  // Here we approve the form to the API with a comment and wholeProgram
  const approveForm = async (comment: string, wholeProgram: boolean) => {
    setState((prevState) => ({ ...prevState, status: Status.SUBMITTING }));

    const { data: res, errors } = await approveApp({
      variables: {
        _id: state?.data["_id"],
        comment,
        wholeProgram
      }
    });

    if (errors) {
      setState((prevState) => ({ ...prevState, status: Status.ERROR }));
      return false;
    }

    setState((prevState) => ({ ...prevState, status: Status.LOADED }));
    return res?.approveApplication?.["_id"] || false;
  };

  // Here we reject the form to the API with a comment
  const rejectForm = async (comment: string) => {
    setState((prevState) => ({ ...prevState, status: Status.SUBMITTING }));

    const { data: res, errors } = await rejectApp({
      variables: {
        _id: state?.data["_id"],
        comment
      }
    });

    if (errors) {
      setState((prevState) => ({ ...prevState, status: Status.ERROR }));
      return false;
    }

    setState((prevState) => ({ ...prevState, status: Status.LOADED }));
    return res?.rejectApplication?.["_id"] || false;
  };

  useEffect(() => {
    if (!id || !id.trim()) {
      setState({ status: Status.ERROR, data: null, error: "Invalid application ID provided" });
      return;
    }

    (async () => {
      if (id === "new") {
        const { data: d } = await lastApp();

        setState({
          status: Status.LOADED,
          data: {
            ...initialValues,
            _id: "new",
            pi: { ...initialValues.pi, ...d?.getMyLastApplication?.pi },
            applicant: null,
            organization: null,
            history: [],
          },
        });

        return;
      }

      const { data: d, error } = await getApp();
      if (error) {
        setState({ status: Status.ERROR, data: null, error: "An unknown API or GraphQL error occurred" });
        return;
      }

      setState({
        status: Status.LOADED,
        data: {
          ...merge(cloneDeep(initialValues), omitDeep(d?.getApplication, ["__typename"])),
          // To avoid false positive form changes
          targetedReleaseDate: FormatDate(d?.getApplication?.targetedReleaseDate, datePattern, dateTodayFallback),
          targetedSubmissionDate: FormatDate(d?.getApplication?.targetedSubmissionDate, datePattern, dateTodayFallback),
        }
      });
    })();
  }, [id]);

  const value = useMemo(() => ({ ...state, setData, submitData, approveForm, rejectForm }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
