import React, { FC } from "react";
import { Grid } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { WithStyles, withStyles } from "@mui/styles";
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import AddRemoveButton from "./AddRemoveButton";
import DatePickerInput from "./DatePickerInput";

type Props = {
  index: number;
  classes: WithStyles<typeof styles>["classes"];
  plannedPublication: PlannedPublication | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const PlannedPublication: FC<Props> = ({
  index,
  classes,
  plannedPublication,
  onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { title, expectedDate } = plannedPublication;

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          label="Planned Publication Title"
          name={`plannedPublications[${index}][title]`}
          value={title}
          placeholder="Enter title"
          maxLength={100}
          gridWidth={12}
          required
        />
        <DatePickerInput
          label="Expected Publication Date"
          name={`plannedPublications[${index}][expectedDate]`}
          initialValue={expectedDate}
          gridWidth={6}
          required
          tooltipText="Data made available for secondary research only
                      after investigators have obtained approval from
                      NIH to use the requested data for a particular
                      project"
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          label="Remove Planned Publication"
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

export default withStyles(styles)(PlannedPublication);
