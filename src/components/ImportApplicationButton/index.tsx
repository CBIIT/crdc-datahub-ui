import { Button, styled } from "@mui/material";
import { useRef, useState } from "react";

import { Logger } from "@/utils";

import { useFormContext } from "../Contexts/FormContext";
import StyledTooltip from "../StyledFormComponents/StyledTooltip";

const VisuallyHiddenInput = styled("input")({
  display: "none !important",
});

type Props = {
  disabled?: boolean;
};

const ImportApplicationButton = ({ disabled }: Props) => {
  const { data } = useFormContext();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const acceptedExtensions = [".xlsx"];

  const onImportClick = () => {
    if (disabled || isUploading) {
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

    QuestionnaireExcelMiddleware.parse(await dataTransfer?.files?.[0]?.arrayBuffer(), {
      application: data,
    });

    setIsUploading(false);
  };

  return (
    <StyledTooltip
      title="Upload the Submission Request Excel Template."
      placement="top"
      data-testid="import-application-excel"
      disableInteractive
      arrow
    >
      <span>
        {/* TODO: Style based on design */}
        <VisuallyHiddenInput
          ref={uploadInputRef}
          type="file"
          accept={acceptedExtensions.toString()}
          data-testid="import-upload-file-input"
          aria-label="Upload application template"
          onChange={handleImport}
          readOnly={disabled}
        />
        <Button
          variant="contained"
          color="info"
          onClick={onImportClick}
          disabled={disabled || isUploading}
          data-testid="import-upload-file-select-button"
        >
          Import
        </Button>
      </span>
    </StyledTooltip>
  );
};

export default ImportApplicationButton;
