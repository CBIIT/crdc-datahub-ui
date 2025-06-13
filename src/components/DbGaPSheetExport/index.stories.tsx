import type { Meta, StoryObj } from "@storybook/react";
import Button, { DbGaPSheetExportProps } from "./index";
import { SubmissionContext, SubmissionCtxStatus } from "../Contexts/SubmissionContext";
import type { GetSubmissionResp } from "../../graphql";
import { DataCommons } from "../../config/DataCommons";

type CustomStoryProps = DbGaPSheetExportProps & {
  dataCommons: string;
  submissionId: string;
};

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / dbGaP Sheets Button",
  tags: ["autodocs"],
  component: Button,
  args: {
    submissionId: "mock-submission-id",
    dataCommons: DataCommons[0].name,
  },
  argTypes: {
    dataCommons: {
      description: "The data commons associated with the submission",
      control: "select",
      options: DataCommons.map((dc) => dc.name),
    },
  },
  decorators: [
    (Story, context) => (
      <SubmissionContext.Provider
        value={{
          data: {
            getSubmission: {
              _id: context.args.submissionId,
              dataCommons: context.args.dataCommons,
            },
          } as GetSubmissionResp,
          status: SubmissionCtxStatus.LOADED,
          error: null,
        }}
      >
        <Story />
      </SubmissionContext.Provider>
    ),
  ],
} satisfies Meta<CustomStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
  },
};

export const Disabled: Story = {
  args: {
    ...meta.args,
    disabled: true,
  },
};

export const Hidden: Story = {
  args: {
    ...meta.args,
    dataCommons: "UNSUPPORTED_DC",
  },
};
