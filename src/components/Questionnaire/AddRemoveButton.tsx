import { Button, ButtonProps, Stack, StackProps, styled } from "@mui/material";
import { FC } from "react";

const ActionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "textColor" && prop !== "iconColor",
})<Props>`
  font-weight: 700;
  font-size: 15px;
  font-family: "Nunito", "Rubik", sans-serif;
  line-height: 16px;
  color: ${(props) => props.textColor ?? "#000000"};
  padding: 0;
  justify-content: end;
  min-width: 143px;
  border: none !important;
  background: transparent;
  text-transform: none;
  &.Mui-disabled {
    cursor: not-allowed;
    pointer-events: auto;
  }
  & .MuiButton-startIcon {
    color: ${(props) => props.iconColor ?? "#44A759"};
    margin-right: 4px;
    & svg {
      font-size: 23px;
    }
  }
  &:hover {
    background: none;
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
  disabled,
  onClick,
  ...rest
}) => {
  const onClickWrapper = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (disabled) {
      return;
    }
    if (typeof onClick === "function") {
      onClick(event);
    }
  };

  return (
    <Stack direction="row" justifyContent={placement} alignItems="center">
      <ActionButton
        variant="outlined"
        type="button"
        size="small"
        onClick={onClickWrapper}
        disableRipple
        disabled={disabled}
        {...rest}
      >
        {label}
      </ActionButton>
    </Stack>
  );
};

export default AddRemoveButton;
