/**
 * Registers every <zen-*> custom element as a side effect of importing this
 * module. Each element file calls defineZenElement() at eval time.
 *
 * Importing "@algorisys/zen-ui-web-components" pulls this in (see ../index.ts), so
 * a consumer gets every element defined just by importing the package. package.json
 * marks src/elements/** sideEffectful so a bundler keeps these imports.
 *
 * Generated: one import line per family file in this directory.
 */
import { registeredTags } from "../lib/define";

import "./accordion";
import "./alert";
import "./alert-dialog";
import "./avatar";
import "./badge";
import "./banner";
import "./bound-fields";
import "./breadcrumb";
import "./button";
import "./button-family";
import "./camera";
import "./card";
import "./carousel";
import "./chart";
import "./checkbox";
import "./color-picker";
import "./combobox";
import "./data-table";
import "./tree-table";
import "./micro-chart";
import "./timeline";
import "./upload-collection";
import "./planning-calendar";
import "./date-picker";
import "./date-range-picker";
import "./date-time-picker";
import "./dialog";
import "./divider";
import "./dropdown-menu";
import "./dynamic-date-range";
import "./dynamic-page";
import "./empty-state";
import "./fab";
import "./file-upload";
import "./filter-bar";
import "./flexible-column-layout";
import "./form";
import "./icon";
import "./input";
import "./likert";
import "./link";
import "./loading";
import "./map";
import "./mask-input";
import "./multi-combobox";
import "./notifications-inbox";
import "./nps";
import "./number-field";
import "./object";
import "./object-page";
import "./otp";
import "./page";
import "./page-header";
import "./pagination";
import "./password-input";
import "./phone-input";
import "./pivot";
import "./popover";
import "./progress";
import "./qr-scanner";
import "./radio-group";
import "./rating";
import "./rich-text";
import "./scroll-area";
import "./search";
import "./select";
import "./select-dialog";
import "./sheet";
import "./shellbar";
import "./sidebar";
import "./skeleton";
import "./skip-to-content";
import "./slider";
import "./stack";
import "./theme";
import "./direction";
import "./message-popover";
import "./stat-card";
import "./stepper";
import "./switch";
import "./tabs";
import "./tag-input";
import "./textarea";
import "./time-picker";
import "./toast";
import "./toolbar";
import "./tooltip";
import "./tree";
import "./value-help";
import "./view-settings";
import "./virtualized-items";

/**
 * Idempotent: the elements self-register on the imports above. Returns the list of
 * registered tags so a consumer can enumerate or assert what is available.
 */
export function defineZenElements(): readonly string[] {
  return registeredTags;
}
