import * as React from "react";
import { type ColumnMapping, type MapperField, type MappingValidation } from "../../_core/column-mapper";
/**
 * ColumnMapper — map a spreadsheet's columns onto your fields, and see what
 * will import before it does.
 *
 *   const rows = parseDelimited(await file.text());   // or rows from an .xlsx reader
 *   <ColumnMapper rows={rows} fields={workOrderFields}
 *     onChange={(mapping, check) => setReady(check.ok)} />
 *
 * Columns are matched by name on arrival — the field's id, label or aliases,
 * ignoring case, accents and punctuation — and never guessed beyond that: a
 * wrong guess imports bad data silently, an unmapped column is merely visible.
 * Each column shows sample values and a "Maps to" select. Above, a summary and
 * every problem in words: a required field nobody mapped, two columns onto one
 * field. Below, a preview of the first rows as they will import, every bad
 * cell marked with its reason (an empty required value, a number or date that
 * does not read in the user's locale).
 */
export type ColumnMapperProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
    /** The file's rows, header first. */
    rows: string[][];
    fields: MapperField[];
    mapping?: ColumnMapping;
    /** Defaults to the automatic match. */
    defaultMapping?: ColumnMapping;
    onChange?: (mapping: ColumnMapping, validation: MappingValidation) => void;
    /** Rows shown in the preview. Default 5. */
    previewRows?: number;
};
export declare const ColumnMapper: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & {
    /** The file's rows, header first. */
    rows: string[][];
    fields: MapperField[];
    mapping?: ColumnMapping;
    /** Defaults to the automatic match. */
    defaultMapping?: ColumnMapping;
    onChange?: (mapping: ColumnMapping, validation: MappingValidation) => void;
    /** Rows shown in the preview. Default 5. */
    previewRows?: number;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=column-mapper.d.ts.map