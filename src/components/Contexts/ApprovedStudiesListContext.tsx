import React, { FC, createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { LIST_APPROVED_STUDIES, ListApprovedStudiesResp } from "../../graphql";

export type ContextState = {
  status: Status;
  data: ApprovedStudy[];
};

export enum Status {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const initialState: ContextState = {
  status: Status.LOADING,
  data: [],
};

/**
 * Approved Studies List Context
 *
 * NOTE: Do NOT use this context directly. Use the useApprovedStudiesListContext hook instead.
 *       this is exported for testing purposes only.
 *
 * @see ContextState ApprovedStudies context state
 * @see useApprovedStudiesListContext ApprovedStudies context hook
 */
export const Context = createContext<ContextState>(null);
Context.displayName = "ApprovedStudiesListContext";

/**
 * Approved Studies Context Hook
 *
 *
 * @see ApprovedStudiesProvider Must be wrapped in a ApprovedStudiesProvider component
 * @see ContextState Approved Studies context state returned by the hook
 * @returns {ContextState} - Approved Studies context
 */
export const useApprovedStudiesListContext = (): ContextState => {
  const context = useContext<ContextState>(Context);

  if (!context) {
    throw new Error(
      "ApprovedStudiesListContext cannot be used outside of the ApprovedStudiesProvider component"
    );
  }

  return context;
};

type ProviderProps = {
  preload: boolean;
  children: React.ReactNode;
};

/**
 * Creates a approved studies context provider
 *
 * @see useApprovedStudiesListContext
 * @param {ProviderProps} props
 * @returns {JSX.Element} Context provider
 */
export const ApprovedStudiesProvider: FC<ProviderProps> = ({
  preload,
  children,
}: ProviderProps) => {
  const [state, setState] = useState<ContextState>(initialState);

  const { data, loading, error } = preload
    ? useQuery<ListApprovedStudiesResp>(LIST_APPROVED_STUDIES, {
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      })
    : { data: null, loading: false, error: null };

  useEffect(() => {
    if (loading) {
      setState({ status: Status.LOADING, data: [] });
      return;
    }
    if (error) {
      setState({ status: Status.ERROR, data: [] });
      return;
    }

    setState({
      status: Status.LOADED,
      data: data?.listApprovedStudies?.studies || [],
    });
  }, [loading, error, data]);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
