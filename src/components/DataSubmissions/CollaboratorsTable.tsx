import React, { useEffect, useState } from "react";
import {
  FormControlLabel,
  IconButton,
  RadioGroup,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TooltipProps,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { isEqual, uniqueId } from "lodash";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";
import { TOOLTIP_TEXT } from "../../config/DashboardTooltips";
import StyledFormRadioButton from "../Questionnaire/StyledRadioButton";
import { ReactComponent as RemoveIconSvg } from "../../assets/icons/remove_icon.svg";
import AddRemoveButton from "../Questionnaire/AddRemoveButton";
import TruncatedText from "../TruncatedText";

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #6B7294",
  overflow: "hidden",
  marginBottom: "15px",
}));

const StyledTableHeaderRow = styled(TableRow)(() => ({
  "&.MuiTableRow-root": {
    height: "38px",
    padding: 0,
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFF",
    borderBottom: "1px solid #6B7294",
  },
}));

const StyledTableHeaderCell = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    height: "100%",
    color: "#083A50",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "16px",
    padding: "11px 12px",
    borderBottom: "0 !important",
    borderRight: "1px solid #6B7294",
    "&:last-child": {
      borderRight: "none",
    },
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&.MuiTableRow-root": {
    height: "38px",
    padding: 0,
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFF",
    borderBottom: "1px solid #6B7294",
    "&:last-child": {
      borderBottom: "none",
    },
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    height: "100%",
    color: "#083A50",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "16px",
    padding: "4px 12px",
    borderBottom: "0 !important",
    borderRight: "1px solid #6B7294",
    "&:last-child": {
      borderRight: "none",
    },
  },
}));

const StyledRadioControl = styled(FormControlLabel)({
  fontFamily: "Nunito",
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "20px",
  textAlign: "left",
  color: "#083A50",
  "&:last-child": {
    marginRight: "0px",
    minWidth: "unset",
  },
});

const StyledRadioGroup = styled(RadioGroup)({
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const StyledRadioButton = styled(StyledFormRadioButton)({
  padding: "0 7px 0 0",
});

const StyledRemoveButton = styled(IconButton)({
  color: "#C05239",
  padding: "5px",
});

const CustomTooltip = (props: TooltipProps) => (
  <StyledTooltip
    {...props}
    slotProps={{
      popper: {
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -2],
            },
          },
        ],
      },
    }}
  />
);

type Props = {
  collaborators: Collaborator[];
  potentialCollaborators: Pick<User, "_id" | "firstName" | "lastName">[];
};

const CollaboratorsTable = ({ collaborators, potentialCollaborators }: Props) => {
  const [currentCollaborators, setCurrentCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    setCurrentCollaborators(collaborators);
  }, [collaborators]);

  const createEmptyCollaborator = (): Collaborator => {
    // Add placeholder unique ID to easily identify row before collaborator is assigned
    const id = uniqueId("empty-collaborator-");
    return { collaboratorID: id } as Collaborator;
  };

  const handleAddCollaborator = () => {
    setCurrentCollaborators((prev) => [...prev, createEmptyCollaborator()]);
  };

  const handleRemoveCollaborator = (collaboratorID: string) => {
    setCurrentCollaborators((prev) => {
      const newCollaborators = prev?.filter(
        (collaborator) => collaborator.collaboratorID !== collaboratorID
      );

      // If no rows remain, leave an empty row
      if (!newCollaborators?.length) {
        return [createEmptyCollaborator()];
      }

      return newCollaborators;
    });
  };

  const handlePermissionChange = (collaboratorID: string, permission: CollaboratorPermissions) => {
    setCurrentCollaborators(
      (prev) =>
        prev?.map((collaborator) =>
          collaborator.collaboratorID === collaboratorID
            ? { ...collaborator, permission }
            : collaborator
        )
    );
  };

  return (
    <>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableHeaderRow>
              <StyledTableHeaderCell>Collaborator</StyledTableHeaderCell>
              <StyledTableHeaderCell>
                Collaborator <br />
                Organization
              </StyledTableHeaderCell>
              <StyledTableHeaderCell sx={{ textAlign: "center" }}>Access</StyledTableHeaderCell>
              <StyledTableHeaderCell sx={{ textAlign: "center" }}>Remove</StyledTableHeaderCell>
            </StyledTableHeaderRow>
          </TableHead>
          <TableBody>
            {currentCollaborators?.map((collaborator) => (
              <StyledTableRow key={collaborator?.collaboratorID}>
                <StyledTableCell width="24.8%">
                  <TruncatedText
                    text={collaborator?.collaboratorName}
                    maxCharacters={10}
                    underline={false}
                    ellipsis
                  />
                </StyledTableCell>
                <StyledTableCell width="24%">
                  <TruncatedText
                    text={collaborator?.Organization?.orgName}
                    maxCharacters={10}
                    underline={false}
                    ellipsis
                  />
                </StyledTableCell>
                <StyledTableCell width="37.76%">
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <StyledRadioGroup
                      value={collaborator?.permission}
                      onChange={(e, val: CollaboratorPermissions) =>
                        handlePermissionChange(collaborator?.collaboratorID, val)
                      }
                      data-testid="collaborator-permissions"
                      row
                    >
                      <CustomTooltip
                        placement="top"
                        title={TOOLTIP_TEXT.COLLABORATORS_DIALOG.PERMISSIONS.CAN_VIEW}
                        disableHoverListener={false}
                      >
                        <StyledRadioControl
                          value="Can View"
                          control={<StyledRadioButton readOnly={false} />}
                          label="Can View"
                        />
                      </CustomTooltip>
                      <CustomTooltip
                        placement="top"
                        title={TOOLTIP_TEXT.COLLABORATORS_DIALOG.PERMISSIONS.CAN_EDIT}
                        disableHoverListener={false}
                      >
                        <StyledRadioControl
                          value="Can Edit"
                          control={<StyledRadioButton readOnly={false} />}
                          label="Can Edit"
                        />
                      </CustomTooltip>
                    </StyledRadioGroup>
                  </Stack>
                </StyledTableCell>
                <StyledTableCell width="13.44%">
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <StyledRemoveButton
                      onClick={() => handleRemoveCollaborator(collaborator?.collaboratorID)}
                      aria-label="Remove row"
                    >
                      <RemoveIconSvg />
                    </StyledRemoveButton>
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      <AddRemoveButton
        id="add-collaborator-button"
        label="Add Collaborator"
        placement="start"
        startIcon={<AddCircleIcon />}
        onClick={handleAddCollaborator}
        disabled={false} // TODO: Fix
      />
    </>
  );
};

export default React.memo(CollaboratorsTable, isEqual);
