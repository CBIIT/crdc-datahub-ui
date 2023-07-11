import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { GET_USER } from './graphql';

export type ContextState = {
  isLoggedIn: boolean;
  user: object;
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

  const [getUser, { data, error }] = useLazyQuery(GET_USER, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const [searchParams] = useSearchParams();
  const authCode = searchParams.get('code');

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Cookie', 'connect.sid=s%3AvOcaFQHqS3fAln2d4aFKB91ARVNF0iy8.BS0z5yuZn0CugxB%2FSojYbX4XRINNhGEkJWp4LRybsfo');
    myHeaders.append('Access-Control-Allow-Origin', 'http://localhost:4000');

    const raw = JSON.stringify({
      code: authCode,
      IDP: 'nih',
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      // redirect: 'follow',
    };

    fetch('http://localhost:4000/api/authn/login', requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error));
    getUser();
  }, [getUser]);

  const value = useMemo(() => ({ ...state }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
