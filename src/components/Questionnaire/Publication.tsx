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
  publication: Publication | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const Publication: FC<Props> = ({
  index,
  classes,
  publication,
  onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { title, pubmedID, DOI } = publication;

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          label="Publication Title"
          name={`publications[${index}][title]`}
          value={title}
          placeholder="Enter Publication Title"
          maxLength={100}
          gridWidth={12}
          required
        />
        <TextInput
          label="PubMedID"
          name={`publications[${index}][pubmedID]`}
          value={pubmedID}
          placeholder="Enter ID"
          maxLength={20}
          gridWidth={6}
        />
        <TextInput
          label="DOI"
          name={`publications[${index}][DOI]`}
          value={DOI}
          placeholder="Enter DOI"
          maxLength={20}
          gridWidth={6}
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          label="Remove Publication"
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
  lastInput: {
    maxWidth: "250px",
    marginLeft: "auto",
  },
});

export default withStyles(styles)(Publication);
