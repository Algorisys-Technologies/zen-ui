import { ChunkUploader, type ChunkUploaderProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-chunk-uploader chunk-size="5242880">
 *
 * Property-driven by necessity: `file` is a File and `uploadChunk` is a function,
 * and neither has an attribute form. The attributes here are the policy knobs
 * around them.
 *
 *   const el = document.querySelector("zen-chunk-uploader");
 *   el.uploadChunk = (blob, meta) => fetch(url(meta), { method: "POST", body: blob });
 *   el.file = input.files[0];
 *
 * `uploadChunk` is required by the factory, so the element defaults it to a
 * resolved promise — that renders the idle state rather than throwing on connect,
 * and an uploader with no endpoint has nothing to send anyway.
 *
 * `auto-start` and `show-progress` are json rather than boolean because both
 * default to TRUE; see the note in sortable-list.ts.
 */
defineZenElement<ChunkUploaderProps>({
  tag: "zen-chunk-uploader",
  factory: (props) => ChunkUploader({ ...props, uploadChunk: props.uploadChunk ?? (() => Promise.resolve()) }),
  attrs: {
    "chunk-size": "number",
    "max-attempts": "number",
    // Both default to TRUE — json, so absent means "unset" rather than false.
    "auto-start": "json",
    "show-progress": "json",
  },
  props: ["file", "uploadChunk", "onProgress", "onComplete", "onError"],
  events: { onProgress: "zen-progress", onComplete: "zen-complete", onError: "zen-error" },
  childrenProp: false,
});
