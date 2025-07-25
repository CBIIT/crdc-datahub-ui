import AddCircleIcon from "@mui/icons-material/AddCircle";
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
} from "@mui/material";
import { isEqual } from "lodash";
import React from "react";

import RemoveIconSvg from "../../assets/icons/remove_icon.svg?react";
import { TOOLTIP_TEXT } from "../../config/DashboardTooltips";
import AddRemoveButton from "../AddRemoveButton";
import { useCollaboratorsContext } from "../Contexts/CollaboratorsContext";
import StyledFormRadioButton from "../Questionnaire/StyledRadioButton";
import StyledFormSelect from "../StyledFormComponents/StyledSelect";
import TruncatedText from "../TruncatedText";

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #6B7294",
  overflow: "hidden",
  marginBottom: "15px",
}));

const FixedTable = styled(Table)({
  tableLayout: "fixed",
  width: "100%",
});

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
      "& .MuiOutlinedInput-notchedOutline, & .MuiSelect-select": {
        borderBottomLeftRadius: "8px !important",
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
    "&.Mui-disabled": {
      cursor: "not-allowed",
    },
  },
  "& .MuiFormControlLabel-asterisk": {
    display: "none",
  },
  "& .MuiSelect-select .notranslate": {
    display: "inline-block",
    minHeight: "38px",
  },
  "& .MuiRadio-root.Mui-disabled .radio-icon": {
    background: "#FFF !important",
    opacity: 0.4,
  },
});

const StyledRadioButton = styled(StyledFormRadioButton)({
  padding: "0 7px 0 0",
});

const StyledRemoveButton = styled(IconButton)(({ theme }) => ({
  color: "#C05239",
  padding: "5px",
  "&.Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
  },
}));

const StyledSelect = styled(StyledFormSelect)({
  "&.MuiInputBase-root": {
    paddingTop: 0,
    paddingBottom: 0,
    display: "block",
  },
  "& .MuiInputBase-input": {
    minHeight: "38px !important",
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
  "& .Mui-readOnly.MuiOutlinedInput-input:read-only": {
    borderRadius: 0,
  },
});

type Props = {
  /**
   * Indicates whether the table will allow edititing of collaborators
   */
  isEdit: boolean;
};

const CollaboratorsTable = ({ isEdit }: Props) => {
  const {
    currentCollaborators,
    remainingPotentialCollaborators,
    maxCollaborators,
    handleAddCollaborator,
    handleRemoveCollaborator,
    handleUpdateCollaborator,
    loading,
  } = useCollaboratorsContext();

  return (
    <>
      <StyledTableContainer data-testid="collaborators-table-container">
        <FixedTable>
          <colgroup>
            <col style={{ width: isEdit ? "47%" : "50%" }} />
            <col style={{ width: isEdit ? "40%" : "50%" }} />
            {isEdit && <col style={{ width: "13%" }} />}
          </colgroup>

          <TableHead>
            <StyledTableHeaderRow data-testid="table-header-row">
              <StyledTableHeaderCell id="header-collaborator" data-testid="header-collaborator">
                Collaborator
              </StyledTableHeaderCell>
              <StyledTableHeaderCell
                id="header-access"
                sx={{ textAlign: "center" }}
                data-testid="header-access"
              >
                Access
              </StyledTableHeaderCell>

              {isEdit && (
                <StyledTableHeaderCell
                  id="header-remove"
                  sx={{ textAlign: "center" }}
                  data-testid="header-remove"
                >
                  Remove
                </StyledTableHeaderCell>
              )}
            </StyledTableHeaderRow>
          </TableHead>
          <TableBody>
            {currentCollaborators?.map((collaborator, idx) => (
              <StyledTableRow
                // eslint-disable-next-line react/no-array-index-key
                key={`collaborator_${idx}_${collaborator.collaboratorID}`}
                data-testid={`collaborator-row-${idx}`}
              >
                <StyledNameCell>
                  <StyledSelect
                    value={collaborator.collaboratorID || ""}
                    onChange={(e) =>
                      handleUpdateCollaborator(idx, {
                        collaboratorID: e?.target?.value as string,
                        permission: collaborator.permission,
                      })
                    }
                    autoFocus={isEdit}
                    placeholderText="Select Name"
                    MenuProps={{ disablePortal: true }}
                    data-testid={`collaborator-select-${idx}`}
                    inputProps={{
                      "data-testid": `collaborator-select-${idx}-input`,
                      "aria-labelledby": "header-collaborator",
                    }}
                    renderValue={() => (
                      <TruncatedText
                        text={collaborator.collaboratorName ?? " "}
                        maxCharacters={20}
                        underline={false}
                        ellipsis
                      />
                    )}
                    readOnly={loading || !isEdit}
                    required={currentCollaborators?.length > 1}
                    aria-label="Collaborator dropdown"
                  >
                    {[collaborator, ...remainingPotentialCollaborators]
                      ?.filter((collaborator) => !!collaborator?.collaboratorID)
                      ?.sort((a, b) => a.collaboratorName?.localeCompare(b.collaboratorName))
                      ?.map((c) => (
                        <MenuItem key={c.collaboratorID} value={c.collaboratorID}>
                          {c.collaboratorName}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                </StyledNameCell>

                <StyledTableCell data-testid={`collaborator-access-${idx}`}>
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <StyledRadioGroup
                      value={collaborator?.permission || ""}
                      onChange={(e, val: CollaboratorPermissions) =>
                        handleUpdateCollaborator(idx, {
                          collaboratorID: collaborator?.collaboratorID,
                          permission: val,
                        })
                      }
                      data-testid={`collaborator-permissions-${idx}`}
                      aria-labelledby="header-access"
                      row
                    >
                      <StyledRadioControl
                        value="Can Edit"
                        control={
                          <StyledRadioButton
                            readOnly={loading || !isEdit}
                            disabled={loading || !isEdit}
                            required
                          />
                        }
                        label="Can Edit"
                      />

                      <StyledRadioControl
                        value="No Access"
                        control={
                          <StyledRadioButton
                            readOnly={loading || !isEdit}
                            disabled={loading || !isEdit}
                            required
                          />
                        }
                        label="No Access"
                      />
                    </StyledRadioGroup>
                  </Stack>
                </StyledTableCell>

                {isEdit && (
                  <StyledTableCell>
                    <Stack direction="row" justifyContent="center" alignItems="center">
                      <StyledRemoveButton
                        onClick={() => handleRemoveCollaborator(idx)}
                        disabled={loading}
                        data-testid={`remove-collaborator-button-${idx}`}
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
        </FixedTable>
      </StyledTableContainer>

      <AddRemoveButton
        id="add-collaborator-button"
        label="Add Collaborator"
        placement="start"
        startIcon={<AddCircleIcon />}
        onClick={handleAddCollaborator}
        disabled={loading || !isEdit || currentCollaborators?.length >= maxCollaborators}
        aria-label="Add Collaborator"
        tooltipProps={{
          placement: "top",
          title: TOOLTIP_TEXT.COLLABORATORS_DIALOG.ACTIONS.ADD_COLLABORATOR_DISABLED,
          disableHoverListener: isEdit && currentCollaborators?.length < maxCollaborators,
          disableInteractive: true,
        }}
        data-testid="add-collaborator-button"
      />
    </>
  );
};

export default React.memo(CollaboratorsTable, isEqual);
