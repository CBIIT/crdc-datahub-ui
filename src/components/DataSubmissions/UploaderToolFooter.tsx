import { FC } from "react";
import { useLazyQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Box, Typography, styled } from "@mui/material";
import env from "../../env";
import { RETRIEVE_CLI_CONFIG, RetrieveCLIConfigResp } from "../../graphql";
import { downloadBlob, filterAlphaNumeric } from "../../utils";

export type Props = {
  /**
   * The ID of the submission to download a pre-configured CLI config for.
   */
  submission: Submission;
};

const StyledBox = styled(Box)({
  fontSize: "14px",
  marginTop: "14px",
  userSelect: "none",
});

const StyledButton = styled(Typography)({
  color: "blue",
  cursor: "pointer",
  textDecoration: "underline",
  display: "inline",
  fontSize: "inherit",
});

/**
 * Component the Uploader CLI "pre-populated" configuration file download.
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const UploaderToolFooter: FC<Props> = ({ submission }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { _id, name } = submission || {};

  const [retrieveCLIConfig] = useLazyQuery<RetrieveCLIConfigResp>(RETRIEVE_CLI_CONFIG, {
    variables: {
      _id,
      apiURL: env.REACT_APP_BACKEND_API,
    },
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleConfigDownload = async () => {
    try {
      const { data, error } = await retrieveCLIConfig();

      if (error || !data?.retrieveCLIConfig?.length) {
        throw new Error(error.message);
      }

      const filteredName = filterAlphaNumeric(name.trim()?.replaceAll(" ", "-"), "-");
      const prefixedName = `cli-config-${filteredName}`;
      const filename = `${prefixedName.replace(/-+$/, "")}.yml`;

      downloadBlob(data.retrieveCLIConfig, filename, "application/yaml");
    } catch (e) {
      enqueueSnackbar("Unable to download Uploader CLI config file", {
        variant: "error",
      });
    }
  };

  return (
    <StyledBox data-testid="uploader-cli-footer">
      * To upload data files, click on these two links to download the{" "}
      <Link
        to={env.REACT_APP_UPLOADER_CLI}
        target="_self"
        data-testid="uploader-cli-download-button"
        download
      >
        Uploader CLI tool
      </Link>{" "}
      and the{" "}
      <StyledButton onClick={handleConfigDownload} data-testid="uploader-cli-config-button">
        configuration file
      </StyledButton>{" "}
      pre-configured with settings tailored for this specific data submission
    </StyledBox>
  );
};

export default UploaderToolFooter;
