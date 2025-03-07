import type { Meta, StoryObj } from "@storybook/react";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import Header from "./index";
import { Roles } from "../../config/AuthRoles";

const meta: Meta<typeof Header> = {
  title: "Navigation / Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

type Story = StoryObj<typeof meta>;

export const Unauthenticated: Story = {
  name: "Logged Out",
  args: {},
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{ isLoggedIn: false } as AuthCtxState}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const Authenticated: Story = {
  name: "Logged In",
  args: {
    role: "Submitter",
    permissions: [],
  },
  argTypes: {
    role: {
      name: "Role",
      options: Roles,
      control: {
        type: "radio",
      },
    },
    permissions: {
      name: "Permissions",
      options: ["user:manage", "program:manage", "study:manage", "dashboard:view"],
      control: {
        type: "check",
      },
    },
  },
  decorators: [
    (Story, context) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: {
              firstName: "Example",
              role: context.args.role,
              permissions: context.args.permissions,
            } as User,
          } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export default meta;
