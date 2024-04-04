import { useState, useEffect, ReactNode, ComponentType, ComponentProps } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WrapperProps<T extends ComponentType<any>> = ComponentProps<T> & {
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = <T extends ComponentType<any>>(
  condition: () => boolean,
  wrapper: T
) => ComponentType<WrapperProps<T>>;

export const useConditionalWrapper: Props = (condition, wrapper) => {
  const [renderWrapper, setRenderWrapper] = useState(false);

  useEffect(() => {
    setRenderWrapper(condition());
  }, []);

  return renderWrapper ? wrapper : ({ children }: WrapperProps<typeof wrapper>) => children;
};
