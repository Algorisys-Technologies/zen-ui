import { StepRunner, type StepRunnerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-step-runner steps='[…]'></zen-step-runner>
 *
 * `steps`, `records` and `default-records` are JSON attributes or properties.
 * A step's `instructions` may be a Node when `steps` is set as a property; from
 * the attribute it is text.
 *
 * Controlled like <zen-production-schedule>: `zen-records-change` carries the
 * next records in `detail`, and the element shows them once you hand them back
 * (`el.records = e.detail`) — that hand-back is what lets the caller persist a
 * run, or refuse a write. Leave `records` unset and it keeps its own, seeded by
 * `default-records`.
 *
 * `sequential` defaults to TRUE, so it is a property (`el.sequential = false`),
 * not a boolean attribute: an absent attribute reads as false and would unlock
 * every step. `allow-failed-measurement` defaults to false and is an attribute.
 *
 * Events: `zen-records-change` (records), `zen-step-complete` ([step, record]),
 * `zen-report-issue` (step), `zen-complete` (records). No slot.
 */
defineZenElement<StepRunnerProps>({
  tag: "zen-step-runner",
  factory: StepRunner,
  attrs: {
    steps: "json",
    records: "json",
    "default-records": "json",
    "allow-failed-measurement": "boolean",
    label: "string",
  },
  props: ["steps", "records", "defaultRecords", "sequential"],
  events: {
    onRecordsChange: "zen-records-change",
    onStepComplete: "zen-step-complete",
    onReportIssue: "zen-report-issue",
    onComplete: "zen-complete",
  },
  childrenProp: false,
});
