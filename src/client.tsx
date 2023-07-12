/* eslint-disable */ 
import {
  ApolloClient, InMemoryCache, ApolloLink, HttpLink, DefaultOptions
} from '@apollo/client';
import env from './env';

const defaultOptions:DefaultOptions = {
  query: {
    fetchPolicy: 'no-cache',
  },
};

const BACKEND = env.REACT_APP_BACKEND_API;
const MOCK = 'https://7a242248-52f7-476a-a60f-d64a2db3dd5b.mock.pstmn.io/graphql';
const AUTH_SERVICE = `${window.origin}/api/authn`;
const USER_SERVICE = `${window.origin}/api/authz/graphql`;

const backendService = new HttpLink({
  uri: BACKEND,
});

const authService = new HttpLink({
  uri: AUTH_SERVICE,
});

const userService = new HttpLink({
  uri: USER_SERVICE,
});


const mockService = new HttpLink({
  uri: MOCK,
  headers: {
    'x-mock-match-request-body': 'true',
  },
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions,
  link: ApolloLink.split(
      (operation) => operation.getContext().clientName === 'mockService',
      mockService,
      ApolloLink.split(
        (operation) => operation.getContext().clientName === 'authService',
        // the string "authService" can be anything you want,
        authService, // <= apollo will send to this if clientName is "authService"
        ApolloLink.split( // This is 2nd level of ApolloLink.
          (operation) => operation.getContext().clientName === 'userService',
          // the string "userService" can be anything you want,
          userService, // <= apollo will send to this if clientName is "userService"
          backendService, // <= otherwise will send to this
        ), // <= otherwise will send to this
      ),
  ),
});


export default client;
