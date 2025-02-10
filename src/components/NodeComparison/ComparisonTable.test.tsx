import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ComparisonTable from "./ComparisonTable";
import { RetrieveReleasedDataResp } from "../../graphql";

const baseNode: RetrieveReleasedDataResp["retrieveReleasedDataByID"][number] = {
  nodeType: "",
  nodeID: "",
  props: "{}",
};

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container, getByText } = render(
      <ComparisonTable
        newNode={{ ...baseNode, props: JSON.stringify({ mock_node_data_name: "bar", baz: 1 }) }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "baz", baz: 2 }),
        }}
        loading={false}
      />
    );

    expect(getByText(/mock_node_data_name/i)).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations (loading)", async () => {
    const { container } = render(<ComparisonTable newNode={null} existingNode={null} loading />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations (no data)", async () => {
    const { container } = render(
      <ComparisonTable newNode={null} existingNode={null} loading={false} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<ComparisonTable newNode={null} existingNode={null} loading={false} />)
    ).not.toThrow();
  });

  it("should show an error message when there is no data (all null)", () => {
    const { getByTestId, getByText } = render(
      <ComparisonTable newNode={null} existingNode={null} loading={false} />
    );

    expect(getByTestId(/node-comparison-error/i)).toBeInTheDocument();
    expect(getByText(/Unable to show comparison of data/i)).toBeInTheDocument();
  });

  it("should show an error message when there is no data (empty props)", () => {
    const { getByTestId, getByText } = render(
      <ComparisonTable
        newNode={{ ...baseNode, props: "{}" }}
        existingNode={{ ...baseNode, props: "{}" }}
        loading={false}
      />
    );

    expect(getByTestId(/node-comparison-error/i)).toBeInTheDocument();
    expect(getByText(/Unable to show comparison of data/i)).toBeInTheDocument();
  });

  it("should show an error message when there is no data (parsing issue 1/2)", () => {
    const { getByTestId, getByText } = render(
      <ComparisonTable
        newNode={{ ...baseNode, props: "NOT JSON" }}
        existingNode={{ ...baseNode, props: "{}" }}
        loading={false}
      />
    );

    expect(getByTestId(/node-comparison-error/i)).toBeInTheDocument();
    expect(getByText(/Unable to show comparison of data/i)).toBeInTheDocument();
  });

  it("should show an error message when there is no data (parsing issue 2/2)", () => {
    const { getByTestId, getByText } = render(
      <ComparisonTable
        newNode={{ ...baseNode, props: "{}" }}
        existingNode={{ ...baseNode, props: "NOT JSON" }}
        loading={false}
      />
    );

    expect(getByTestId(/node-comparison-error/i)).toBeInTheDocument();
    expect(getByText(/Unable to show comparison of data/i)).toBeInTheDocument();
  });

  it("should show a loading skeleton when loading", () => {
    const { getAllByTestId } = render(
      <ComparisonTable newNode={null} existingNode={null} loading />
    );

    expect(getAllByTestId("node-comparison-table-header-skeleton")).toHaveLength(5);
  });

  it("should rerender if a dependency changes", () => {
    const { rerender, getByText, queryByText } = render(
      <ComparisonTable
        newNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 01", baz: 1 }),
        }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 02", baz: 2 }),
        }}
        loading={false}
      />
    );

    expect(getByText(/example 01/i)).toBeInTheDocument();
    expect(getByText(/example 02/i)).toBeInTheDocument();

    rerender(
      <ComparisonTable
        newNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 03", baz: 1 }),
        }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 04", baz: 2 }),
        }}
        loading={false}
      />
    );

    expect(queryByText(/example 01/i)).not.toBeInTheDocument();
    expect(queryByText(/example 02/i)).not.toBeInTheDocument();
    expect(getByText(/example 03/i)).toBeInTheDocument();
    expect(getByText(/example 04/i)).toBeInTheDocument();
  });
});

describe("Implementation Requirements", () => {
  it("should show a table with the correct number of columns", () => {
    const { getByTestId } = render(
      <ComparisonTable
        newNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 01", baz: 1 }),
        }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify({ mock_node_data_name: "example 02", baz: 2 }),
        }}
        loading={false}
      />
    );

    expect(getByTestId("node-comparison-table")).toBeInTheDocument();
    expect(getByTestId("node-comparison-table").querySelectorAll("th")).toHaveLength(2);
  });

  it("should contain all of the header cells for each property", () => {
    const dataset = {
      mock_node_data_name: "example 01",
      another_property: "example 02",
      "property.with.dots": "yes",
    };

    const { getByText } = render(
      <ComparisonTable
        newNode={{
          ...baseNode,
          props: JSON.stringify(dataset),
        }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify(dataset),
        }}
        loading={false}
      />
    );

    expect(getByText(/mock_node_data_name/i)).toBeInTheDocument();
    expect(getByText(/another_property/i)).toBeInTheDocument();
    expect(getByText(/property.with.dots/i)).toBeInTheDocument();
  });

  // NOTE: this should never happen, but covering for completeness
  it("should aggregate all of the properties from both nodes", () => {
    const { getByText } = render(
      <ComparisonTable
        newNode={{
          ...baseNode,
          props: JSON.stringify({ mock_data_01: "example 01", another_md_02: 1 }),
        }}
        existingNode={{
          ...baseNode,
          props: JSON.stringify({ mock_data_02: "example 02", another_md_03: 2 }),
        }}
        loading={false}
      />
    );

    // new
    expect(getByText(/mock_data_01/i)).toBeInTheDocument();
    expect(getByText(/another_md_02/i)).toBeInTheDocument();

    // existing
    expect(getByText(/mock_data_02/i)).toBeInTheDocument();
    expect(getByText(/another_md_03/i)).toBeInTheDocument();
  });
});

describe("Snapshots", () => {
  it("should match the loading state snapshot", () => {
    const { container } = render(<ComparisonTable newNode={null} existingNode={null} loading />);

    expect(container).toMatchSnapshot("loading table");
  });
});
