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
  index: number;
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
  publication,
  onDelete,
}: Props) => {
  const { status } = useFormContext();

  const { title, pubmedID, DOI } = publication;

  return (
    <GridContainer container>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          label="Publication Title"
          name={`study[publications][${index}][title]`}
          value={title}
          placeholder="Enter Publication Title"
          maxLength={100}
          gridWidth={12}
          required
        />
        <TextInput
          label="PubMedID"
          name={`study[publications][${index}][pubmedID]`}
          value={pubmedID}
          placeholder="Enter ID"
          maxLength={20}
          gridWidth={6}
        />
        <TextInput
          label="DOI"
          name={`study[publications][${index}][DOI]`}
          value={DOI}
          placeholder="Enter DOI"
          maxLength={20}
          gridWidth={6}
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          label="Remove Publication"
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

export default Publication;
