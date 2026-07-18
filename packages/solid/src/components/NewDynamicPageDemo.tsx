import { createSignal, Index } from "solid-js";
import {
  DynamicPage,
  DynamicPageTitle,
  DynamicPageHeader,
  DynamicPageFooter,
} from "./dynamic-page/dynamic-page";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb/breadcrumb";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * DynamicPage demo — mirrors the React binding's sections. Every section gives
 * the page an explicit HEIGHT, because a page free to grow to its content never
 * scrolls and so never snaps — and this demo shell's own scroller
 * (.app-content) would happily let it grow forever.
 */

const Fact = (props: { label: string; value: string }) => (
  <div class="zen-min-w-0">
    <div class="zen-text-xs zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
      {props.label}
    </div>
    <div class="zen-truncate zen-text-sm zen-font-medium">{props.value}</div>
  </div>
);

const HeaderFacts = () => (
  <div class="zen-grid zen-grid-cols-2 zen-gap-3 sm:zen-grid-cols-4">
    <Fact label="Customer" value="Acme Corporation" />
    <Fact label="Delivery" value="14 Aug 2026" />
    <Fact label="Net value" value="€ 48,200.00" />
    <Fact label="Incoterms" value="DAP Hamburg" />
  </div>
);

const Rows = (props: { count?: number }) => (
  <div class="zen-flex zen-flex-col zen-gap-2 zen-p-4">
    <Index each={Array.from({ length: props.count ?? 24 }, (_, i) => i)}>
      {(i) => (
        <div class="zen-flex zen-items-center zen-justify-between zen-rounded-zen-md zen-border zen-border-zen-border zen-px-3 zen-py-2 zen-text-sm">
          <span>Line item {String(i() + 1).padStart(2, "0")}</span>
          <span class="zen-text-zen-muted-fg">€ {(120 + i() * 37).toLocaleString()}.00</span>
        </div>
      )}
    </Index>
  </div>
);

const NewDynamicPageDemo = () => {
  const [expanded, setExpanded] = createSignal(true);

  return (
    <DemoPage
      title="DynamicPage"
      description={
        <>
          A page whose header <strong>snaps</strong> — collapses — as the content
          scrolls, leaving the title bar sticky behind it, plus an optional
          floating footer. This is the frame under the List Report and Object
          Page. Snapping is driven by the page's own scroll container, never by{" "}
          <code>window</code>, so it works inside any container — including this
          demo shell, where the document itself does not scroll at all.
        </>
      }
    >
      <DemoSection
        title="1. Snapping — scroll the content"
        codeTitle="The header collapses; the title stays"
        codeDescription="Scroll inside the page. The header content snaps away and the title bar remains fixed at the top. Scroll back to the very top and it expands again."
        code={`<DynamicPage class="zen-h-[420px] zen-rounded-zen-md zen-border zen-border-zen-border">
  <DynamicPageTitle
    heading="Order 4711"
    subheading="Acme Corporation"
    actions={<Button size="sm" variant="solid" color="primary">Save</Button>}
  />
  <DynamicPageHeader aria-label="Order details">
    <HeaderFacts />
  </DynamicPageHeader>
  <Rows />
</DynamicPage>`}
      >
        <DynamicPage class="zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <DynamicPageTitle
            heading="Order 4711"
            subheading="Acme Corporation"
            actions={
              <Button type="button" size="sm" variant="solid" color="primary">
                Save
              </Button>
            }
          />
          <DynamicPageHeader aria-label="Order details">
            <HeaderFacts />
          </DynamicPageHeader>
          <Rows />
        </DynamicPage>
      </DemoSection>

      <DemoSection
        title="2. Pinning holds the header open"
        codeTitle="headerPinnable (default true)"
        codeDescription="Press the pin in the header's trailing edge, then scroll: the header stays expanded and rides along under the title instead of snapping away. Press it again to release."
        code={`<DynamicPage headerPinnable class="zen-h-[420px]">
  <DynamicPageTitle heading="Order 4711" subheading="Pin me, then scroll" />
  <DynamicPageHeader aria-label="Order details">
    <HeaderFacts />
  </DynamicPageHeader>
  <Rows />
</DynamicPage>`}
      >
        <DynamicPage class="zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <DynamicPageTitle heading="Order 4711" subheading="Pin me, then scroll" />
          <DynamicPageHeader aria-label="Order details (pinnable)">
            <HeaderFacts />
          </DynamicPageHeader>
          <Rows />
        </DynamicPage>
      </DemoSection>

      <DemoSection
        title="3. Different title content when snapped"
        codeTitle="expandedContent / snappedContent"
        codeDescription="The page shows different title content once the header is gone — the facts you would otherwise lose. Scroll to swap the two."
        code={`<DynamicPageTitle
  heading="Order 4711"
  breadcrumbs={<Breadcrumb>…</Breadcrumb>}
  expandedContent={<p>Created 2 Aug 2026 by R. Pillai</p>}
  snappedContent={<Badge variant="soft" color="success">€ 48,200.00 · Confirmed</Badge>}
/>`}
      >
        <DynamicPage class="zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <DynamicPageTitle
            heading="Order 4711"
            breadcrumbs={
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Sales</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Orders</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>4711</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            }
            expandedContent={
              <p class="zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg">
                Created 2 Aug 2026 by R. Pillai
              </p>
            }
            snappedContent={
              <div class="zen-px-1 zen-pt-1">
                <Badge variant="soft" color="success">
                  € 48,200.00 · Confirmed
                </Badge>
              </div>
            }
          />
          <DynamicPageHeader aria-label="Order details (snapped content)">
            <HeaderFacts />
          </DynamicPageHeader>
          <Rows />
        </DynamicPage>
      </DemoSection>

      <DemoSection
        title="4. Floating footer"
        codeTitle="DynamicPageFooter + showFooter"
        codeDescription="The footer floats above the scrolling content and stays put. showFooter toggles it without unmounting the page."
        code={`<DynamicPage showFooter={showFooter()} class="zen-h-[420px]">
  <DynamicPageTitle heading="Order 4711" />
  <DynamicPageHeader aria-label="Order details"><HeaderFacts /></DynamicPageHeader>
  <Rows />
  <DynamicPageFooter>
    <Button size="sm" variant="ghost">Cancel</Button>
    <Button size="sm" variant="solid" color="primary">Submit</Button>
  </DynamicPageFooter>
</DynamicPage>`}
      >
        <DynamicPage class="zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <DynamicPageTitle heading="Order 4711" subheading="With a floating footer" />
          <DynamicPageHeader aria-label="Order details (footer)">
            <HeaderFacts />
          </DynamicPageHeader>
          <Rows />
          <DynamicPageFooter>
            <Button type="button" size="sm" variant="ghost">
              Cancel
            </Button>
            <Button type="button" size="sm" variant="solid" color="primary">
              Submit
            </Button>
          </DynamicPageFooter>
        </DynamicPage>
      </DemoSection>

      <DemoSection
        title="5. Controlled"
        codeTitle="headerExpanded + onHeaderExpandedChange"
        codeDescription="Drive the header from outside. Scrolling and clicking the title still report through onHeaderExpandedChange — the page never owns the state."
        code={`const [expanded, setExpanded] = createSignal(true);

<DynamicPage
  headerExpanded={expanded()}
  onHeaderExpandedChange={setExpanded}
  headerPinnable={false}
  class="zen-h-[420px]"
>
  …
</DynamicPage>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <div class="zen-flex zen-items-center zen-gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setExpanded(!expanded())}>
              {expanded() ? "Collapse" : "Expand"} header
            </Button>
            <span class="zen-text-xs zen-text-zen-muted-fg">
              headerExpanded = {String(expanded())}
            </span>
          </div>
          <DynamicPage
            headerExpanded={expanded()}
            onHeaderExpandedChange={setExpanded}
            headerPinnable={false}
            class="zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
          >
            <DynamicPageTitle heading="Order 4711" subheading="Controlled header" />
            <DynamicPageHeader aria-label="Order details (controlled)">
              <HeaderFacts />
            </DynamicPageHeader>
            <Rows />
          </DynamicPage>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewDynamicPageDemo;
