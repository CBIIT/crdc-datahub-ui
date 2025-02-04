import React, { FC, memo } from "react";

export type RepeaterProps = {
  /**
   * The number of times the component should be repeated
   */
  count: number;
  /**
   * The component that should be repeated N times
   */
  children: React.ReactElement;
};

/**
 * A component wrapper that repeats it's children N number of times
 *
 * @returns The Repeater component
 */
const Repeater: FC<RepeaterProps> = ({ children, count }: RepeaterProps) => (
  <>{Array.from({ length: count }, (_, index) => React.cloneElement(children, { key: index }))}</>
);

export default memo<RepeaterProps>(Repeater);
