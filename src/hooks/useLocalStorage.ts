import { useState } from "react";

/**
 * Custom hook to manage state synchronized with localStorage.
 * @param key The key in localStorage.
 * @param initialValue The initial value to use if none is found in localStorage.
 * @returns A stateful value and a function to update it.
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  /**
   * Sets the state and updates localStorage.
   * @param value The new value to store.
   */
  const setValue = (value: T): void => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Do nothing
    }
  };

  return [storedValue, setValue];
};
