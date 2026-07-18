import { FileUpload, type FileUploadProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `value`/`defaultValue` are File[] — never serialisable to an attribute — so
// they are JS properties. `label`/`helperText` are Child (node or string) →
// props. `showFileList` defaults TRUE, so it is a prop. onValueChange/onError
// are notification callbacks → CustomEvents.
defineZenElement<FileUploadProps>({
  tag: "zen-file-upload",
  factory: FileUpload,
  attrs: {
    "max-size": "number",
    "max-files": "number",
    multiple: "boolean",
    disabled: "boolean",
    accept: "string",
    name: "string",
  },
  props: ["value", "defaultValue", "label", "helperText", "showFileList"],
  events: { onValueChange: "zen-value-change", onError: "zen-error" },
  childrenProp: false,
});
