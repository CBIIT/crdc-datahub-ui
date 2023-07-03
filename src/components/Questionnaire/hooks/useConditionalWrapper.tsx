import { useState, useEffect, ReactNode, ComponentType } from 'react';

type WrapperProps = {
  children: ReactNode;
};

type UseConditionalWrapper = <T extends WrapperProps>(
  condition: () => boolean,
  wrapper: ComponentType<T>
) => ComponentType<T>;

export const useConditionalWrapper: UseConditionalWrapper = (condition, wrapper) => {
  const [renderWrapper, setRenderWrapper] = useState(false);

  useEffect(() => {
    setRenderWrapper(condition());
  }, []);

  return renderWrapper ? wrapper : ({ children }: WrapperProps) => children;
};
