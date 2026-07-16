/**
 * Fixture for the Pivot demo — a fake backend, kept out of the demo file.
 *
 * A pivot is server-driven by design: the grid asks for the cells it can see and
 * the filter menus page their options in. None of that is the component's data,
 * so a demo has to stand one up. Ported verbatim from the React demo's
 * pivot-demo-data.ts — it is pure logic with no framework imports, so the two
 * demos drive the same fake backend.
 *
 * Deterministic on purpose — the cells are a hash of (row, col), not random, so
 * the same coordinates always give the same number.
 */
import type { PivotField, PivotMembersRequest, PivotMembersResult } from "@algorisys/zen-ui-core/pivot";

export const PIVOT_FIELDS: PivotField[] = [
  { key: "country", label: "Country", type: "dimension" },
  { key: "city", label: "City", type: "dimension" },
  { key: "department", label: "Department", type: "dimension" },
  { key: "name", label: "Name", type: "dimension" },
  { key: "gender", label: "Gender", type: "dimension" },
  { key: "salary", label: "Salary", type: "measure" },
  { key: "age", label: "Age", type: "measure" },
  { key: "performance_score", label: "Performance Score", type: "measure" },
];

const MEMBERS: Record<string, string[]> = {
  country: ["United States", "United Kingdom", "Canada", "Germany", "France"],
  city: ["New York", "London", "Toronto", "Berlin", "Paris", "Chicago", "Vancouver", "Munich", "Lyon", "Austin"],
  department: ["Engineering", "Sales", "Marketing", "HR", "Finance", "Product"],
  name: ["Alice", "Bob", "Charlie", "David", "Emma", "Fiona", "George", "Hannah", "Ian", "Julia"],
  gender: ["Male", "Female", "Non-binary", "Other"],
  age: Array.from({ length: 46 }, (_, i) => `${i + 20}`),
  salary: Array.from({ length: 30 }, (_, i) => `${40000 + i * 5000}`),
  performance_score: ["1", "2", "3", "4", "5"],
};

const membersFor = (fieldKey: string): string[] => MEMBERS[fieldKey] ?? ["Dim 1", "Dim 2", "Dim 3", "Dim 4"];

export const memberCount = (fieldKey: string): number => membersFor(fieldKey).length;

/**
 * The filter menu's option source. Paged and searchable, like a real one — the
 * menu windows these, so handing it everything at once would prove nothing.
 */
export const loadMembers = async (request: PivotMembersRequest): Promise<PivotMembersResult> => {
  // A real one is a network call, and the menu has to stay usable during it.
  await new Promise((resolve) => setTimeout(resolve, 300));

  const all = membersFor(request.fieldKey);
  const search = request.search?.toLowerCase();
  const filtered = search ? all.filter((v) => v.toLowerCase().includes(search)) : all;

  const offset = request.offset ?? 0;
  const page = filtered.slice(offset, offset + (request.limit ?? 50));
  return { values: page, hasMore: offset + page.length < filtered.length, total: filtered.length };
};

/**
 * Which member a header shows at (index, depth). Nested headers repeat on a
 * cycle: the innermost field changes every cell, the one outside it every N
 * cells, where N is the product of the field counts inside it.
 */
export const dimensionValueAt = (
  fieldKey: string,
  index: number,
  depth: number,
  fieldKeys: string[],
  measuresPerCol = 1,
): string => {
  const values = membersFor(fieldKey);
  let changeRate = measuresPerCol;
  for (let i = depth + 1; i < fieldKeys.length; i++) changeRate *= memberCount(fieldKeys[i]);
  return values[Math.floor(index / changeRate) % values.length];
};

/** A stable pseudo-value for a cell. Same coordinates, same number, always. */
export const cellSeed = (row: number, col: number): number => (row * 37 + col * 17) % 10000;

export const formatMeasure = (measureId: string, seed: number): string => {
  if (measureId === "salary")
    return `$${(seed * 45.4 + 40000).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (measureId === "age") return `${(seed % 46) + 20}`;
  if (measureId === "performance_score") return `${(seed % 5) + 1}`;
  return (seed * 1.5).toFixed(2);
};
