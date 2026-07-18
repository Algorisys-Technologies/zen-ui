/**
 * Ambient shims for OPTIONAL peer dependencies, inherited from vanilla.
 *
 * Map / RichText wrap heavy third-party libraries that are NOT bundled and may
 * not be installed in a consumer's project. They are lazy-loaded through the
 * vanilla factories only when those elements are used, and externalized from the
 * library build. These declarations let the package type-check without the
 * libraries' own types present.
 */
declare module "leaflet";
declare module "leaflet/dist/leaflet.css";
declare module "jodit";
