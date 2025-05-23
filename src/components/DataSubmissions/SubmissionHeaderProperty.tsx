import { Grid, Stack, Typography, styled } from "@mui/material";
import { memo } from "react";
import TruncatedText from "../TruncatedText";
import CopyTextButton from "../CopyTextButton";

const StyledLabel = styled(Typography)(() => ({
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
}));

export const StyledValue = styled(Typography)(() => ({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  display: "inline",
}));

type Props = {
  label: string;
  value: string | JSX.Element;
  tooltipText?: string;
  disableTooltip?: boolean;
  showCopyTextIcon?: boolean;
  copyText?: string;
  truncateAfter?: number | false;
};

const SubmissionHeaderProperty = ({
  label,
  value,
  tooltipText,
  disableTooltip,
  showCopyTextIcon,
  copyText,
  truncateAfter = 16,
}: Props) => {
  const handleCopyText = () => {
    if (!copyText?.trim()) {
      return;
    }

    navigator.clipboard.writeText(copyText);
  };

  const disableHoverListener = showCopyTextIcon ? false : undefined;

  return (
    <Grid lg={6} xs={12} item>
      <Stack direction="row" alignItems="center" width="100%" maxWidth="100%" spacing={2.75}>
        <StyledLabel variant="body1">{label}</StyledLabel>
        <Stack
          flexDirection="row"
          flexGrow={1}
          alignItems="center"
          overflow="hidden"
          lineHeight="16px"
        >
          {typeof value === "string" ? (
            <StyledValue variant="body1" data-testid="property-value">
              {truncateAfter && truncateAfter > 0 ? (
                <TruncatedText
                  text={value}
                  maxCharacters={truncateAfter}
                  underline={false}
                  disableHoverListener={disableTooltip ? true : disableHoverListener}
                  wrapperSx={{ lineHeight: "19.6px" }}
                  tooltipText={tooltipText}
                  ellipsis
                  arrow
                />
              ) : (
                value
              )}
            </StyledValue>
          ) : (
            value
          )}

          {showCopyTextIcon && (
            <CopyTextButton
              data-testid={`copy-${label}-button`}
              aria-label={`Copy ${label}`}
              onClick={handleCopyText}
              disabled={!copyText}
              title="Copy the Program full name"
              copyText={copyText}
              sx={{ marginLeft: "8px" }}
            />
          )}
        </Stack>
      </Stack>
    </Grid>
  );
};

export default memo(SubmissionHeaderProperty);
