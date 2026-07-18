/**
 * Ambient shims for OPTIONAL peer dependencies.
 *
 * Chart / RichText / Map / Camera wrap heavy third-party libraries that are NOT
 * bundled and NOT installed in this workspace. They are declared as optional
 * peerDependencies and externalized from the library build; each component
 * lazy-loads its library via dynamic `import()` only when rendered, so the base
 * bundle stays lean and consumers who never touch these components never pay
 * for the dependency. These declarations let the package type-check/build
 * without the libraries present (the imports resolve to `any`).
 */
declare module "recharts";
declare module "jodit-pro-react";
declare module "leaflet";
declare module "react-leaflet";
declare module "react-webcam";
