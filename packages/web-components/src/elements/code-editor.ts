import {
  CodeEditor,
  IDEWindow,
  type CodeEditorProps,
  type IDEWindowProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-code-editor language="python" value="print(1)">
 * <zen-ide-window files='[{"path":"main.py","content":"…"}]'>
 *
 * Monaco arrives through `@monaco-editor/loader`, an optional peer of the
 * vanilla binding. Absent, or unreachable, the component renders the install
 * message rather than throwing — which is the behaviour a declarative element
 * needs most, since there is no error boundary to put around a custom element.
 *
 * `value` as an attribute suits a seeded snippet; anything long is a property.
 * `line-numbers` is json rather than boolean because it defaults to TRUE; see
 * the note in sortable-list.ts.
 *
 * IDEWindow takes its toolbar from light-DOM children — the one element in this
 * pair with a slot, because a Run button really is markup a caller writes.
 */
defineZenElement<CodeEditorProps>({
  tag: "zen-code-editor",
  factory: CodeEditor,
  attrs: {
    value: "string",
    language: "string",
    theme: "string",
    "font-size": "number",
    "read-only": "boolean",
    height: "string",
    minimap: "boolean",
    // Defaults to TRUE — json, so absent means "unset" rather than false.
    "line-numbers": "json",
    options: "json",
    "loader-config": "json",
  },
  props: ["options", "loaderConfig", "onChange", "onRun", "onMount", "loading"],
  events: { onChange: "zen-change", onRun: "zen-run" },
  childrenProp: false,
});

defineZenElement<IDEWindowProps>({
  tag: "zen-ide-window",
  factory: IDEWindow,
  attrs: {
    files: "json",
    "active-path": "string",
    "default-active-path": "string",
    theme: "string",
    "font-size": "number",
    height: "string",
    minimap: "boolean",
    "line-numbers": "json",
    options: "json",
    "loader-config": "json",
  },
  props: ["files", "options", "loaderConfig", "onActivePathChange", "onFileChange", "onRun", "onMount"],
  events: {
    onActivePathChange: "zen-active-path-change",
    onFileChange: "zen-file-change",
    onRun: "zen-run",
  },
  childrenProp: "toolbar",
});
