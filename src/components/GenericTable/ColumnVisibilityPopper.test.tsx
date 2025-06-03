import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mock } from "vitest";
import { axe } from "vitest-axe";
import ColumnVisibilityPopper from "./ColumnVisibilityPopper";

type Column = {
  field: string;
  fieldKey?: string;
  label: string;
  hideable?: boolean;
  defaultHidden?: boolean;
};

const columns: Column[] = [
  { field: "name", label: "Name", hideable: false },
  { field: "age", label: "Age", defaultHidden: true },
  { field: "email", label: "Email" },
];

const getColumnKey = (column: Column) => column.fieldKey ?? column.field;
const getColumnLabel = (column: Column) => column.label;

describe("Accessibility", () => {
  let columnVisibilityModel: { [key: string]: boolean };
  let setColumnVisibilityModel: Mock;
  const onClose = vi.fn();

  beforeEach(() => {
    columnVisibilityModel = {
      name: true,
      age: true,
      email: true,
    };
    setColumnVisibilityModel = vi.fn((model) => {
      columnVisibilityModel = model;
    });
    onClose.mockClear();
  });
  it("should not have accessibility violations when open", async () => {
    const { container } = render(
      <ColumnVisibilityPopper
        anchorEl={document.body}
        open
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        getColumnKey={getColumnKey}
        getColumnLabel={getColumnLabel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        onClose={onClose}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ColumnVisibilityPopper", () => {
  let columnVisibilityModel: { [key: string]: boolean };
  let setColumnVisibilityModel: Mock;
  const onClose = vi.fn();

  beforeEach(() => {
    columnVisibilityModel = {
      name: true,
      age: true,
      email: true,
    };
    setColumnVisibilityModel = vi.fn((model) => {
      columnVisibilityModel = model;
    });
    onClose.mockClear();
  });

  const renderComponent = (props = {}) =>
    render(
      <ColumnVisibilityPopper
        anchorEl={document.body}
        open
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        getColumnKey={getColumnKey}
        getColumnLabel={getColumnLabel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        onClose={onClose}
        {...props}
      />
    );

  it("renders columns correctly", () => {
    const { getByTestId } = renderComponent();

    const nameCheckbox = getByTestId("checkbox-name") as HTMLInputElement;
    const ageCheckbox = getByTestId("checkbox-age") as HTMLInputElement;
    const emailCheckbox = getByTestId("checkbox-email") as HTMLInputElement;

    expect(nameCheckbox).toBeChecked();
    expect(nameCheckbox).toBeDisabled();

    expect(ageCheckbox).toBeChecked();
    expect(ageCheckbox).not.toBeDisabled();

    expect(emailCheckbox).toBeChecked();
    expect(emailCheckbox).not.toBeDisabled();
  });

  it("does not call onColumnVisibilityModelChange when non-hideable column's checkbox is changed", () => {
    const { getByTestId } = renderComponent();

    const nameCheckbox = getByTestId("checkbox-name") as HTMLInputElement;

    // Remove the 'disabled' attribute and allow pointer events temporarily to simulate the click
    nameCheckbox.style.pointerEvents = "all";
    nameCheckbox.disabled = false;
    userEvent.click(nameCheckbox);
    expect(setColumnVisibilityModel).not.toHaveBeenCalled();
    nameCheckbox.style.pointerEvents = "auto";
    nameCheckbox.disabled = true;
  });

  it("returns columns unsorted when sortAlphabetically is false", () => {
    const unorderedColumns: Column[] = [
      { field: "email", label: "Email" },
      { field: "name", label: "Name", hideable: false },
      { field: "age", label: "Age" },
    ];

    const { getAllByTestId } = renderComponent({
      columns: unorderedColumns,
      sortAlphabetically: false,
    });

    // Get all checkboxes for the columns (excluding "Show/Hide All")
    const checkboxes = getAllByTestId(/^checkbox-/);

    const columnKeys = checkboxes.map((checkbox) => {
      const dataTestId = checkbox.getAttribute("data-testid") || "";
      return dataTestId.replace("checkbox-", "");
    });

    // The expected order of keys based on unorderedColumns
    const expectedOrder = unorderedColumns.map(getColumnKey);

    expect(columnKeys).toEqual(expectedOrder);
  });

  it("toggles column visibility", () => {
    const { getByTestId } = renderComponent();

    const ageCheckbox = getByTestId("checkbox-age") as HTMLInputElement;
    userEvent.click(ageCheckbox);

    expect(setColumnVisibilityModel).toHaveBeenCalledWith({
      name: true,
      age: false,
      email: true,
    });
  });

  it("toggles all columns", () => {
    const { getByTestId } = renderComponent();

    const toggleAllCheckbox = getByTestId("toggle-all-checkbox") as HTMLInputElement;
    userEvent.click(toggleAllCheckbox);

    expect(setColumnVisibilityModel).toHaveBeenCalledWith({
      name: true, // Non-hideable remains true
      age: false,
      email: false,
    });
  });

  it("should reset columns back to default", () => {
    columnVisibilityModel = {
      name: false,
      age: true,
      email: false,
    };

    const { getByTestId } = renderComponent();

    const resetButton = getByTestId("reset-button");
    userEvent.click(resetButton);

    expect(setColumnVisibilityModel).toHaveBeenCalledWith({
      name: true,
      age: false, // default hidden
      email: true,
    });
  });

  it("close button works", () => {
    const { getByTestId } = renderComponent();

    const closeButton = getByTestId("column-visibility-popper-close-button");
    userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
