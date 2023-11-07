import React, { FC } from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { useDataCommonContext, Status as DCStatus, DataCommonProvider } from './DataCommonContext';

const TestChild: FC = () => {
  const { status } = useDataCommonContext();

  if (status === DCStatus.LOADING) {
    return null;
  }

  return (
    <div data-testid="status">{status}</div>
  );
};

type Props = {
  dc: string;
  children?: React.ReactNode;
};

const TestParent: FC<Props> = ({ dc, children } : Props) => (
  <DataCommonProvider DataCommon={dc}>
    {children ?? <TestChild />}
  </DataCommonProvider>
);

describe("DataCommonContext > useDataCommonContext Tests", () => {
  it("should throw an exception when used outside of a DataCommonProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow("useDataCommonContext cannot be used outside of the DataCommonProvider component");
    jest.spyOn(console, "error").mockRestore();
  });
});

describe("DataCommonContext > DataCommonProvider Tests", () => {
  it("should render without crashing", () => {
    render(<TestParent dc="XYZ" />);
  });
});
