import type { Meta, StoryObj } from "@storybook/react";
import NavigatorView from "./NavigatorView";
import { DataCommonProvider } from "../../components/Contexts/DataCommonContext";
import ErrorBoundary from "../../components/ErrorBoundary";
import { DataCommons } from "../../config/DataCommons";

type CustomStoryProps = React.ComponentProps<typeof NavigatorView> & {
  model: string;
  version?: string;
};

const meta: Meta<CustomStoryProps> = {
  title: "Pages / Model Navigator",
  component: NavigatorView,
  args: {},
  argTypes: {
    model: {
      control: "select",
      description: "The model to display",
      options: DataCommons.map((model) => model.name),
    },
    version: {
      control: "text",
      description: "The version of the model to display",
      defaultValue: "latest",
    },
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, context) => (
      <ErrorBoundary key={`${context.args.model}-${context.args.version}`}>
        <DataCommonProvider DataCommon={context.args.model}>
          <Story />
        </DataCommonProvider>
      </ErrorBoundary>
    ),
  ],
} satisfies Meta<CustomStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModelNavigator: Story = {
  args: {
    model: "CDS",
    version: "latest",
  },
};
