import React, { FC } from "react";
import { Grid, styled } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import AddRemoveButton from "./AddRemoveButton";
import TextInput from "./TextInput";
import DatePickerInput from "./DatePickerInput";

const GridContainer = styled(Grid)(() => ({
  border: "0.5px solid #DCDCDC !important",
  borderRadius: "10px",
  padding: "18px 15px",
}));

const StyledTextInput = styled(TextInput)(() => ({
  "&.MuiInputBase-multiline .MuiInputBase-input": {
    lineHeight: "17px !important",
  },
}));

type Props = {
  index: number;
  timeConstraint: TimeConstraint | null;
  onDelete: () => void;
};

const TimeConstraint: FC<Props> = ({
  index,
  timeConstraint,
  onDelete
}) => {
  const { status } = useFormContext();
  const { description, effectiveDate } = timeConstraint;

  return (
    <GridContainer container>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <StyledTextInput
          label="Time Constraint Description"
          name={`timeConstraints[${index}][description]`}
          value={description}
          gridWidth={12}
          maxLength={100}
          placeholder="100 characters allowed"
          minRows={2}
          multiline
          required
        />
        <DatePickerInput
          label="Time Constraint Effective Date"
          name={`timeConstraints[${index}][effectiveDate]`}
          initialValue={effectiveDate}
          required
          disablePast
          tooltipText="Date relating to this constraint"
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          label="Remove Time Constraint"
          placement="start"
          onClick={onDelete}
          startIcon={<RemoveCircleIcon />}
          iconColor="#F18E8E"
          disabled={status === FormStatus.SAVING}
        />
      </Grid>
    </GridContainer>
  );
};

export default TimeConstraint;
