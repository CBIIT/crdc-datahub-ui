import { Sector } from 'recharts';

/**
 * Renders the current active arc (cell) of the pie chart.
 *
 * @param {ActiveShapeProps<PieSectorDataItem>} props
 * @returns {ActiveShape<PieSectorDataItem>}
 */
const ActiveArc = ({ innerRadius, ...props }) => (<Sector {...props} innerRadius={innerRadius - 15} />);

export default ActiveArc;
