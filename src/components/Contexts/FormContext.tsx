import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ContextState = {
  status: Status;
  data: Application;
  setData?: (Application) => Promise<boolean>;
  error?: string;
};

/* eslint-disable */
export enum Status {
  LOADING = "LOADING", // Loading initial data
  LOADED = "LOADED",   // Successfully loaded data
  ERROR = "ERROR",     // Error loading data
  SAVING = "SAVING",   // Saving data to the API
}
/* eslint-enable */

const initialState: ContextState = { status: Status.LOADING, data: null };

/**
 * Form Context
 *
 * @see ContextState – Form context state
 * @see useFormContext – Form context hook
 */
const Context = createContext<ContextState>(initialState);
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

  // Here we update the state and send the data to the API
  // otherwise we can just update the local state (i.e. within form sections)
  /* eslint-disable */
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
  /* eslint-enable */

  useEffect(() => {
    /* eslint-disable */
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
              status: "Completed",
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
            phone: "13015256364",
            position: "ABC",
            institution: "University of Pennsylvania",
          },
          additionalContacts: [
            {
              role: "Administrative Contact",
              firstName: "Fred",
              lastName: "Graph",
              email: "fred.graph@nih.gov",
              phone: "3015555555",
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
            description: "", // non-custom programs do not have descriptions
          },
          study: {
            title: "Example Study 1",
            abbreviation: "ES1",
            description: "", // non-custom studies do not have descriptions
            repositories: [
              {
                name: "Example Repository",
                studyID: "1234",
              }
            ]
          },
          publications: [
            {
              title: "ABC Pub 123",
              pubmedID: "123456",
              DOI: "10.123/abc123",
            },
          ],
          plannedPublications: [
            {
              title: "ABC Pub 123",
              expectedDate: "06/01/2023"
            },
          ],
          funding: {
            agencies: [
              {
                name: "National Cancer Institute",
                grantNumbers: [
                  "R01CA123456",
                ],
              }
            ],
            nciProgramOfficer: 'Fred Franklin',
            nciGPA: 'Person ABC',
          }
        },
      });
    }, 500);
    /* eslint-enable */
  }, [id]);

  const value = useMemo(() => ({ ...state, setData }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
