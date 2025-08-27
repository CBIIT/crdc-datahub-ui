import { Button, ButtonProps, Stack, styled, Typography } from "@mui/material";
import { useState } from "react";

import ImportIconSvg from "@/assets/icons/import_icon.svg?react";
import config from "@/config/SectionConfig";
import useFormMode from "@/hooks/useFormMode";
import { Logger } from "@/utils";

import { useAuthContext } from "../Contexts/AuthContext";
import { useFormContext } from "../Contexts/FormContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

import ImportDialog from "./ImportDialog";

const StyledImportIcon = styled(ImportIconSvg)({
  width: "27px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "16px",
  color: "currentColor",
});

const StyledText = styled(Typography)({
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  letterSpacing: "-0.25px",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "150%",
  color: "inherit",
  paddingLeft: "14px",
});

const StyledStack = styled(Stack)({
  margin: "0 !important",
  width: "100%",
});

const StyledImportButton = styled(Button)({
  justifyContent: "flex-start",
  padding: "12px 14px",
  marginRight: "auto",
  color: "#136071",
  "&:hover": {
    color: "#00819E",
    background: "transparent",
  },
  "&.Mui-disabled": {
    color: "#BBBBBB",
    opacity: 1,
  },
  "& .MuiButton-startIcon": {
    marginRight: "0px !important",
  },
});

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

type Props = {
  /**
   * The active section of the form.
   */
  activeSection?: string;
} & Omit<ButtonProps, "onClick">;

/**
 * ImportApplicationButton component for handling the import of application data
 * from an Excel file.
 *
 * @param param Props for the button component.
 * @returns JSX.Element
 */
const ImportApplicationButton = ({ activeSection, disabled = false, ...rest }: Props) => {
  const { user } = useAuthContext();
  const { data, setData } = useFormContext();
  const { readOnlyInputs } = useFormMode();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const isFormOwner = user?._id === data?.applicant?.applicantID;
  const isReviewSection = activeSection?.toUpperCase() === config.REVIEW.id.toUpperCase();
  const shouldDisable =
    disabled ||
    disableImportStatuses.includes(data?.status) ||
    readOnlyInputs ||
    !isFormOwner ||
    isReviewSection;

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

    await setData(newData as QuestionnaireData, { skipSave: true });

    setOpenDialog(false);
    setIsUploading(false);
  };

  return (
    <>
      <StyledStack direction="row" alignItems="center" justifyContent="center">
        <StyledImportButton
          variant="text"
          onClick={onImportClick}
          disabled={shouldDisable}
          startIcon={<StyledImportIcon />}
          aria-label="Import application from Excel button"
          data-testid="import-application-excel-button"
          disableTouchRipple
          {...rest}
        >
          <StyledTooltip
            title="Import the Submission Request from Excel."
            placement="top"
            data-testid="import-application-excel-tooltip"
            disableInteractive
            arrow
          >
            <StyledText variant="body2" data-testid="import-application-excel-tooltip-text">
              Import Form
            </StyledText>
          </StyledTooltip>
        </StyledImportButton>
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
