import { FC, useCallback, useMemo, useState } from 'react';
import { PieChart, Pie, Label, Cell } from 'recharts';
import { Box, styled } from '@mui/material';
import PieChartCenter from './PieChartCenter';
import ActiveArc from './ActiveArc';

export type PieSectorDataItem = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  /**
   * The data to display in the pie chart
   */
  data: PieSectorDataItem[];
};

const StyledChartContainer = styled(Box)({
  overflow: "visible",
  "& div": {
    margin: "0 auto",
  },
  "& svg *:focus": {
    outline: "none",
  },
});

/**
 * Builds a summary of node states (passed, new, ...) chart for the node statistics
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const NodeTotalChart: FC<Props> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onMouseOver = useCallback((data, index) => setActiveIndex(index), []);
  const onMouseLeave = useCallback(() => setActiveIndex(null), []);

  const dataset: PieSectorDataItem[] = useMemo(() => data.filter(({ value }) => value > 0), [data]);
  const total = dataset.reduce((acc, { value }) => acc + value, 0);

  return (
    <StyledChartContainer>
      <PieChart width={391} height={391}>
        <Pie
          data={[{ value: 100 }]}
          dataKey="value"
          innerRadius={115}
          outerRadius={391 / 2}
          fill="#f2f2f2"
          isAnimationActive={false}
          aria-label="Node Total background"
        >
          {(dataset.length === 0 && activeIndex === null) && <Label position="center" content={(<PieChartCenter title="Total" value={0} />)} />}
        </Pie>
        <Pie
          data={dataset}
          dataKey="value"
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={391 / 2}
          innerRadius={115}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
          activeShape={ActiveArc}
          activeIndex={activeIndex}
          aria-label="Node Total chart"
        >
          {dataset.map(({ label, color }) => (<Cell key={label} fill={color} />))}
          <Label
            position="center"
            content={(
              <PieChartCenter
                title={activeIndex !== null ? dataset?.[activeIndex]?.label : "Total"}
                value={activeIndex !== null ? dataset?.[activeIndex]?.value : total}
              />
            )}
          />
        </Pie>
      </PieChart>
    </StyledChartContainer>
  );
};

export default NodeTotalChart;
