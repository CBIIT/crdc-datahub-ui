import { FC, MouseEvent } from "react";
import { Button, ButtonProps } from "@mui/material";
import { ReactComponent as DeleteSingleFileIcon } from "../../assets/dataSubmissions/delete_single_file.svg";

const DeleteOrphanFile: FC<ButtonProps> = ({ onClick, ...rest }) => {
  const onDelete = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
  };

  return (
    <Button startIcon={<DeleteSingleFileIcon />} onClick={onDelete} {...rest}>
      Delete extra file
    </Button>
  );
};

export default DeleteOrphanFile;
