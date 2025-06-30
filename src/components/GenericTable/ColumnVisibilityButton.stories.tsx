import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, screen, within, waitFor } from "@storybook/test";
import React, { useState } from "react";

import ColumnVisibilityButton from "./ColumnVisibilityButton";
import { ColumnVisibilityPopperGroup } from "./ColumnVisibilityPopper";

type Column = {
  field: string;
  fieldKey?: string;
  label: string;
  hideable?: boolean;
};

const columns: Column[] = [
  { field: "name", label: "Name", hideable: false },
  { field: "age", label: "Age" },
  { field: "email", label: "Email" },
];

const getColumnKey = (column: Column) => column.fieldKey ?? column.field;
const getColumnLabel = (column: Column) => column.label;

const meta: Meta<typeof ColumnVisibilityButton<Column>> = {
  title: "Miscellaneous / Column Visibility",
  component: ColumnVisibilityButton,
  tags: ["autodocs"],
} satisfies Meta<typeof ColumnVisibilityButton<Column>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: "Basic - Ungrouped",
  render: () => {
    const [mockModel, setMockModel] = useState<Record<string, boolean>>({
      name: true,
      age: true,
      email: true,
    });

    return (
      <ColumnVisibilityButton
        columns={columns}
        columnVisibilityModel={mockModel}
        getColumnKey={fn(getColumnKey)}
        getColumnLabel={fn(getColumnLabel)}
        onColumnVisibilityModelChange={fn(setMockModel)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const { getByTestId, findByTestId } = within(canvasElement);

    await findByTestId("column-visibility-button");
    await userEvent.click(getByTestId("column-visibility-button"));

    await waitFor(() => screen.findByTestId("column-visibility-popper"));

    await userEvent.unhover(getByTestId("column-visibility-button"));
  },
};

export const BasicWithGroups: Story = {
  name: "Basic - Grouped",
  render: () => {
    const [mockModel, setMockModel] = useState<Record<string, boolean>>({
      name: true,
      age: true,
      email: true,
    });

    const mockGroups: ColumnVisibilityPopperGroup[] = [
      { name: "lorem", description: "lorem ipsum dolor sit amet" },
      { name: "ipsum", description: "ipsum dolor sit amet" },
      { name: "dolor", description: "dolor sit amet dolor" },
    ];

    const mockGetGroups = (column: Column) => {
      switch (column.field) {
        case "name":
          return "lorem";
        case "age":
          return "ipsum";
        case "email":
          return "dolor";
        default:
          return undefined;
      }
    };

    return (
      <ColumnVisibilityButton
        columns={columns}
        groups={mockGroups}
        columnVisibilityModel={mockModel}
        getColumnKey={fn(getColumnKey)}
        getColumnLabel={fn(getColumnLabel)}
        getColumnGroup={fn(mockGetGroups)}
        onColumnVisibilityModelChange={fn(setMockModel)}
      />
    );
  },
  play: Basic.play,
};

export const Hovered: Story = {
  ...Basic,
  play: async ({ canvasElement }) => {
    const { getByTestId, findByTestId } = within(canvasElement);

    await findByTestId("column-visibility-button");
    await userEvent.hover(getByTestId("column-visibility-button"));

    await waitFor(() => screen.findByRole("tooltip"));
  },
};
