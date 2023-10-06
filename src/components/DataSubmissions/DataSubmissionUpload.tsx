import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Stack,
  Typography,
  styled,
} from "@mui/material";
import RadioInput from "./RadioInput";

const StyledUploadTypeText = styled(Typography)(() => ({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
}));

const StyledMetadataText = styled(StyledUploadTypeText)(() => ({
  "&.MuiTypography-root": {
    color: "#000000",
  },
}));

const StyledUploadFilesButton = styled(LoadingButton)(() => ({
  display: "flex",
  flexDirection: "column",
  padding: "12px 22px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  background: "#005EA2",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&.MuiButtonBase-root": {
    marginLeft: "auto",
    marginRight: "21.5px"
  }
}));

const StyledChooseFilesButton = styled(LoadingButton)(() => ({
  display: "flex",
  flexDirection: "column",
  padding: "12px 22px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #6B7294",
  background: "#FFFFFF",
  textAlign: "center",
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "19.6px",
  textTransform: "initial",
  height: "44px",
  boxShadow: "none",
  marginLeft: "12px",
  marginRight: "12px",
  "&.MuiButtonBase-root": {
    marginLeft: "15px",
  },
  "&:hover": {
    cursor: "pointer",
    background: "#C0DAF3"
  },
}));

const StyledFilesSelected = styled(Typography)(() => ({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "italic",
  fontWeight: 400,
  lineHeight: "19.6px",
  minWidth: "135px",
}));

const StyledUploadWrapper = styled(Stack)(() => ({
  paddingLeft: "24px",
  marginBottom: "19px"
}));

const StyledUploadActionWrapper = styled(Stack)(() => ({
  "&.MuiStack-root": {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "48px"
  }
}));

const VisuallyHiddenInput = styled("input")(() => ({
  display: "none !important",
}));

type UploadType = "New" | "Update";

type Props = {
  onUpload: (message: string) => void;
  readOnly?: boolean;
};

const DataSubmissionUpload = ({ onUpload, readOnly }: Props) => {
  const [uploadType, setUploadType] = useState<UploadType>("New");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadMetatadataInputRef = useRef<HTMLInputElement>(null);

  // Intercept browser navigation actions (e.g. closing the tab) with unsaved changes
  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (selectedFiles?.length > 0) {
        event.preventDefault();
        event.returnValue = 'You have unsaved form changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });

  const handleChooseFilesClick = () => {
    uploadMetatadataInputRef?.current?.click();
  };

  const handleChooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event?.target || {};

    if (!files) {
      return;
    }

    setSelectedFiles(files);
  };

  const handleUploadFiles = () => {
    if (!selectedFiles?.length) {
      return;
    }

    // Simulate uploading files
    setIsUploading(true);
    setTimeout(() => {
      setSelectedFiles(null);
      setIsUploading(false);
      if (typeof onUpload === "function") {
        onUpload(`${selectedFiles.length} ${selectedFiles.length > 1 ? "Files" : "File"} successfully uploaded`);
      }
    }, 3500);
  };

  return (
    <StyledUploadWrapper direction="row" alignItems="center" spacing={1.25}>
      <RadioInput
        id="data-submission-dashboard-upload-type"
        label="Upload Type"
        value={uploadType}
        onChange={(event, value: UploadType) => setUploadType(value)}
        options={[{ label: "New", value: "New" }, { label: "Update", value: "Update", disabled: true }]}
        gridWidth={4}
        readOnly={readOnly}
        inline
        row
      />
      <StyledUploadActionWrapper direction="row">
        <StyledMetadataText variant="body2">Metadata Files</StyledMetadataText>
        <VisuallyHiddenInput
          ref={uploadMetatadataInputRef}
          type="file"
            /* accept="text/tab-separated-values" */
          onChange={handleChooseFiles}
          readOnly={readOnly}
          multiple
        />
        <StyledChooseFilesButton
          variant="outlined"
          onClick={handleChooseFilesClick}
          disabled={readOnly || isUploading}
        >
          Choose Files
        </StyledChooseFilesButton>
        <StyledFilesSelected variant="body1">
          {selectedFiles?.length ? `${selectedFiles.length} ${selectedFiles.length > 1 ? "files" : "file"} selected` : "No files selected"}
        </StyledFilesSelected>
      </StyledUploadActionWrapper>
      <StyledUploadFilesButton
        variant="contained"
        onClick={handleUploadFiles}
        loading={isUploading}
        disabled={readOnly || !selectedFiles?.length}
        disableElevation
        disableRipple
        disableTouchRipple
      >
        Upload Files
      </StyledUploadFilesButton>
    </StyledUploadWrapper>
  );
};

export default DataSubmissionUpload;
