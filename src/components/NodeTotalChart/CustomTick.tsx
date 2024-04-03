import { styled } from "@mui/material";

const StyledLabel = styled("tspan")({
  fontFamily: "Roboto",
  fontSize: "11px",
  fontWeight: 400,
  color: "#474747",
  textTransform: "capitalize",
  overflow: "hidden",
  userSelect: "none",
});

const CustomTick = ({ x, y, payload }) => {
  const textLines = payload.value?.replace(/_/g, " ").split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={6}>
        {textLines.map((tspan, index) => (
          <StyledLabel key={tspan} textAnchor="middle" x={0} dy={6 * index + 8}>
            {tspan}
          </StyledLabel>
        ))}
      </text>
    </g>
  );
};

export default CustomTick;
