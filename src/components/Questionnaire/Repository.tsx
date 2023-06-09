import React, { FC } from "react";
import { Button, Grid, Stack } from "@mui/material";
import LabelOffIcon from '@mui/icons-material/LabelOff';
import { WithStyles, withStyles } from "@mui/styles";
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";

type Props = {
  index: number;
  classes: WithStyles<typeof styles>["classes"];
  repository: Repository | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const Repository: FC<Props> = ({
  index, classes, repository, onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { name, studyID } = repository;

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={6}>
        <TextInput
          label="Repository name"
          name={`study[repositories][${index}][name]`}
          value={name}
          maxLength={50}
          gridWidth={12}
          required
        />
        <TextInput
          label="Repository study ID"
          name={`study[repositories][${index}][studyID]`}
          value={studyID}
          maxLength={50}
          gridWidth={12}
          required
        />
      </Grid>
      <Grid item xs={6}>
        <Stack direction="row" justifyContent="end">
          <Button
            variant="outlined"
            type="button"
            onClick={onDelete}
            size="large"
            startIcon={<LabelOffIcon />}
            className={classes.button}
            disabled={status === FormStatus.SAVING}
          >
            Remove Repository
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

const styles = () => ({
  root: {
    border: "0.5px solid #346798",
    borderRadius: "8px",
    padding: "20px 30px",
    marginTop: "20px",
    marginLeft: "37px",
    marginRight: "-27px",
  },
  button: {
    color: "#346798",
    marginLeft: "auto",
    marginTop: "28px",
    marginRight: "-4px",
    padding: "6px 20px",
    minWidth: "115px",
    borderRadius: "25px",
    border: "2px solid #AFC2D8 !important",
    background: "transparent",
    "text-transform": "none",
    "& .MuiButton-startIcon": {
      marginRight: "14px",
    },
  },
});

export default withStyles(styles)(Repository);
