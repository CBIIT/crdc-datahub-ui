import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type ContextState = {
  status: Status;
  data: Application;
  error?: string;
};

type CtxProvider = [
  ContextState,
  (Application) => void | null,
];

export enum Status {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const initialState: ContextState = { status: Status.LOADING, data: null };

/**
 * Form Context
 *
 * @see ContextState – Form context state
 * @see useFormContext – Form context hook
 */
const Context = createContext<CtxProvider>([initialState, null]);

/**
 * Form Context Hook
 *
 * @see FormProvider – Must be wrapped in a FormProvider component
 * @see ContextState – Form context state returned by the hook
 * @returns {ContextState} - Form context
 */
export const useFormContext = (): CtxProvider => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Form components cannot be rendered outside the FormProvider component"
    );
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

  const setData = (data: Application) => {
    // Here we update the state and send the data to the API
    // otherwise we can just update the local state (i.e. within form sections)
    console.log("--------------------");
    console.log("prior state", state);
    setState({
      ...state,
      data,
    });
    console.log("new state", {
      ...state,
      data,
    });
  };

  useEffect(() => {
    // TODO: fetch form data from API
    setTimeout(() => {
      // TODO: validate API response
      // @ts-ignore
      if (isNaN(parseInt(id.toString()))) {
        setState({
          status: Status.ERROR,
          data: null,
          error: "Invalid form ID",
        });
        return;
      }
      if (id.toString() === "1234") {
        setState({
          status: Status.ERROR,
          data: null,
          error: "You do not have permission to view this form",
        });
        return;
      }

      setState({
        status: Status.LOADED,
        data: {
          id: parseInt(id.toString()),
          sections: [
            {
              name: "A",
              status: "complete",
            },
            {
              name: "B",
              status: "complete",
            },
          ],
          pi: {
            firstName: "John " + Math.random().toString(36).substring(7), // randomize to test form updates
            lastName: "Doe",
            position: "Professor",
            email: "john.doe@nih.gov",
            institution: "University of California, San Diego",
            eRAAccount: "#9-338480777",
            address: "9500 Gilman Dr, La Jolla, CA 92093",
          },
          primaryContact: {
            firstName: "Benjamin",
            lastName: "Franklin",
            email: "ben.franklin@nih.gov",
            phone: "555-555-5555",
          },
          additionalContacts: [
            {
              role: "Administrative Contact",
              firstName: "Fred",
              lastName: "Graph",
              email: "fred.graph@nih.gov",
              phone: "301-555-5555",
            },
            {
              role: "Financial Contact",
              firstName: "Jane",
              lastName: "Eyre",
              email: "jane.eyre@nih.gov",
              phone: "",
            },
          ],
        },
      });
    }, 500);
  }, [id]);

  return <Context.Provider value={[state, setData]}>{children}</Context.Provider>;
};
