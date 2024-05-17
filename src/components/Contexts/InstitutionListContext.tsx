import React, { FC, createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { LIST_ORGS, ListOrgsResp } from "../../graphql";

export type InstitutionCtxState = {
  status: InstitutionCtxStatus;
  data: string[];
};

export enum InstitutionCtxStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const initialState: InstitutionCtxState = { status: InstitutionCtxStatus.LOADING, data: null };

/**
 * Institution List Context
 *
 * @note Do NOT use this context directly. This is exported for testing purposes only.
 * @see {@link InstitutionCtxState} – Organization context state
 * @see {@link useInstitutionList} – Organization context hook
 */
export const InstitutionCtx = createContext<InstitutionCtxState>(null);
InstitutionCtx.displayName = "InstitutionListContext";

/**
 * Submission Request Institution Context Hook
 *
 * @see {@link InstitutionProvider} Must be wrapped in the provider component
 * @see {@link InstitutionCtxState} Context state returned by the hook
 */
export const useInstitutionList = (): InstitutionCtxState => {
  const context = useContext<InstitutionCtxState>(InstitutionCtx);

  if (!context) {
    throw new Error(
      "useInstitutionList cannot be used outside of the InstitutionProvider component"
    );
  }

  return context;
};

type ProviderProps = {
  children: React.ReactNode;
};

/**
 * Provides access to the Institution List hook
 *
 * @see {@link useInstitutionList} The context hook
 * @returns React Context Provider
 */
export const InstitutionProvider: FC<ProviderProps> = ({ children }: ProviderProps) => {
  const [state, setState] = useState<InstitutionCtxState>(initialState);

  // TODO: Update to fetch real institution data
  const { data, loading, error } = useQuery<ListOrgsResp>(LIST_ORGS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (loading) {
      setState({ status: InstitutionCtxStatus.LOADING, data: null });
      return;
    }
    if (error) {
      setState({ status: InstitutionCtxStatus.ERROR, data: null });
      return;
    }

    setState({
      status: InstitutionCtxStatus.LOADED,
      data: data?.listOrganizations?.map((org) => org.name) || [],
    });
  }, [loading, error, data]);

  return <InstitutionCtx.Provider value={state}>{children}</InstitutionCtx.Provider>;
};
