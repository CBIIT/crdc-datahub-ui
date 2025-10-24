import { cloneDeep, has, unset } from "lodash";
import type * as z from "zod";

import { Logger } from "./logger";

/**
 * This function will remove the fields that are not valid according to the schema
 *
 * @template S
 * @param {S} schema - The Zod schema to validate against.
 * @param {object} data - The object to parse against the schema.
 * @returns {Partial<z.infer<S>>} - The parsed and validated object with all fields optional.
 */
export const parseSchemaObject = <S extends z.ZodObject>(
  schema: S,
  data: object
): Partial<z.infer<S>> => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  Logger.error(`parseSchemaObject: Failed schema validation. Will try to extract invalid fields.`, {
    data,
    error: result.error,
  });

  const issues = result?.error?.issues;
  const errorFields = issues.map((issue) => issue.path).filter((path) => path?.length > 0);

  const clonedData = cloneDeep(data);
  for (const path of errorFields) {
    if (!has(clonedData, path)) {
      break;
    }
    const success = unset(clonedData, path);

    if (!success) {
      Logger.error(
        `parseSchemaObject: Failed to unset path ${JSON.stringify(path)} in object.`,
        data
      );
    }
  }

  return clonedData;
};
