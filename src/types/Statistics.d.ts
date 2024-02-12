type SeriesLabel = 'New' | 'Passed' | 'Error' | 'Warning';

type LegendFilter = {
  label: SeriesLabel;
  color: string;
  disabled?: boolean;
};

type BarChartDataItem = {
  label: string;
  New: number;
  Passed: number;
  Error: number;
  Warning: number;
};

type PieSectorDataItem = {
  label: SeriesLabel;
  value: number;
  color: string;
};
