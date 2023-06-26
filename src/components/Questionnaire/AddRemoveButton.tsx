import { Button, ButtonProps, Stack, StackProps, styled } from "@mui/material";
import { FC } from "react";

const ActionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "textColor" && prop !== "iconColor"
})<Props>`
  font-weight: 700;
  font-size: 15px;
  font-family: 'Nunito', 'Rubik', sans-serif;
  line-height: 16px;
  color: ${(props) => props.textColor ?? "#000000"};
  padding: 0;
  justify-content: end;
  min-width: 143px;
  border: none !important;
  background: transparent;
  text-transform: none;
  & .MuiButton-startIcon {
    color: ${(props) => props.iconColor ?? "#6EC882"};
    margin-right: 4px;
    & svg {
      font-size: 23px;
    }
  }
`;

type Props = ButtonProps & {
  label?: string;
  placement?: StackProps["justifyContent"];
  iconColor?: string;
  textColor?: string;
};

const AddRemoveButton: FC<Props> = ({
  label,
  placement = "end",
  ...rest
}) => (
  <Stack direction="row" justifyContent={placement} alignItems="center">
    <ActionButton
      variant="outlined"
      type="button"
      size="small"
      {...rest}
    >
      {label}
    </ActionButton>
  </Stack>
);

export default AddRemoveButton;
