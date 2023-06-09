import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_APP, SAVE_APP, SUBMIT_APP } from './graphql';

export type ContextState = {
  status: Status;
  data: Application;
  setData?: (Application) => Promise<boolean>;
  error?: string;
};

export enum Status {
  LOADING = "LOADING", // Loading initial data
  LOADED = "LOADED", // Successfully loaded data
  ERROR = "ERROR", // Error loading data
  SAVING = "SAVING", // Saving data to the API
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
  id: string | number;
  children: React.ReactNode;
};

/**
 * Creates a form context for the given form ID
 *
 * @see useFormContext – Form context hook
 * @param {ProviderProps} props - Form context provider props
 * @returns {JSX.Element} - Form context provider
 */
export const FormProvider: FC<ProviderProps> = (props) => {
  const { children, id } = props;
  const [state, setState] = useState<ContextState>(initialState);

  const [getAPP, { data, error }] = useLazyQuery(GET_APP, {
    variables: { id },
    context: { clientName: 'mockService' },
    fetchPolicy: 'no-cache'
  });

  const [saveApp] = useMutation(SAVE_APP, {
      context: { clientName: 'mockService' },
      fetchPolicy: 'no-cache'
    });

  const [submitApp] = useMutation(SUBMIT_APP, {
      variables: { id },
      context: { clientName: 'mockService' },
      fetchPolicy: 'no-cache'
    });

  // Here we update the state and send the data to the API
  // otherwise we can just update the local state (i.e. within form sections)
  const setData = async (data: Application) => new Promise<boolean>((resolve) => {
    console.log("[UPDATING DATA]");
    console.log("prior state", state);

    const newState = { ...state, data };
    setState({ ...newState, status: Status.SAVING });
    console.log("new state", newState);

    // simulate the save event
    setTimeout(() => {
      setState({ ...newState, status: Status.LOADED });
      console.log("saved");
      resolve(true);
    }, 1500);
  });

  useEffect(() => {
     if (Number.isNaN(parseInt(id.toString(), 10))) {
        setState({
          status: Status.ERROR,
          data: null,
          error: "Invalid form ID",
        });
        return;
      }
      // Call the lazy query when the component mounts or when dependencies change
      getAPP();
  }, [getAPP, id]);

  useEffect(() => {
    // Update the state when the lazy query response changes
    if (data) {
      setState({
        status: Status.LOADED,
         data: data?.getApplication
      });
    }

    if (error) {
      setState({
          status: Status.ERROR,
          data: null,
          error: "GraphQL Errors",
        });
    }
  }, [data, error]);

  const value = useMemo(() => ({ ...state, setData }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
