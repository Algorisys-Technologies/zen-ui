import { NativeSelect, type NativeSelectProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-native-select name="dept_id" options='[{"value":"1","label":"Sales"}]'>
//
// Data-driven from `options`, like every other list family here, so
// `childrenProp` is false. `options` is authorable inline as JSON or set as a
// property.
//
// `value` is the CONTROLLED prop and stays a JS property: a string attribute
// could carry it, but the pattern this binding follows is that the controlled
// half is a property and the uncontrolled seed is the attribute.
//
// `input-id` lands on the inner <select>, as on <zen-tree-select>,
// <zen-lookup-field> and <zen-date-input>: the host is a `display: contents`
// wrapper, and an id on the host is an id on something `<label for>` cannot
// name. The attribute is named for where it goes, so the host's `id` stays the
// host's.
//
//   <zen-label for="dept">Department</zen-label>
//   <zen-native-select input-id="dept" options='[…]'></zen-native-select>
type NativeSelectElementProps = Omit<NativeSelectProps, "id"> & { inputId?: string };

const toFactory = ({ inputId, ...rest }: Partial<NativeSelectElementProps>): Partial<NativeSelectProps> => ({
  ...rest,
  id: inputId,
});

defineZenElement<NativeSelectElementProps>({
  tag: "zen-native-select",
  factory: (props) => {
    const inner = NativeSelect(toFactory(props) as NativeSelectProps);
    return {
      el: inner.el,
      update: (next) => {
        inner.update(toFactory(next));
        // vanilla's update() merges and skips an undefined prop rather than
        // removing it: clear the id here when the attribute goes.
        if ("inputId" in next && next.inputId == null) inner.el.removeAttribute("id");
      },
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    options: "json",
    "default-value": "string",
    name: "string",
    disabled: "boolean",
    required: "boolean",
    "input-id": "string",
  },
  props: ["options", "value"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
