import { CSSProperties } from 'react';
import { Sector } from "recharts";

const style: CSSProperties = {
  filter: "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.3))",
};

/**
 * Renders the current active arc (cell) of the pie chart.
 *
 * @param {ActiveShapeProps<PieSectorDataItem>} props
 * @returns {ActiveShape<PieSectorDataItem>}
 */
const ActiveArc = ({ innerRadius, ...props }) => (
  <Sector {...props} innerRadius={innerRadius - 15} style={style} />
);

export default ActiveArc;
