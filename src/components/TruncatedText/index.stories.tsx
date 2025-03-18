import type { Meta, StoryObj } from "@storybook/react";
import TruncatedText from "./index";

const meta: Meta<typeof TruncatedText> = {
  title: "Miscellaneous / TruncatedText",
  component: TruncatedText,
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt",
    maxCharacters: 20,
    underline: true,
    ellipsis: true,
    disableInteractiveTooltip: true,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TruncatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {},
};

export const BooleanValue: Story = {
  name: "Boolean",
  args: {
    ...meta.args,
    text: true,
  },
  argTypes: {
    text: {
      control: {
        type: "boolean",
      },
    },
  },
};

export const NumberValue: Story = {
  name: "Numeric",
  args: {
    ...meta.args,
    text: 1234567890,
  },
  argTypes: {
    text: {
      control: {
        type: "number",
      },
    },
  },
};

export const ObjectValue: Story = {
  name: "Object",
  args: {
    ...meta.args,
    maxCharacters: 999,
    text: {
      name: "John Doe",
      age: 30,
      city: "New York",
    },
  },
  argTypes: {
    text: {
      control: {
        type: "object",
      },
    },
  },
};

export const ArrayValue: Story = {
  name: "Array",
  args: {
    ...meta.args,
    maxCharacters: 999,
    text: ["hello", "world", "this", "is", "an", "array"],
  },
  argTypes: {
    text: {
      control: {
        type: "object",
      },
    },
  },
};
