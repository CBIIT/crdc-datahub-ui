import React, { FC } from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Status as FormStatus, FormProvider, useFormContext } from "./FormContext";

type Props = {
  appId: string;
};

const TestChild: FC = () => {
  const { status, error } = useFormContext();

  if (status === FormStatus.LOADING) {
    return <div id="test-loading">Loading...</div>;
  }

  return (
    <>
      <div id="test-status">{status}</div>
      <div id="test-error">{error}</div>
    </>
  );
};

const TestParent: FC<Props> = ({ appId } : Props) => (
  <MockedProvider>
    <FormProvider id={appId}>
      <TestChild />
    </FormProvider>
  </MockedProvider>
  );

describe("FormContext tests", () => {
  it("should return an error for empty IDs", async () => {
    const screen = render(<TestParent appId="" />);

    await waitFor(() => expect(screen.container.querySelector("#test-error")).toBeInTheDocument());

    expect(screen.container.querySelector("#test-status").textContent).toEqual(FormStatus.ERROR);
    expect(screen.container.querySelector("#test-error")).toBeInTheDocument();
  });

  // TODO: Add more tests after implementing the API
});
