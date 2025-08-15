import { Box, Button, ButtonProps, Stack, styled, Typography, useTheme } from "@mui/material";
import { useState } from "react";

import ImportIconSvg from "@/assets/icons/import_icon.svg?react";
import useFormMode from "@/hooks/useFormMode";
import { Logger } from "@/utils";

import { useFormContext } from "../Contexts/FormContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

import ImportDialog from "./ImportDialog";

const StyledIconWrapper = styled(Box)({
  width: "27px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "16px",
  color: "#136071",
});

const StyledText = styled(Typography)({
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  letterSpacing: "-0.25px",
  fontWeight: 600,
  fontSize: "16px",
  color: "#136071",
  lineHeight: "150%",

  "&:hover": {
    color: "#00819E",
  },
});

const StyledStack = styled(Stack)({
  margin: "0 !important",
  width: "100%",
});

const StyledImportExportButton = styled(Button)(({ theme }) => ({
  justifyContent: "flex-start",
  padding: "12px 14px",
  marginRight: "auto",

  "&:hover": {
    background: "transparent",
  },
  "&.Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
  },
}));

const StyledTooltip = styled(StyledFormTooltip)({
  marginLeft: "0 !important",
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

const disableImportStatuses: ApplicationStatus[] = [
  "Submitted",
  "Approved",
  "Rejected",
  "Canceled",
  "Deleted",
];

type Props = Omit<ButtonProps, "onClick">;

/**
 * ImportApplicationButton component for handling the import of application data
 * from an Excel file.
 *
 * @param param Props for the button component.
 * @returns JSX.Element
 */
const ImportApplicationButton = ({ disabled = false }: Props) => {
  const { palette } = useTheme();
  const { data, setData } = useFormContext();
  const { readOnlyInputs } = useFormMode();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const shouldDisable = disabled || disableImportStatuses.includes(data?.status) || readOnlyInputs;

  /**
   * Triggers the file input dialog.
   *
   * @returns void
   */
  const onImportClick = () => {
    if (shouldDisable) {
      return;
    }

    setOpenDialog(true);
  };

  /**
   * Handles the import of the selected file and uses middleware
   * to parse only the valid values from the Excel file. Finally,
   * it updates the form data to the new imported data.
   *
   * @param file The file to import.
   * @returns void
   */
  const handleImport = async (file: File) => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    const { QuestionnaireExcelMiddleware } = await import("@/classes/QuestionnaireExcelMiddleware");

    // Add the file back to a FileList
    const dataTransfer = new DataTransfer();
    dataTransfer?.items?.add(file);

    const dataTransferFile = dataTransfer?.files?.[0];
    if (typeof dataTransferFile?.arrayBuffer !== "function") {
      Logger.error(
        `ImportApplicationButton: File does not have arrayBuffer method`,
        dataTransferFile
      );
      return;
    }

    const newData = await QuestionnaireExcelMiddleware.parse(
      await dataTransferFile?.arrayBuffer(),
      {
        application: data,
      }
    );

    setData(newData);
    setOpenDialog(false);
    setIsUploading(false);
  };

  return (
    <>
      <StyledStack direction="row" alignItems="center" justifyContent="center">
        <StyledIconWrapper
          sx={{
            opacity: shouldDisable ? palette.action.disabledOpacity : 1,
          }}
        >
          <ImportIconSvg />
        </StyledIconWrapper>

        <StyledImportExportButton
          variant="text"
          onClick={onImportClick}
          disabled={shouldDisable}
          aria-label="Import application from Excel button"
          data-testid="import-application-excel-button"
        >
          <StyledTooltip
            title="Import the Submission Request from Excel."
            placement="top"
            data-testid="import-application-excel-tooltip"
            disableInteractive
            arrow
          >
            <StyledText variant="body2" data-testid="import-application-excel-tooltip-text">
              Import
            </StyledText>
          </StyledTooltip>
        </StyledImportExportButton>
      </StyledStack>

      <ImportDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleImport}
        disabled={isUploading}
      />
    </>
  );
};

export default ImportApplicationButton;
