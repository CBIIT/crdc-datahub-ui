import { Button, ButtonProps, Stack, StackProps } from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import { FC } from "react";

type Props = ButtonProps & {
  label: string;
  placement?: StackProps["justifyContent"];
  classes: WithStyles<typeof styles>["classes"];
};

const AddRemoveButton: FC<Props> = ({
  label,
  placement = "start",
  classes,
  ...rest
}) => (
  <Stack direction="row" justifyContent={placement} alignItems="center">
    <Button
      variant="outlined"
      type="button"
      size="small"
      {...rest}
      className={`${classes.button} ${rest.className}`}
    >
      {label}
    </Button>
  </Stack>
);

const styles = () => ({
  button: {
    fontWeight: 700,
    fontSize: "15px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "16px",
    color: "#000000",
    padding: 0,
    justifyContent: "end",
    minWidth: "143px",
    border: "none !important",
    background: "transparent",
    "text-transform": "none",
    "& .MuiButton-startIcon": {
      color: "#6EC882",
      marginRight: "4px",
      "& svg": {
        fontSize: "23px",
      },
    },
  },
});

export default withStyles(styles)(AddRemoveButton);
