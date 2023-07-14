import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isLoggedIn,
  logIn
} from '../../api/authn';

export type ContextState = {
  isLoggedIn: boolean;
  user: User;
};

const initialState: ContextState = {
  isLoggedIn: false,
  user: null,
};

/**
 * Auth Context
 *
 * NOTE: Do NOT use this context directly. Use the useAuthContext hook instead.
 *       this is exported for testing purposes only.
 *
 * @see ContextState – Auth context state
 * @see useAuthContext – Auth context hook
 */
export const Context = createContext<ContextState>(initialState);
Context.displayName = 'AuthContext';

/**
 * Auth Context Hook
 *
 * @see AuthProvider – Must be wrapped in a AuthProvider component
 * @see ContextState – Auth context state returned by the hook
 * @returns {ContextState} - Auth context
 */
export const useAuthContext = (): ContextState => {
  const context = useContext<ContextState>(Context);

  if (!context) {
    throw new Error("AuthContext cannot be used outside of the AuthProvider component");
  }

  return context;
};

type ProviderProps = {
  children: React.ReactNode;
};

/**
 * Creates an auth context
 *
 * @see useAuthContext – Auth context hook
 * @param {ProviderProps} props - Auth context provider props
 * @returns {JSX.Element} - Auth context provider
 */
export const AuthProvider: FC<ProviderProps> = (props) => {
  const { children } = props;
  const [state, setState] = useState<ContextState>(initialState);

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const authCode = searchParams.get('code');

    if (!isLoggedIn()) {
      logIn(authCode);
    }
  }, []);

  const value = useMemo(() => ({ ...state }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
