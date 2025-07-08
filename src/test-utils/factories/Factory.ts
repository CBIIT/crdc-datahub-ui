import { cloneDeep } from "lodash";

import { attachMultipleWithTypename, attachSingleWithTypename } from "@/utils/factoryUtils";

export class Factory<T> {
  constructor(private generateFn: (overrides?: Partial<T>) => T) {}

  /**
   * Build a single instance
   *
   * @param {Partial<T>} overrides - The properties to override
   */
  build(overrides?: Partial<T>): BuildableSingle<T>;

  /**
   * Build multiple instances
   *
   * @param {number} count - The number of instances to create
   * @param {Partial<T>} overrides - The properties to override
   */
  build(count: number, overrides?: Partial<T>): BuildableArray<T>;

  /**
   * Build multiple instances with a sequence function
   * @param {number} count - The number of instances to create
   * @param {function} sequenceFn - A function that receives the sequence number and returns the properties to override
   */
  build(count: number, sequenceFn?: (sequence: number) => Partial<T>): BuildableArray<T>;

  /**
   * Build an instance
   *
   * @param {number | Partial<T>} arg1 - The number of instances to create or the properties to override
   * @param {Partial<T> | function} arg2 - The properties to override or a function that receives the sequence number
   * @returns {T | T[]} - The created instance(s)
   */
  build(
    arg1: number | Partial<T>,
    arg2?: Partial<T> | ((sequence: number) => Partial<T>)
  ): BuildableSingle<T> | BuildableArray<T> {
    if (typeof arg1 === "number" && typeof arg2 !== "function") {
      return attachMultipleWithTypename(this.buildMany(arg1, arg2) as BuildableArray<T>);
    }
    if (typeof arg1 === "number" && typeof arg2 === "function") {
      return attachMultipleWithTypename(
        this.buildManyWithSequence(arg1, arg2) as BuildableArray<T>
      );
    }

    return attachSingleWithTypename(
      cloneDeep(this.generateFn(typeof arg1 === "object" ? arg1 : undefined)) as BuildableSingle<T>
    );
  }

  private buildManyWithSequence(count: number, sequenceFn?: (sequence: number) => Partial<T>): T[] {
    return Array.from({ length: count }, (_, index) =>
      this.generateFn(sequenceFn ? sequenceFn(index) : undefined)
    );
  }

  /**
   * Build multiple instances
   *
   * @param {number} count - The number of instances to create
   * @param {Partial<T>} overrides - The properties to override
   * @returns {T[]} - The created instances
   */
  private buildMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.generateFn(overrides));
  }
}
