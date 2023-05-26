import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type contextState = {
  status: Status;
  data: Application;
  error?: string;
};

export enum Status {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const initialState: contextState = { status: Status.LOADING, data: null };

/**
 * Form Context
 *
 * @see contextState – Form context state
 * @see useFormContext – Form context hook
 */
const Context = createContext<contextState>(initialState);

/**
 * Form Context Hook
 *
 * @see FormProvider – Must be wrapped in a FormProvider component
 * @see contextState – Form context state returned by the hook
 * @returns {contextState} - Form context
 */
export const useFormContext = (): contextState => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Form components cannot be rendered outside the FormProvider component"
    );
  }

  return context;
};

type providerProps = {
  id: string | number;
  children: any;
};

/**
 * Creates a form context for the given form ID
 *
 * @see useFormContext – Form context hook
 * @param {providerProps} props - Form context provider props
 * @param {string|number} props.id - Form ID
 * @param {any} props.children - Child components
 * @returns {JSX.Element} - Form context provider
 */
export const FormProvider: FC<providerProps> = (props) => {
  const { children, id } = props;
  const [state, setState] = useState<contextState>(initialState);

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
      if (id.toString() == "1234") {
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
            firstName: "John " + Math.random().toString(36).substring(7),
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

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
