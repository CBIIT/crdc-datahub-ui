import { cloneDeep } from "lodash";

export class Factory<T> {
  constructor(private generateFn: (overrides?: Partial<T>) => T) {}

  /**
   * Build a single instance
   *
   * @param {Partial<T>} overrides - The properties to override
   */
  build(overrides?: Partial<T>): T;

  /**
   * Build multiple instances
   *
   * @param {number} count - The number of instances to create
   * @param {Partial<T>} overrides - The properties to override
   */
  build(count: number, overrides?: Partial<T>): T[];

  /**
   * Build an instance
   *
   * @param {number | Partial<T>} arg1 - The number of instances to create or the properties to override
   * @param {Partial<T>} arg2 - The properties to override
   * @returns {T | T[]} - The created instance(s)
   */
  build(arg1: number | Partial<T>, arg2?: Partial<T>): T | T[] {
    if (typeof arg1 === "number") {
      return this.buildMany(arg1, arg2);
    }

    return cloneDeep(this.generateFn(arg1));
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
