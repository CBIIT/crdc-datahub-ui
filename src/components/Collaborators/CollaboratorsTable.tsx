import React from "react";
import {
  FormControlLabel,
  IconButton,
  MenuItem,
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
import { isEqual } from "lodash";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";
import { TOOLTIP_TEXT } from "../../config/DashboardTooltips";
import StyledFormRadioButton from "../Questionnaire/StyledRadioButton";
import { ReactComponent as RemoveIconSvg } from "../../assets/icons/remove_icon.svg";
import AddRemoveButton from "../Questionnaire/AddRemoveButton";
import TruncatedText from "../TruncatedText";
import StyledFormSelect from "../StyledFormComponents/StyledSelect";
import SuspenseLoader from "../SuspenseLoader";
import useCollaborators from "./hooks/useCollaborators";
import { Status, useAuthContext } from "../Contexts/AuthContext";
import { canModifyCollaboratorsRoles } from "../../config/AuthRoles";

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
    lineHeight: "14px",
    padding: "5px 12px",
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
      "& .MuiOutlinedInput-notchedOutline": {
        borderBottomLeftRadius: "8px",
      },
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

const StyledNameCell = styled(StyledTableCell)({
  "&.MuiTableCell-root": {
    padding: 0,
  },
});

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
  gap: "14px",
  "& .MuiFormControlLabel-root": {
    margin: 0,
  },
  "& .MuiFormControlLabel-asterisk": {
    display: "none",
  },
});

const StyledRadioButton = styled(StyledFormRadioButton)({
  padding: "0 7px 0 0",
});

const StyledRemoveButton = styled(IconButton)({
  color: "#C05239",
  padding: "5px",
});

const StyledSelect = styled(StyledFormSelect)({
  "&.MuiInputBase-root": {
    paddingTop: 0,
    paddingBottom: 0,
  },
  "& .MuiInputBase-input": {
    lineHeight: "20px",
    paddingTop: "9px",
    paddingBottom: "9px",
    height: "100%",
    borderRadius: 0,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "0 !important",
    boxShadow: "none",
    borderRadius: 0,
  },
  "& .MuiSelect-nativeInput": {
    padding: 0,
  },
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
  potentialCollaborators: Pick<User, "_id" | "firstName" | "lastName" | "organization">[];
  loading?: boolean;
  onCollaboratorsChange: (
    collaborators: Pick<Collaborator, "collaboratorID" | "permission">[]
  ) => void;
};

const CollaboratorsTable = ({
  collaborators,
  potentialCollaborators,
  loading,
  onCollaboratorsChange,
}: Props) => {
  const {
    currentCollaborators,
    remainingPotentialCollaborators,
    handleAddCollaborator,
    handleRemoveCollaborator,
    handleUpdateCollaborator,
  } = useCollaborators({ collaborators, potentialCollaborators, onCollaboratorsChange });
  const { user, status } = useAuthContext();

  if (loading || status === Status.LOADING) {
    return <SuspenseLoader fullscreen={false} data-testid="collaborators-table-suspense-loader" />;
  }

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
              {canModifyCollaboratorsRoles.includes(user?.role) && (
                <StyledTableHeaderCell sx={{ textAlign: "center" }}>Remove</StyledTableHeaderCell>
              )}
            </StyledTableHeaderRow>
          </TableHead>
          <TableBody>
            {currentCollaborators?.map((collaborator, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <StyledTableRow key={`collaborator_${idx}`}>
                <StyledNameCell width="24.8%">
                  <StyledSelect
                    value={collaborator.collaboratorID || ""}
                    onChange={(e) =>
                      handleUpdateCollaborator(idx, {
                        collaboratorID: e?.target?.value as string,
                        permission: collaborator.permission,
                      })
                    }
                    autoFocus
                    MenuProps={{ disablePortal: true }}
                    renderValue={(val: string) => {
                      if (!val) {
                        return "";
                      }

                      return (
                        <TruncatedText
                          text={collaborator.collaboratorName ?? " "}
                          maxCharacters={10}
                          underline={false}
                          ellipsis
                        />
                      );
                    }}
                    required
                  >
                    {[collaborator, ...remainingPotentialCollaborators]
                      ?.filter((collaborator) => !!collaborator?.collaboratorID)
                      ?.sort((a, b) => a.collaboratorName?.localeCompare(b.collaboratorName))
                      ?.map((pc) => (
                        <MenuItem key={pc.collaboratorID} value={pc.collaboratorID} hidden>
                          {pc.collaboratorName}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                </StyledNameCell>
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
                      value={collaborator?.permission || ""}
                      onChange={(e, val: CollaboratorPermissions) =>
                        handleUpdateCollaborator(idx, {
                          collaboratorID: collaborator?.collaboratorID,
                          permission: val,
                        })
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
                          control={<StyledRadioButton readOnly={false} required />}
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
                          control={<StyledRadioButton readOnly={false} required />}
                          label="Can Edit"
                        />
                      </CustomTooltip>
                    </StyledRadioGroup>
                  </Stack>
                </StyledTableCell>
                {canModifyCollaboratorsRoles.includes(user?.role) && (
                  <StyledTableCell width="13.44%">
                    <Stack direction="row" justifyContent="center" alignItems="center">
                      <StyledRemoveButton
                        onClick={() => handleRemoveCollaborator(idx)}
                        aria-label="Remove row"
                      >
                        <RemoveIconSvg />
                      </StyledRemoveButton>
                    </Stack>
                  </StyledTableCell>
                )}
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
        disabled={currentCollaborators?.length === potentialCollaborators?.length}
      />
    </>
  );
};

export default React.memo(CollaboratorsTable, isEqual);
