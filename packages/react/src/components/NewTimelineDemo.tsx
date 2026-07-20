import { Timeline, type TimelineItem } from "./timeline/timeline";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const ORDER: TimelineItem[] = [
  {
    id: "1",
    group: "Today",
    state: "success",
    icon: "check-circle",
    title: "Delivered",
    timestamp: "09:14",
    dateTime: "2026-07-21T09:14",
    description: "Signed for by R. Iyer at the loading bay.",
  },
  {
    id: "2",
    group: "Today",
    state: "info",
    title: "Out for delivery",
    timestamp: "06:02",
    dateTime: "2026-07-21T06:02",
  },
  {
    id: "3",
    group: "Yesterday",
    state: "warning",
    title: "Held at customs",
    timestamp: "17:40",
    dateTime: "2026-07-20T17:40",
    description: "Commercial invoice missing a HS code. Resolved by the broker.",
  },
  {
    id: "4",
    group: "Yesterday",
    title: "Departed Rotterdam",
    timestamp: "04:15",
    dateTime: "2026-07-20T04:15",
  },
  {
    id: "5",
    group: "18 July",
    title: "Order placed",
    timestamp: "11:30",
    dateTime: "2026-07-18T11:30",
    description: "PO-4417 · 3 line items · €12,480",
  },
];

/* Same events without their group headings, for section 1. Built by deleting
   the key rather than destructuring it into an unused binding. */
const PLAIN: TimelineItem[] = ORDER.map((item) => {
  const copy = { ...item };
  delete copy.group;
  return copy;
});

const NewTimelineDemo = () => (
  <div className="demo-page">
    <h1>Timeline</h1>
    <p className="lede">
      A sequence of things that happened, in order — an audit trail, an order's
      history, a ticket's comments. Renders an ordered list, because the order{" "}
      <em>is</em> the content.
    </p>

      <section className="demo-section">
        <h2>1. A list of events</h2>
        <CodeExample title={'Data-driven: pass items, not compound parts'} description={"The shape is always the same — a rail, a marker, a time, a body — so compound children would only let you build one that is subtly wrong: a marker with no rail, or two rails. Every item needs an id and a title; everything else is optional. The rail is hidden on the last item, because a line running past the final event reads as 'more below', which is exactly wrong at the end."} code={`const items = [
  { id: "1", title: "Delivered", timestamp: "09:14", state: "success" },
  { id: "2", title: "Out for delivery", timestamp: "06:02", state: "info" },
  { id: "3", title: "Order placed", timestamp: "11:30" },
];

<Timeline items={items} />`}>
          <Timeline items={PLAIN} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Groups are a string on the item</h2>
        <CodeExample title={'group, not groupBy'} description={"A run of items sharing a group gets one heading. It is a string you set rather than a function that derives it, because you already know whether two events fall on the same day — deriving it here would mean guessing at your timezone and your idea of 'today', and getting that wrong is worse than not offering it. The heading is not a list item, so it does not inflate the count a screen reader announces."} code={`const items = [
  { id: "1", group: "Today",     title: "Delivered" },
  { id: "2", group: "Today",     title: "Out for delivery" },
  { id: "3", group: "Yesterday", title: "Held at customs" },
];

<Timeline items={items} />`}>
          <Timeline items={ORDER} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. State and icons</h2>
        <CodeExample title={'The same five words the rest of the library uses'} description={"default, info, success, warning, error — colouring the marker. Pass an icon and it replaces the dot entirely, which is worth doing when the kind of event matters more than its position. The marker is aria-hidden either way: it repeats what the title already says, and a screen reader announcing 'image, check circle' before every entry is noise."} code={`{ id: "1", title: "Delivered",       state: "success", icon: "check-circle" }
{ id: "2", title: "Held at customs", state: "warning" }
{ id: "3", title: "Departed" }                        // default`}>
          <Timeline
            items={[
              { id: "a", title: "Approved", state: "success", icon: "check-circle", timestamp: "just now" },
              { id: "b", title: "Changes requested", state: "warning", timestamp: "2h" },
              { id: "c", title: "Rejected", state: "error", icon: "x-circle", timestamp: "1d" },
              { id: "d", title: "Submitted", state: "info", timestamp: "2d" },
              { id: "e", title: "Drafted", timestamp: "3d" },
            ]}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Richer bodies</h2>
        <CodeExample title={'children on an item'} description={"A description is a line of prose; children is anything else — a diff, a quote, an attachment, a set of badges. It sits under the description and inherits the rail's indent, so a wide body still lines up with the rest of the column."} code={`{
  id: "1",
  title: "Deployment finished",
  description: "3 services updated.",
  children: <div><Badge>api</Badge> <Badge>web</Badge></div>,
}`}>
          <Timeline
            items={[
              {
                id: "x",
                title: "Deployment finished",
                timestamp: "09:14",
                state: "success",
                description: "3 services updated, no rollbacks.",
                children: (
                  <div className="zen-flex zen-flex-wrap zen-gap-1">
                    <Badge>api</Badge>
                    <Badge>web</Badge>
                    <Badge>worker</Badge>
                  </div>
                ),
              },
              { id: "y", title: "Build passed", timestamp: "09:02", description: "1,284 tests, 41s." },
            ]}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Compact</h2>
        <CodeExample title={'For a sidebar, where the timeline is context not subject'} description={"density='compact' tightens the spacing and drops the description and body, keeping the title and time. That is a deliberate omission rather than a smaller font: in a narrow column a two-line description wraps to five and the sequence stops being scannable, which is the only reason the timeline was there."} code={`<Timeline items={items} density="compact" />`}>
          <div className="zen-max-w-xs zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3">
            <Timeline items={ORDER} density="compact" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Empty</h2>
        <CodeExample title={'emptyMessage'} description={'An empty timeline renders the message instead of a bare rail. A rail with no markers looks like a component that failed to load rather than a history with nothing in it yet.'} code={`<Timeline items={[]} emptyMessage="No activity on this order yet" />`}>
          <Timeline items={[]} emptyMessage="No activity on this order yet" />
        </CodeExample>
      </section>

  </div>
);

export default NewTimelineDemo;
