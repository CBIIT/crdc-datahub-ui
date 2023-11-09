import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import {
  AlertColor,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import RadioInput from "./RadioInput";
import { CREATE_BATCH, CreateBatchResp, UPDATE_BATCH, UpdateBatchResp } from "../../graphql";
import { useAuthContext } from "../Contexts/AuthContext";

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

const UploadRoles: User["role"][] = ["Organization Owner"]; // and submission owner

type UploadType = "New" | "Update";

type Props = {
  submitterID: string;
  readOnly?: boolean;
  onUpload: (message: string, severity: AlertColor) => void;
};

const DataSubmissionUpload = ({ submitterID, readOnly, onUpload }: Props) => {
  const { submissionId } = useParams();
  const { user } = useAuthContext();

  const [uploadType, setUploadType] = useState<UploadType>("New");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadMetatadataInputRef = useRef<HTMLInputElement>(null);
  const isSubmissionOwner = submitterID === user?._id;
  const canUpload = UploadRoles.includes(user?.role) || isSubmissionOwner;

  const [createBatch] = useMutation<CreateBatchResp>(CREATE_BATCH, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [updateBatch] = useMutation<UpdateBatchResp>(UPDATE_BATCH, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

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
    if (!canUpload || readOnly) {
      return;
    }
    uploadMetatadataInputRef?.current?.click();
  };

  const handleChooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event?.target || {};

    if (!files) {
      setSelectedFiles(null);
      return;
    }

    // Filter out any file that is not tsv
    const filteredFiles = Array.from(files)?.filter((file: File) => file.name?.toLowerCase()?.endsWith(".tsv"));
    if (!filteredFiles?.length) {
      setSelectedFiles(null);
      return;
    }

    // Add the files back to a FileList
    const dataTransfer = new DataTransfer();
    filteredFiles.forEach((file) => dataTransfer?.items?.add(file));

    setSelectedFiles(dataTransfer?.files);
  };

  const createNewBatch = async (): Promise<NewBatch> => {
    if (!selectedFiles?.length) {
      return null;
    }

    try {
      const formattedFiles: FileInput[] = Array.from(selectedFiles)?.map((file) => ({ fileName: file.name, size: file.size }));
      const { data: batch, errors } = await createBatch({
        variables: {
          submissionID: submissionId,
          type: "metadata",
          metadataIntention: "New",
          files: formattedFiles,
        }
      });

      if (errors) {
        throw new Error("Unexpected network error");
      }

      return batch?.createBatch;
    } catch (err) {
      // Unable to initiate upload process so all failed
      onUploadFail(selectedFiles?.length);
      return null;
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles?.length || !canUpload || readOnly) {
      return;
    }

    setIsUploading(true);
    const newBatch: NewBatch = await createNewBatch();
    if (!newBatch) {
      return;
    }

    const uploadResult: UploadResult[] = [];

    const uploadPromises = newBatch.files?.map(async (file: FileURL) => {
      const selectedFile: File = Array.from(selectedFiles).find((f) => f.name === file.fileName);
      try {
        const res = await fetch(file.signedURL, {
          method: "PUT",
          body: selectedFile,
          headers: {
            'Content-Type': 'text/tab-separated-values',
          }
        });
        if (!res.ok) {
          throw new Error("Unexpected network error");
        }
        uploadResult.push({ fileName: file.fileName, succeeded: true, errors: null });
      } catch (err) {
        uploadResult.push({ fileName: file.fileName, succeeded: false, errors: err?.toString() });
      }
    });

    // Wait for all uploads to finish
    await Promise.all(uploadPromises);
    onBucketUpload(newBatch._id, uploadResult);
  };

  const onBucketUpload = async (batchID: string, files: UploadResult[]) => {
    let failedFilesCount = 0;
    files?.forEach((file) => {
      if (!file.succeeded) {
        failedFilesCount++;
      }
    });

    try {
      const { errors } = await updateBatch({
        variables: {
          batchID,
          files
        }
      });

      if (errors) {
        throw new Error("Unexpected network error");
      }
      if (failedFilesCount > 0) {
        onUploadFail(failedFilesCount);
        return;
      }
      // Batch upload completed successfully
      onUpload(`${selectedFiles.length} ${selectedFiles.length > 1 ? "Files" : "File"} successfully uploaded`, "success");
      setIsUploading(false);
      setSelectedFiles(null);
      if (uploadMetatadataInputRef.current) {
        uploadMetatadataInputRef.current.value = "";
      }
    } catch (err) {
      // Unable to let BE know of upload result so all fail
      onUploadFail(selectedFiles?.length);
    }
  };

  const onUploadFail = (fileCount = 0) => {
    onUpload(`${fileCount} ${fileCount > 1 ? "Files" : "File"} failed to upload`, "error");
    setSelectedFiles(null);
    setIsUploading(false);
    if (uploadMetatadataInputRef.current) {
      uploadMetatadataInputRef.current.value = "";
    }
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
          accept="text/tab-separated-values"
          onChange={handleChooseFiles}
          readOnly={readOnly}
          multiple
        />
        <StyledChooseFilesButton
          variant="outlined"
          onClick={handleChooseFilesClick}
          disabled={readOnly || isUploading || !canUpload}
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
        disabled={readOnly || !selectedFiles?.length || !canUpload}
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
