import { OeeGauge, type OeeGaugeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-oee-gauge value="0.724" label="Press 4"
 *   factors='{"availability":0.875,"performance":0.905,"quality":0.95}'>
 *
 * `value` is a fraction, as in the factory. An ABSENT `value` is `null` — "no
 * data", an empty track and a dash — rather than undefined, because that is the
 * only way markup can say null, and a gauge with no value has nothing else to
 * mean. `el.value = null` removes the attribute and lands in the same place.
 *
 * `factors` and `bands` are json and properties; `oeeFromCounts()`'s result can
 * be assigned to `factors` directly.
 *
 * No slot: the gauge is drawn from its props.
 */
defineZenElement<OeeGaugeProps>({
  tag: "zen-oee-gauge",
  factory: (props) => OeeGauge({ ...props, value: props.value ?? null }),
  attrs: {
    value: "number",
    factors: "json",
    bands: "json",
    label: "string",
    size: "string",
  },
  props: ["factors", "bands"],
  childrenProp: false,
});
