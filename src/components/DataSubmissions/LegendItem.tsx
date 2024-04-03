import { FC } from "react";
import { Box, Stack, Typography, styled } from "@mui/material";

type Props = {
  color: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

const StyledStack = styled(Stack, {
  shouldForwardProp: (p) => p !== "disabled",
})<{ disabled: boolean }>(({ disabled }) => ({
  opacity: disabled ? 0.4 : 1,
  textDecoration: disabled ? "line-through" : "none",
  marginRight: "35px",
  "&:last-child": {
    marginRight: "0",
  },
  cursor: "pointer",
  userSelect: "none",
}));

const StyledLabel = styled(Typography)({
  color: "#383838",
  fontSize: "11px",
  fontWeight: 600,
  fontFamily: "'Nunito Sans'",
});

const StyledColorBox = styled(Box, {
  shouldForwardProp: (p) => p !== "color",
})<{ color: string }>(({ color }) => ({
  width: "22px",
  height: "9px",
  background: color,
  marginRight: "11px",
  borderRadius: "1.5px",
}));

/**
 * Represents an item in the legend of a chart
 *
 * e.g. [color box] [label]
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const LegendItem: FC<Props> = ({ color, label, disabled, onClick }: Props) => (
  <StyledStack
    direction="row"
    alignItems="center"
    disabled={disabled}
    onClick={() => onClick?.()}
  >
    <StyledColorBox color={color} />
    <StyledLabel>{label}</StyledLabel>
  </StyledStack>
);

export default LegendItem;
