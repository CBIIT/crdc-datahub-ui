import { cloneDeep } from "@apollo/client/utilities/common/cloneDeep";

/**
 * Attaches a __typename property to a single object
 *
 * @param {T} data The object to attach the __typename to
 * @returns {BuildableSingle<T>} A buildable object with a non-enumerable withTypename method
 */
export const attachSingleWithTypename = <T>(data: T): BuildableSingle<T> => {
  const item = cloneDeep(data);
  const buildable = item as BuildableSingle<T>;
  Object.defineProperty(buildable, "withTypename", {
    value: <K extends string>(typename: K) =>
      ({ ...item, __typename: typename }) as T & { __typename: K },
    writable: false,
    enumerable: false,
    configurable: false,
  });
  return buildable;
};

/**
 * Attaches a __typename property to an array of objects
 *
 * @param {T[]} items The array of objects to attach the __typename to
 * @returns {BuildableArray<T>} A buildable array with a non-enumerable withTypename method
 */
export const attachMultipleWithTypename = <T>(items: T[]): BuildableArray<T> => {
  const arr = cloneDeep(items) as BuildableArray<T>;
  Object.defineProperty(arr, "withTypename", {
    value: <K extends string>(typename: K) =>
      arr.map((item) => ({ ...item, __typename: typename }) as T & { __typename: K }),
    writable: false,
    enumerable: false,
    configurable: false,
  });
  return arr;
};
