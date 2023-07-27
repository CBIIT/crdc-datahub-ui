import React, { FC } from "react";
import { Grid, styled } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import AddRemoveButton from "./AddRemoveButton";

const GridContainer = styled(Grid)(() => ({
  border: "0.5px solid #DCDCDC !important",
  borderRadius: "10px",
  padding: "18px 15px",
}));

type Props = {
  idPrefix?: string;
  index: number;
  repository: Repository | null;
  readOnly?: boolean;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const Repository: FC<Props> = ({
  idPrefix = "",
  index,
  repository,
  readOnly,
  onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { name, studyID, submittedDate } = repository;

  return (
    <GridContainer container>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          id={idPrefix.concat(`repository-${index}-name`)}
          label="Repository name"
          name={`study[repositories][${index}][name]`}
          value={name}
          placeholder="Enter Repository Name"
          maxLength={50}
          gridWidth={12}
          required
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`repository-${index}-study-id`)}
          label="Repository Study ID"
          name={`study[repositories][${index}][studyID]`}
          value={studyID}
          placeholder="Enter ID"
          maxLength={50}
          gridWidth={6}
          required
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`repository-${index}-date-submitted`)}
          label="Date submitted"
          name={`study[repositories][${index}][submittedDate]`}
          value={submittedDate}
          placeholder="Enter date"
          maxLength={50}
          gridWidth={6}
          required
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          id={idPrefix.concat(`repository-${index}-remove-repository-button`)}
          label="Remove Repository"
          placement="start"
          onClick={onDelete}
          startIcon={<RemoveCircleIcon />}
          iconColor="#F18E8E"
          disabled={readOnly || status === FormStatus.SAVING}
        />
      </Grid>
    </GridContainer>
  );
};

export default Repository;
