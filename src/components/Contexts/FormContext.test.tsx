import React, { FC } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Status as FormStatus, FormProvider, useFormContext } from "./FormContext";
import '@testing-library/jest-dom';

type Props = {
  appId: string | number;
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
  <FormProvider id={appId}>
    <TestChild />
  </FormProvider>
  );

describe("FormContext tests", () => {
  it("should return an error for empty IDs", async () => {
    const screen = render(<TestParent appId="" />);

    await waitFor(() => expect(screen.container.querySelector("#test-error")).toBeInTheDocument());

    expect(screen.container.querySelector("#test-status").textContent).toEqual(FormStatus.ERROR);
    expect(screen.container.querySelector("#test-error")).toBeInTheDocument(); // Don't asset the error message
  });

  it("should return an error for non-numeric IDs", async () => {
    const screen = render(<TestParent appId="thisIsNotANumericId" />);

    await waitFor(() => expect(screen.container.querySelector("#test-error")).toBeInTheDocument());

    expect(screen.container.querySelector("#test-status").textContent).toEqual(FormStatus.ERROR);
    expect(screen.container.querySelector("#test-error")).toBeInTheDocument(); // Don't asset the error message
  });

  // TODO: Add more tests after implementing the API
});
