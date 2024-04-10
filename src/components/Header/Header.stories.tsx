import type { Meta, StoryObj } from "@storybook/react";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import Header from "./index";

const meta = {
  title: "General / Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{ isLoggedIn: false } as AuthCtxState}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const GeneralUser: Story = {
  args: {},
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={
          { isLoggedIn: true, user: { firstName: "Example", role: "User" } as User } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const Submitter: Story = {
  args: {},
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: { firstName: "Example", role: "Submitter" } as User,
          } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const Admin: Story = {
  args: {},
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: { firstName: "Example", role: "Admin" } as User,
          } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};
