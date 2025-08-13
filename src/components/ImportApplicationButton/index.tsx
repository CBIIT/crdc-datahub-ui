import { Box, Button, ButtonProps, Stack, styled, Typography, useTheme } from "@mui/material";
import { useRef, useState } from "react";

import ImportIconSvg from "@/assets/icons/import_icon.svg?react";
import useFormMode from "@/hooks/useFormMode";
import { Logger } from "@/utils";

import { useFormContext } from "../Contexts/FormContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

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

const VisuallyHiddenInput = styled("input")({
  display: "none !important",
});

const disableImportStatuses: ApplicationStatus[] = [
  "Submitted",
  "Approved",
  "Rejected",
  "Canceled",
  "Deleted",
];

type Props = Omit<ButtonProps, "onClick">;

const ImportApplicationButton = ({ disabled }: Props) => {
  const { palette } = useTheme();
  const { data } = useFormContext();
  const { readOnlyInputs } = useFormMode();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const acceptedExtensions = [".xlsx"];
  const shouldDisable =
    disabled || isUploading || disableImportStatuses.includes(data.status) || readOnlyInputs;

  const onImportClick = () => {
    if (shouldDisable) {
      return;
    }

    uploadInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { QuestionnaireExcelMiddleware } = await import("@/classes/QuestionnaireExcelMiddleware");

    const { files } = event?.target || {};
    const file = files?.[0];

    if (!file) {
      Logger.error(`ImportApplicationButton: No file selected`);
      return;
    }

    const isCorrectFormat = acceptedExtensions.some(
      (ext) => file.name?.toLowerCase()?.endsWith(ext)
    );
    if (!isCorrectFormat) {
      Logger.error(`ImportApplicationButton: Unsupported file format`);
      return;
    }

    setIsUploading(true);

    // Add the file back to a FileList
    const dataTransfer = new DataTransfer();
    dataTransfer?.items?.add(file);

    // TODO: Set the form data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const middleware = await QuestionnaireExcelMiddleware.parse(
      await dataTransfer?.files?.[0]?.arrayBuffer(),
      {
        application: data,
      }
    );

    // setData(middleware.data);
    // TODO: Reset validity for each form section

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

        <VisuallyHiddenInput
          ref={uploadInputRef}
          type="file"
          accept={acceptedExtensions.toString()}
          data-testid="import-upload-file-input"
          aria-label="Upload application template"
          onChange={handleImport}
          readOnly={disabled}
        />

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
            <StyledText variant="body2">Import</StyledText>
          </StyledTooltip>
        </StyledImportExportButton>
      </StyledStack>

      {/* TODO: Add import dialog */}
    </>
  );
};

export default ImportApplicationButton;
