import type { Meta, StoryObj } from "@storybook/react";
import { FormProvider, useForm } from "react-hook-form";
import { MockedResponse } from "@apollo/client/testing";
import { userEvent, within } from "@storybook/testing-library";
import PermissionPanel from "./index";
import {
  RetrievePBACDefaultsResp,
  RetrievePBACDefaultsInput,
  RETRIEVE_PBAC_DEFAULTS,
  EditUserInput,
} from "../../graphql";

const meta: Meta<typeof PermissionPanel> = {
  title: "Miscellaneous / Permission Panel",
  component: PermissionPanel,
  tags: ["autodocs"],
  args: {
    readOnly: false,
  },
  decorators: [
    (Story, ctx) => {
      const methods = useForm<EditUserInput>({
        defaultValues: {
          role: "Submitter",
          permissions: [],
          notifications: [],
        },
      });

      return (
        <FormProvider key={`${ctx.args.readOnly}`} {...methods}>
          <Story />
        </FormProvider>
      );
    },
    (Story) => (
      <div style={{ position: "relative", marginTop: "-63px" }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(within(canvas.getByTestId("permissions-accordion")).getByRole("button"));

    await userEvent.click(
      within(canvas.getByTestId("notifications-accordion")).getByRole("button")
    );

    // Remove focus from the accordion button
    await userEvent.click(canvasElement);
  },
} satisfies Meta<typeof PermissionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockWithData: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
  request: {
    query: RETRIEVE_PBAC_DEFAULTS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      retrievePBACDefaults: [
        {
          role: "Submitter",
          permissions: [
            {
              _id: "submission_request:create",
              group: "Submission Request",
              name: "Create",
              inherited: ["submission_request:view"],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "data_submission:view",
              group: "Data Submission",
              name: "View",
              inherited: [],
              order: 0,
              checked: true,
              disabled: false,
            },
            {
              _id: "data_submission:create",
              group: "Data Submission",
              name: "Create",
              inherited: ["data_submission:view"],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "data_submission:cancel",
              group: "Data Submission",
              name: "Cancel",
              inherited: ["data_submission:create"],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "data_submission:review",
              group: "Data Submission",
              name: "Review",
              inherited: ["data_submission:view"],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "access:request",
              group: "Miscellaneous",
              name: "Request Access",
              inherited: [],
              order: 0,
              checked: true,
              disabled: true,
            },
          ],
          notifications: [
            {
              _id: "data_submission:cancelled",
              group: "Data Submissions",
              name: "Cancelled",
              inherited: [],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "data_submission:completed",
              group: "Data Submissions",
              name: "Completed",
              inherited: ["data_submission:cancelled"],
              order: 0,
              checked: false,
              disabled: false,
            },
            {
              _id: "account:disabled",
              group: "Account",
              name: "Disabled",
              inherited: [],
              order: 0,
              checked: false,
              disabled: false,
            },
          ],
        },
      ],
    },
  },
};

export const Default: Story = {
  parameters: {
    apolloClient: {
      mocks: [mockWithData],
    },
  },
};

export const Readonly: Story = {
  args: {
    readOnly: true,
  },
  parameters: {
    apolloClient: {
      mocks: [mockWithData],
    },
  },
};

const mockWithNoData: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
  request: {
    query: RETRIEVE_PBAC_DEFAULTS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      retrievePBACDefaults: [],
    },
  },
};

export const NoOptions: Story = {
  args: {},
  parameters: {
    apolloClient: {
      mocks: [mockWithNoData],
    },
  },
};
