import { createSignal } from "solid-js";
import { PivotWorkbench, PivotGrid } from "./pivot";
import type { PivotLayout, PivotMembersRequest, PivotMembersResult } from "./pivot";
import { DemoPage, DemoSection } from "./demo-helpers";

export default function NewPivotDemo() {
  const [layout, setLayout] = createSignal<PivotLayout | null>(null);

  const fields = [
    { key: "country", label: "Country", type: "dimension" as const },
    { key: "city", label: "City", type: "dimension" as const },
    { key: "department", label: "Department", type: "dimension" as const },
    { key: "name", label: "Name", type: "dimension" as const },
    { key: "gender", label: "Gender", type: "dimension" as const },
    { key: "salary", label: "Salary", type: "measure" as const },
    { key: "age", label: "Age", type: "measure" as const },
    { key: "performance_score", label: "Performance Score", type: "measure" as const },
  ];

  const handleLayoutApply = (newLayout: PivotLayout) => {
    setLayout(newLayout);
  };

  const DUMMY_DATA: Record<string, string[]> = {
    country: ["United States", "United Kingdom", "Canada", "Germany", "France"],
    city: ["New York", "London", "Toronto", "Berlin", "Paris", "Chicago", "Vancouver", "Munich", "Lyon", "Austin"],
    department: ["Engineering", "Sales", "Marketing", "HR", "Finance", "Product"],
    name: ["Alice", "Bob", "Charlie", "David", "Emma", "Fiona", "George", "Hannah", "Ian", "Julia"],
    gender: ["Male", "Female", "Non-binary", "Other"]
  };

  const loadMembers = async (request: PivotMembersRequest): Promise<PivotMembersResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let allValues: string[] = [];
    if (DUMMY_DATA[request.fieldKey]) {
      allValues = DUMMY_DATA[request.fieldKey];
    } else {
      if (request.fieldKey === "age") allValues = Array.from({ length: 46 }).map((_, i) => `${i + 20}`);
      else if (request.fieldKey === "salary") allValues = Array.from({ length: 30 }).map((_, i) => `${40000 + (i * 5000)}`);
      else if (request.fieldKey === "performance_score") allValues = ["1", "2", "3", "4", "5"];
      else allValues = Array.from({ length: 15 }).map((_, i) => `Value ${i + 1}`);
    }

    let filtered = allValues;
    if (request.search) {
      const search = request.search.toLowerCase();
      filtered = filtered.filter(v => v.toLowerCase().includes(search));
    }

    const offset = request.offset ?? 0;
    const limit = request.limit ?? 50;
    const page = filtered.slice(offset, offset + limit);

    return {
      values: page,
      hasMore: offset + page.length < filtered.length,
      total: filtered.length,
    };
  };

  const getNumValues = (fieldKey: string) => {
    if (DUMMY_DATA[fieldKey]) return DUMMY_DATA[fieldKey].length;
    if (fieldKey === "age") return 46;
    if (fieldKey === "salary") return 30;
    if (fieldKey === "performance_score") return 5;
    return 4;
  };

  const getDimensionValue = (fieldKey: string, index: number, depth: number, fieldKeys: string[], isCol: boolean, numMeasures: number = 1) => {
    let values = DUMMY_DATA[fieldKey];
    if (!values) {
      if (fieldKey === "age") values = Array.from({ length: 46 }).map((_, i) => `${i + 20}`);
      else if (fieldKey === "salary") values = Array.from({ length: 30 }).map((_, i) => `${40000 + (i * 5000)}`);
      else if (fieldKey === "performance_score") values = ["1", "2", "3", "4", "5"];
      else values = ["Dim 1", "Dim 2", "Dim 3", "Dim 4"];
    }
    
    let changeRate = isCol ? numMeasures : 1;
    for (let i = depth + 1; i < fieldKeys.length; i++) {
      changeRate *= getNumValues(fieldKeys[i]);
    }
    
    const vIndex = Math.floor(index / changeRate);
    return values[vIndex % values.length];
  };

  const getCell = (row: number, col: number) => {
    const l = layout();
    if (!l) return { value: "" };
    const measures = l.values;
    if (measures.length === 0) return { value: "" };
    
    const measureIdx = col % measures.length;
    const measure = measures[measureIdx];
    const seed = (row * 37 + col * 17) % 10000;
    
    if (measure.id === "salary") {
      return { value: `$${(seed * 45.4 + 40000).toLocaleString("en-US", { maximumFractionDigits: 0 })}` };
    } else if (measure.id === "age") {
      return { value: `${(seed % 46) + 20}` };
    } else if (measure.id === "performance_score") {
      return { value: `${(seed % 5) + 1}` };
    }
    return { value: (seed * 1.5).toFixed(2) };
  };
  
  const getRowHeader = (row: number, depth: number) => {
    const l = layout();
    if (!l) return null;
    const fieldKey = l.rows[depth];
    if (!fieldKey) return null;
    return { value: getDimensionValue(fieldKey, row, depth, l.rows, false) };
  };

  const getColHeader = (depth: number, col: number) => {
    const l = layout();
    if (!l) return null;

    const cols = l.columns;
    const measures = l.values;

    if (depth < cols.length) {
       const fieldKey = cols[depth];
       return { value: getDimensionValue(fieldKey, col, depth, cols, true, Math.max(1, measures.length)) };
    }
    
    if (measures.length > 0 && depth >= cols.length) {
       const measure = measures[col % measures.length];
       const field = fields.find(f => f.key === measure.id);
       return { value: field?.label || measure.id };
    }
    
    return { value: `Col ${col}` };
  };

  const calculatedTotalRows = () => {
    const l = layout();
    if (!l || l.rows.length === 0) return 1;
    return l.rows.reduce((acc, key) => acc * getNumValues(key), 1);
  };

  const calculatedTotalCols = () => {
    const l = layout();
    if (!l) return 1;
    const dimCols = l.columns.reduce((acc, key) => acc * getNumValues(key), 1);
    const measureCols = Math.max(1, l.values.length);
    return dimCols * measureCols;
  };

  return (
    <DemoPage title="Pivot Table" description="A drag-and-drop builder for Pivot Tables with 2D virtualized scrolling.">
      <DemoSection title="Pivot Workbench & Grid" description="Use the workbench to drag fields into the layout zones. Filter menus use virtualized infinite scrolling.">
        <div class="zen-h-[800px] zen-w-full zen-flex zen-flex-col zen-gap-4">
          <PivotWorkbench
            fields={fields}
            onLayoutApply={handleLayoutApply}
            loadMembers={loadMembers}
            totalRows={calculatedTotalRows()}
            totalCols={calculatedTotalCols()}
          >
            {layout() ? (
               <PivotGrid
                 layout={layout()!}
                 totalRows={calculatedTotalRows()}
                 totalCols={calculatedTotalCols()}
                 rowHeaderDepth={Math.max(1, layout()!.rows.length)}
                 colHeaderDepth={Math.max(1, layout()!.columns.length + (layout()!.values.length > 0 ? 1 : 0))}
                 getCell={getCell}
                 getRowHeader={getRowHeader}
                 getColHeader={getColHeader}
                 onVisibleRangeChange={(range) => {
                   console.log("Visible Range Changed (Fetch Data Here):", range);
                 }}
               />
            ) : (
               <div class="zen-flex zen-items-center zen-justify-center zen-h-full zen-border zen-border-dashed zen-border-zen-border zen-rounded-md zen-text-zen-muted-foreground">
                 Click "View Data" to render the grid
               </div>
            )}
          </PivotWorkbench>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
