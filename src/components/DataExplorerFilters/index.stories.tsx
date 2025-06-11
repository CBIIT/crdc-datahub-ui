import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Filters, { DataExplorerFilterProps } from "./index";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";

type CustomStoryProps = DataExplorerFilterProps;

const meta: Meta<CustomStoryProps> = {
  title: "Data Explorer / DataExplorerFilters",
  component: Filters,
  args: {
    columns: [],
    columnVisibilityModel: {},
    onChange: fn(),
    onColumnVisibilityModelChange: fn(),
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SearchParamsProvider>
        <Story />
      </SearchParamsProvider>
    ),
  ],
} satisfies Meta<CustomStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StudyViewFilters: Story = {
  args: {
    ...meta.args,
    nodeTypes: ["mock-node-1", "another-mock-node", "participant-node"],
    defaultValues: {
      nodeType: "mock-node-1",
    },
  },
};
