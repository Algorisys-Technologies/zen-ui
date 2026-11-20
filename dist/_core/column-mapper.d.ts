export interface MapperField {
    id: string;
    label: string;
    required?: boolean;
    type?: "text" | "number" | "date";
    /** Other headers that mean this field ("Item code", "Material"). */
    aliases?: string[];
}
/** Source header → field id. Headers absent from it are ignored. */
export type ColumnMapping = Record<string, string>;
export declare function parseDelimited(text: string, options?: {
    delimiter?: string;
}): string[][];
/** The delimiter that splits the first lines into the same, largest number of columns. */
export declare function detectDelimiter(text: string): string;
/** Exact matches on id, label or alias (normalised). Each field is used once, by the first header that matches. */
export declare function autoMap(headers: readonly string[], fields: readonly MapperField[]): ColumnMapping;
export type CellErrorKind = "required" | "number" | "date";
export interface MappingValidation {
    /** Required field ids no column is mapped to. */
    missing: string[];
    /** Field ids more than one column is mapped to. */
    duplicates: string[];
    /** Row is 1-based over the data (the header row is not counted). */
    cellErrors: {
        row: number;
        column: string;
        field: string;
        kind: CellErrorKind;
        value: string;
    }[];
    validRows: number;
    totalRows: number;
    ok: boolean;
}
/** An import date: ISO, or a full three-part date in the locale's order. No shortcuts, no guessing. */
export declare function parseImportDate(text: string, locale?: string): Date | null;
export declare function validateMapping(mapping: ColumnMapping, fields: readonly MapperField[], rows: readonly string[][], options?: {
    locale?: string;
}): MappingValidation;
