import React, { createContext, useContext, useMemo } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";

type ContextState = {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
};

/**
 * Search Params Context
 *
 * NOTE: Do NOT use this context directly. Use the useSearchParamsContext hook instead.
 *       this is exported for testing purposes only.
 *
 * @see ContextState – Search Params context state
 * @see useSearchParamsContext – Search Params context hook
 */
export const Context = createContext<ContextState>(null);
Context.displayName = "SearchParamsContext";

type ProviderProps = {
  children: React.ReactNode;
};

/**
 * Creates a Search Params context provider
 *
 * @see useSearchParamsContext
 * @param {ProviderProps} props
 * @returns {JSX.Element} Context provider
 */
export const SearchParamsProvider: React.FC<ProviderProps> = ({ children }) => {
  const [searchParams, setSearchParamsBase] = useSearchParams();

  const setSearchParams: SetURLSearchParams = (newSearchParams, options = {}) => {
    setSearchParamsBase(newSearchParams, { replace: true, ...options });
  };

  const value = useMemo(
    () => ({
      searchParams,
      setSearchParams,
    }),
    [searchParams, setSearchParams]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Search Params Hook
 *
 * Note:
 * - The allows for maintaining searchParams state across components
 *
 * @see SearchParamsProvider – Must be wrapped in a SearchParamsProvider component
 * @see ContextState – Search Params context state returned by the hook
 * @returns {[URLSearchParams, SetURLSearchParams]} - Search Params context and setter
 */
export const useSearchParamsContext = (): [URLSearchParams, SetURLSearchParams] => {
  const context = useContext<ContextState>(Context);

  if (!context) {
    throw new Error(
      "useSearchParamsContext cannot be used outside of the SearchParamsProvider component"
    );
  }

  return [context.searchParams, context.setSearchParams];
};
