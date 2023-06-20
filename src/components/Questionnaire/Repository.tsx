import React, { FC } from "react";
import { Grid } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { WithStyles, withStyles } from "@mui/styles";
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import AddRemoveButton from "./AddRemoveButton";

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
  index,
  classes,
  repository,
  onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { name, studyID } = repository;

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          label="Repository name"
          name={`study[repositories][${index}][name]`}
          value={name}
          placeholder="Enter Repository Name"
          maxLength={50}
          gridWidth={12}
          required
        />
        <TextInput
          label="Repository Study ID"
          name={`study[repositories][${index}][studyID]`}
          value={studyID}
          placeholder="Enter ID"
          maxLength={50}
          gridWidth={6}
          required
        />
        <TextInput
          label="Date submitted"
          name={`study[repositories][${index}][dateSubmitted]`}
          value={studyID}
          placeholder="Enter date"
          maxLength={50}
          gridWidth={6}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          label="Remove Repository"
          variant="outlined"
          type="button"
          onClick={onDelete}
          className={classes.button}
          startIcon={<RemoveCircleIcon />}
          disabled={status === FormStatus.SAVING}
        />
      </Grid>
    </Grid>
  );
};

const styles = () => ({
  root: {
    border: "0.5px solid #DCDCDC",
    borderRadius: "10px",
    padding: "18px 15px",
    marginLeft: "12px",
  },
  button: {
    "& .MuiButton-startIcon": {
      color: "#F18E8E",
    },
  },
});

export default withStyles(styles)(Repository);
