import type { Meta, StoryObj } from "@storybook/react";
import NavigatorView from "./NavigatorView";
import { DataCommonProvider } from "../../components/Contexts/DataCommonContext";
import ErrorBoundary from "../../components/ErrorBoundary";
import { DataCommons } from "../../config/DataCommons";
import env from "../../env";

type CustomStoryProps = React.ComponentProps<typeof NavigatorView> & {
  model: string;
  version?: string;
  tier?: AppEnv["REACT_APP_DEV_TIER"];
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
    },
    tier: {
      control: "select",
      description: "The deployment tier",
      options: ["dev", "dev2", "qa", "qa2", "stage", "prod"],
    },
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, context) => {
      try {
        // Remove the model manifest from session storage
        sessionStorage.removeItem("manifest");

        // Set the dev tier to fetch the correct manifest from
        env.REACT_APP_DEV_TIER = context.args.tier;
      } catch (e) {
        /* empty */
      }

      return (
        <ErrorBoundary key={`${context.args.tier}-${context.args.model}-${context.args.version}`}>
          <DataCommonProvider DataCommon={context.args.model}>
            <Story />
          </DataCommonProvider>
        </ErrorBoundary>
      );
    },
  ],
} satisfies Meta<CustomStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModelNavigator: Story = {
  args: {
    model: "CDS",
    version: "latest",
    tier: "dev",
  },
};
