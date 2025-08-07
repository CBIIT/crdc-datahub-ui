import type ExcelJS from "exceljs";

export type SectionCtxBase = {
  workbook: ExcelJS.Workbook;
  u: { header: (ws: ExcelJS.Worksheet, color?: string) => void };
};

/**
 * Represents the definition of a column in the section.
 */
export type ColumnDef<K extends string> = Omit<Partial<ExcelJS.Column>, "key"> & { key: K };

/**
 * Represents the character limits for each column in the section.
 */
export type CharacterLimitsMap<K extends string> = Readonly<Partial<{ [key in K]: number }>>;

/**
 * Represents the configuration for a section in the Excel worksheet.
 */
export type SectionConfig<K extends string, D> = {
  id: string;
  deps: D;
  sheetName: string;
  columns: ColumnDef<K>[];
  headerColor?: string;
  characterLimits?: CharacterLimitsMap<K>;
};

/**
 * Represents a section in the Excel worksheet.
 */
export type Section = {
  /**
   * The unique identifier for the section.
   * @example "B"
   */
  id: string;
  /**
   * Serialize the section data to the worksheet.
   * @param ctx The section context.
   * @returns The created worksheet.
   */
  serialize: (ctx: SectionCtxBase) => Promise<ExcelJS.Worksheet>;
};

export abstract class SectionBase<K extends string, D> implements Section {
  /**
   * The unique identifier for the section.
   * @example "B"
   */
  public readonly id: string;

  /**
   * The section dependencies.
   */
  protected readonly deps: D;

  /**
   * The name of the worksheet.
   * @example "Program and Study"
   */
  private readonly _sheetName: string;

  /**
   * The columns in the section.
   */
  private readonly _columns: ColumnDef<K>[];

  /**
   * The color of the header row.
   * @example "D9EAD3"
   */
  private readonly _headerColor: string;

  /**
   * The character limits for each column in the section.
   */
  protected readonly CHARACTER_LIMITS: CharacterLimitsMap<K>;

  /**
   * Create a new section.
   * @param cfg The section configuration.
   */
  constructor(cfg: SectionConfig<K, D>) {
    this.id = cfg.id;
    this.deps = cfg.deps;
    this._sheetName = cfg.sheetName;
    this._columns = cfg.columns;
    this._headerColor = cfg.headerColor ?? "#D9EAD3";
    this.CHARACTER_LIMITS = Object.freeze({ ...(cfg.characterLimits ?? {}) });
  }

  /**
   * Serialize the section data to the worksheet.
   * @param ctx The section context.
   * @returns The created worksheet.
   */
  public async serialize(ctx: SectionCtxBase): Promise<ExcelJS.Worksheet> {
    const ws = this.create(ctx);
    const row = this.write(ctx, ws);
    await this.validate(ctx, ws, row);

    return ws;
  }

  /**
   * Create worksheet, add columns, and style header.
   * @param ctx The section context.
   * @returns The created worksheet.
   */
  protected create(ctx: SectionCtxBase): ExcelJS.Worksheet {
    const ws = ctx.workbook.addWorksheet(this._sheetName);
    ws.columns = this._columns;
    ctx.u.header(ws, this._headerColor);

    return ws;
  }

  /**
   * Write data to the worksheet.
   * @param ctx The section context.
   * @param ws The worksheet.
   */
  protected abstract write(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row | ExcelJS.Row[];

  /**
   * Attach data validation to the data in the worksheet.
   * @param ctx The section context.
   * @param ws The worksheet.
   * @param row The row to validate.
   */
  protected abstract validate(
    ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    row: ExcelJS.Row | ExcelJS.Row[]
  ): void | Promise<void>;
}
