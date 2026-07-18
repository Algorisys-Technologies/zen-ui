/**
 * Ambient shims for OPTIONAL peer dependencies.
 *
 * Map / RichText wrap heavy third-party libraries that are NOT bundled and may
 * not be installed in a consumer's project. They are declared as optional
 * peerDependencies and externalized from the library build; each component
 * lazy-loads its library via dynamic `import()` only when built, so the base
 * bundle stays lean and consumers who never touch these components never pay for
 * the dependency. These declarations let the package type-check/build without the
 * libraries' own types present (the imports resolve to `any`).
 */
declare module "leaflet";
declare module "leaflet/dist/leaflet.css";
declare module "jodit";
