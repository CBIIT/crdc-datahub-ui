import type { Meta, StoryObj } from "@storybook/react";
import GenericTable from "./GenericTable";

const meta = {
  title: "Data Submissions / Generic Table",
  component: GenericTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GenericTable>;

export default meta;
type Story = StoryObj<typeof meta>;

type ExampleDatasetType = {
  column1: string;
};

const exampleDataset: ExampleDatasetType[] = [
  {
    column1: "Row 1",
  },
  {
    column1: "Row 2",
  },
];

const exampleColumns = [
  {
    label: "Column #1",
    renderValue: (dataset: ExampleDatasetType) => dataset.column1,
  },
  {
    label: "Column #2",
    renderValue: (dataset: ExampleDatasetType) => dataset.column1,
  },
  {
    label: "Column #3",
    renderValue: (dataset: ExampleDatasetType) => dataset.column1,
  },
  {
    label: "Column #4",
    renderValue: (dataset: ExampleDatasetType) => dataset.column1,
  },
];

export const Table: Story = {
  args: {
    columns: exampleColumns,
    data: exampleDataset,
    total: exampleDataset.length,
    loading: false,
  },
};

export const NoData: Story = {
  args: {
    columns: exampleColumns,
    data: [],
    total: 0,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    columns: exampleColumns,
    data: [],
    total: 0,
    numRowsNoContent: 4,
    loading: true,
  },
};
