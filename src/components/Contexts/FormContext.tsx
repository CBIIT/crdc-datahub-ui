/* eslint-disable */
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
  setData?: (Application) => void;
  error?: string;
};

export enum Status {
  LOADING = "LOADING", // Loading initial data
  LOADED = "LOADED",   // Successfully loaded data
  ERROR = "ERROR",     // Error loading data
  SAVING = "SAVING",   // Saving data to the API
}

const initialState: ContextState = { status: Status.LOADING, data: null };

/**
 * Form Context
 *
 * @see ContextState – Form context state
 * @see useFormContext – Form context hook
 */
const Context = createContext<ContextState>(initialState);

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

  // Here we update the state and send the data to the API
  // otherwise we can just update the local state (i.e. within form sections)
  const setData = (data: Application) => {
    console.log("[UPDATING DATA]");
    console.log("prior state", state);

    const newState = { ...state, data };
    setState({ ...newState, status: Status.SAVING });
    console.log("new state", newState);

    // simulate the save event
    setTimeout(() => {
      setState({ ...newState, status: Status.LOADED });
      console.log("saved");
    }, 1500);
  };

  useEffect(() => {
    // TODO: fetch form data from API
    setTimeout(() => {
      // TODO: validate API response
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
              status: "In Progress",
            },
            {
              name: "B",
              status: "In Progress",
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
            phone: "1 301 525 6364",
            position: "ABC",
            institution: "University of Pennsylvania",
          },
          additionalContacts: [
            {
              role: "Administrative Contact",
              firstName: "Fred",
              lastName: "Graph",
              email: "fred.graph@nih.gov",
              phone: "301-555-5555",
              institution: "University of California, San Diego",
            },
            {
              role: "Financial Contact",
              firstName: "Jane",
              lastName: "Eyre",
              email: "jane.eyre@nih.gov",
              phone: "",
              institution: "University of California, San Diego",
            },
          ],
          program: {
            title: "Example Pg",
            abbreviation: "EPG",
            description: "This is an example program",
          },
          study: {
            title: "Example Study",
            abbreviation: "ES",
            description: "This is an example study",
            repositories: [
              {
                name: "Example Repository",
                studyID: "1234",
              }
            ]
          },
        },
      });
    }, 500);
  }, [id]);

  return (
    <Context.Provider value={{ ...state, setData }}>
      {children}
    </Context.Provider>
  );
};
