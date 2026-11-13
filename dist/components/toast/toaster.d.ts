import * as React from "react";
/**
 * Toaster — mount once near the root of the app. Reads from the
 * module-scoped toast store (see ./use-toast.tsx) and renders every
 * open toast.
 *
 *   // app.tsx
 *   <App>
 *     <Routes>...</Routes>
 *     <Toaster />
 *   </App>
 *
 *   // anywhere in the tree
 *   import { toast } from "@algorisys/zen-ui-react";
 *   toast({ title: "Saved" });
 */
declare const Toaster: React.FC;
export { Toaster };
//# sourceMappingURL=toaster.d.ts.map