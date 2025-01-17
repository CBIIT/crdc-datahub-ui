import { useEffect, useRef } from "react";
import { debounce } from "lodash";

type UseDebouncedWatchParams<TForm> = {
  /**
   * The `watch` function from react-hook-form or useFormContext.
   */
  watch: (callback: (values: TForm, details: { name?: string }) => void) => {
    unsubscribe: () => void;
  };
  /**
   * The fields to debounce.
   */
  fieldsToDebounce: (keyof TForm)[];
  /**
   * The minimum number of characters that trigger the debounce.
   */
  minLength?: number;
  /**
   * Time delay before debounce is triggered
   */
  debounceMs?: number;
  /**
   * The callback that is called when form values change.
   */
  onChange: (values: TForm) => void;
};

/**
 * Watches form values in react-hook-form and applies debounce logic for
 * specified fields once their values meet a length threshold.
 */
export const useDebouncedWatch = <TForm>({
  watch,
  fieldsToDebounce,
  minLength = 3,
  debounceMs = 500,
  onChange,
}: UseDebouncedWatchParams<TForm>) => {
  const debouncedOnChangeRef = useRef(
    debounce((values: TForm) => {
      onChange(values);
    }, debounceMs)
  ).current;

  useEffect(() => {
    const subscription = watch((values: TForm, { name }) => {
      if (!name) {
        return;
      }

      // If this field is one of the fields to debounce
      if (fieldsToDebounce?.includes(name as keyof TForm)) {
        const value = values[name as keyof TForm];
        const length = typeof value === "string" ? value.length : 0;

        // If length reaches minimum length, then trigger the debounced onChange
        if (length >= minLength) {
          debouncedOnChangeRef(values);
          return;
        }

        // If length is between 1 and minLength, we cancel the debounce
        if (length > 0 && length < minLength) {
          debouncedOnChangeRef.cancel();
          return;
        }

        // If the value is cleared, cancel & call onChange immediately
        if (length === 0) {
          debouncedOnChangeRef.cancel();
          onChange(values);
          return;
        }
      }

      // If it's not a debounce field, call onChange immediately
      onChange(values);
    });

    return () => {
      debouncedOnChangeRef.cancel();
      subscription.unsubscribe();
    };
  }, [watch, fieldsToDebounce, debouncedOnChangeRef, minLength, debounceMs, onChange]);
};
