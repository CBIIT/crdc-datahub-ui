import React, { FC } from "react";
import { Button, Grid, Stack } from "@mui/material";
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { WithStyles, withStyles } from "@mui/styles";
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";

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
  index, classes, publication, onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { title, pubmedID, DOI } = publication;

  return (
    <Grid container className={classes.root}>
      <Grid container item md={8} xs={12}>
        <TextInput
          label="Publication title"
          name={`publications[${index}][title]`}
          value={title}
          maxLength={100}
          gridWidth={12}
          required
        />
        <TextInput
          label="PubMedID"
          name={`publications[${index}][pubmedID]`}
          value={pubmedID}
          maxLength={20}
        />
        <TextInput
          label="DOI"
          name={`publications[${index}][DOI]`}
          value={DOI}
          maxLength={20}
          classes={{ root: classes.lastInput }}
        />
      </Grid>
      <Grid item md={4} xs={12}>
        <Stack direction="row" justifyContent="end">
          <Button
            variant="outlined"
            type="button"
            onClick={onDelete}
            size="large"
            startIcon={<BookmarkRemoveIcon />}
            className={classes.button}
            disabled={status === FormStatus.SAVING}
          >
            Remove Publication
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
  lastInput: {
    maxWidth: "250px",
    marginLeft: "auto",
  },
});

export default withStyles(styles)(Publication);
