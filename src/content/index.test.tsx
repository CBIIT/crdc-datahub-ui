import { FC, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import HomePage from "./index";
import {
  ContextState,
  Context,
  Status,
} from "../components/Contexts/AuthContext";

const Parent: FC<{ children: React.ReactElement; loggedIn: boolean }> = ({
  children,
  loggedIn,
}) => {
  const value: ContextState = useMemo(
    () => ({
      isLoggedIn: loggedIn,
      status: Status.LOADED,
      user: null,
    }),
    [loggedIn]
  );

  return (
    <MockedProvider>
      <BrowserRouter>
        <Context.Provider value={value}>{children}</Context.Provider>
      </BrowserRouter>
    </MockedProvider>
  );
};

describe("should not have any accessibility violations", () => {
  it("when logged in", async () => {
    const { container } = render(
      <Parent loggedIn>
        <HomePage />
      </Parent>
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("when logged out", async () => {
    const { container } = render(
      <Parent loggedIn={false}>
        <HomePage />
      </Parent>
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
