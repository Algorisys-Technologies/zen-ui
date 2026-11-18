// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …) is
// evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
import "virtual:uno.css";
import "./index.css";
import "./App.css";
import "./elements"; // registers every <zen-*> custom element

import { applyTheme, getInitialTheme } from "@algorisys/zen-ui-core/theme";
import { NAV } from "./nav";
import { navTag } from "./demos/nav-tag";
import { ThemeSwitcher } from "./demos/theme-switcher";
import { ReleaseNotes } from "./demos/release-notes";
import Welcome from "./demos/welcome";
import ButtonDemo from "./demos/button";
import BadgeDemo from "./demos/badge";
import IconDemo from "./demos/icon";
import AccordionDemo from "./demos/accordion";
import CollapsibleDemo from "./demos/collapsible";
import LabelDemo from "./demos/label";
import TabsDemo from "./demos/tabs";
import DialogDemo from "./demos/dialog";
import ShortcutsDemo from "./demos/shortcuts";
import InputDemo from "./demos/input";
import SearchDemo from "./demos/search";
import PasswordInputDemo from "./demos/password-input";
import SelectDemo from "./demos/select";
import ComboboxDemo from "./demos/combobox";
import TreeSelectDemo from "./demos/tree-select";
import LookupFieldDemo from "./demos/lookup-field";
import SeparatorDemo from "./demos/separator";
import ProgressDemo from "./demos/progress";
import LoadingDemo from "./demos/loading";
import SkeletonDemo from "./demos/skeleton";
import AvatarDemo from "./demos/avatar";
import LinkDemo from "./demos/link";
import ThemeDemo from "./demos/theme";
import LocaleDemo from "./demos/localization";
import DirectionDemo from "./demos/direction";
import MessagePopoverDemo from "./demos/message-popover";
import StackDemo from "./demos/stack";
import StatCardDemo from "./demos/stat-card";
import TileDemo from "./demos/tile";
import CardDemo from "./demos/card";
import PaperDemo from "./demos/paper";
import EmptyStateDemo from "./demos/empty-state";
import AlertDemo from "./demos/alert";
import FABDemo from "./demos/fab";
import BannerDemo from "./demos/banner";
import BreadcrumbDemo from "./demos/breadcrumb";
import PageDemo from "./demos/page";
import ObjectDemo from "./demos/object";
import SwitchDemo from "./demos/switch";
import PageHeaderDemo from "./demos/page-header";
import NumberFieldDemo from "./demos/number-field";
import AmountFieldDemo from "./demos/amount-field";
import TextareaDemo from "./demos/textarea";
import SliderDemo from "./demos/slider";
import CheckboxDemo from "./demos/checkbox";
import PhoneInputDemo from "./demos/phone-input";
import TimePickerDemo from "./demos/time-picker";
import RadioGroupDemo from "./demos/radio-group";
import TagInputDemo from "./demos/tag-input";
import PaginationDemo from "./demos/pagination";
import AlertDialogDemo from "./demos/alert-dialog";
import SheetDemo from "./demos/sheet";
import InputOTPDemo from "./demos/otp";
import PopoverDemo from "./demos/popover";
import TooltipDemo from "./demos/tooltip";
import ButtonFamilyDemo from "./demos/button-family";
import NpsDemo from "./demos/nps";
import TreeDemo from "./demos/tree";
import LikertDemo from "./demos/likert";
import RatingDemo from "./demos/rating";
import ScrollAreaDemo from "./demos/scroll-area";
import StepperDemo from "./demos/stepper";
import ToolbarDemo from "./demos/toolbar";
import DocumentTabsDemo from "./demos/document-tabs";
import CarouselDemo from "./demos/carousel";
import DropdownMenuDemo from "./demos/dropdown-menu";
import ContextMenuDemo from "./demos/context-menu";
import FileUploadDemo from "./demos/file-upload";
import ColorPickerDemo from "./demos/color-picker";
import MultiComboboxDemo from "./demos/multi-combobox";
import ShellBarDemo from "./demos/shellbar";
import SkipToContentDemo from "./demos/skip-to-content";
import SidebarDemo from "./demos/sidebar";
import DatePickerDemo from "./demos/date-picker";
import DateInputDemo from "./demos/date-input";
import NotificationsInboxDemo from "./demos/notifications-inbox";
import VirtualizedItemsDemo from "./demos/virtualized-items";
import FilterBarDemo from "./demos/filter-bar";
import FlexibleColumnLayoutDemo from "./demos/flexible-column-layout";
import SelectDialogDemo from "./demos/select-dialog";
import ValueHelpDemo from "./demos/value-help";
import DateTimePickerDemo from "./demos/date-time-picker";
import DateRangePickerDemo from "./demos/date-range-picker";
import DynamicPageDemo from "./demos/dynamic-page";
import ViewSettingsDemo from "./demos/view-settings";
import FilterBuilderDemo from "./demos/filter-builder";
import ViewManagerDemo from "./demos/view-manager";
import SelectableCardDemo from "./demos/selectable-card";
import ObjectPageLayoutDemo from "./demos/object-page";
import DynamicDateRangeDemo from "./demos/dynamic-date-range";
import CustomizingDemo from "./demos/customizing";
import LazyOptionsDemo from "./demos/lazy-options";
import ListReportDemo from "./demos/list-report";
import MaskInputDemo from "./demos/mask-input";
import NativeSelectDemo from "./demos/native-select";
import ToastDemo from "./demos/toast";
import RichTextDemo from "./demos/rich-text";
import CameraDemo from "./demos/camera";
import QRScannerDemo from "./demos/qr-scanner";
import BarcodeDemo from "./demos/barcode";
import MapDemo from "./demos/map";
import ChartDemo from "./demos/chart";
import AnalyticChartDemo from "./demos/analytic-chart";
import DataTableDemo from "./demos/data-table";
import TreeTableDemo from "./demos/tree-table";
import MicroChartDemo from "./demos/micro-chart";
import TimelineDemo from "./demos/timeline";
import UploadCollectionDemo from "./demos/upload-collection";
import PlanningCalendarDemo from "./demos/planning-calendar";
import GanttDemo from "./demos/gantt";
import ProductionScheduleDemo from "./demos/production-schedule";
import StatePillDemo from "./demos/state-pill";
import OeeGaugeDemo from "./demos/oee-gauge";
import StateTimelineDemo from "./demos/state-timeline";
import AndonDemo from "./demos/andon";
import ReasonCodePickerDemo from "./demos/reason-code-picker";
import ScanInputDemo from "./demos/scan-input";
import ProductionProgressDemo from "./demos/production-progress";
import MeasurementInputDemo from "./demos/measurement-input";
import StepRunnerDemo from "./demos/step-runner";
import LiveIndicatorDemo from "./demos/live-indicator";
import StatusBarDemo from "./demos/status-bar";
import ShiftNavigatorDemo from "./demos/shift-navigator";
import PlannedVsActualDemo from "./demos/planned-vs-actual";
import RateBarsDemo from "./demos/rate-bars";
import LineCardDemo from "./demos/line-card";
import CapacityHeatmapDemo from "./demos/capacity-heatmap";
import ColumnMapperDemo from "./demos/column-mapper";
import GenealogyGraphDemo from "./demos/genealogy-graph";
import RoutingGraphDemo from "./demos/routing-graph";
import FormDemo from "./demos/form";
import PivotDemo from "./demos/pivot";
import MediaTimelineDemo from "./demos/media-timeline";
import WaveformDemo from "./demos/waveform";
import CountdownDemo from "./demos/countdown";
import SpreadsheetGridDemo from "./demos/spreadsheet-grid";
import ProctorDemo from "./demos/proctor";
import ChunkUploaderDemo from "./demos/chunk-uploader";
import DiffViewDemo from "./demos/diff-view";
import SplitterDemo from "./demos/splitter";
import SortableListDemo from "./demos/sortable-list";
import CodeEditorDemo from "./demos/code-editor";
import DocumentViewerDemo from "./demos/document-viewer";
import DiagramCanvasDemo from "./demos/diagram-canvas";

/**
 * The route table. `bun run check:nav` re-derives route -> component -> file from
 * THIS object and compares it with nav.ts's `source` fields, so a demo that gets
 * renamed cannot leave a "View code" link pointing at the wrong file.
 */
const ROUTES: Record<string, () => HTMLElement> = {
  "/": Welcome,
  "/customizing": CustomizingDemo,
  "/button": ButtonDemo,
  "/badge": BadgeDemo,
  "/icon": IconDemo,
  "/accordion": AccordionDemo,
  "/collapsible": CollapsibleDemo,
  "/label": LabelDemo,
  "/native-select": NativeSelectDemo,
  "/tabs": TabsDemo,
  "/dialog": DialogDemo,
  "/input": InputDemo,
  "/search": SearchDemo,
  "/password-input": PasswordInputDemo,
  "/select": SelectDemo,
  "/combobox": ComboboxDemo,
  "/tree-select": TreeSelectDemo,
  "/lookup-field": LookupFieldDemo,
  "/separator": SeparatorDemo,
  "/progress": ProgressDemo,
  "/loading": LoadingDemo,
  "/skeleton": SkeletonDemo,
  "/avatar": AvatarDemo,
  "/link": LinkDemo,
  "/theme": ThemeDemo,
  "/localization": LocaleDemo,
  "/direction": DirectionDemo,
  "/message-popover": MessagePopoverDemo,
  "/stack": StackDemo,
  "/stat-card": StatCardDemo,
  "/tile": TileDemo,
  "/card": CardDemo,
  "/paper": PaperDemo,
  "/empty-state": EmptyStateDemo,
  "/alert": AlertDemo,
  "/fab": FABDemo,
  "/banner": BannerDemo,
  "/breadcrumb": BreadcrumbDemo,
  "/page": PageDemo,
  "/object": ObjectDemo,
  "/switch": SwitchDemo,
  "/page-header": PageHeaderDemo,
  "/number-field": NumberFieldDemo,
  "/amount-field": AmountFieldDemo,
  "/textarea": TextareaDemo,
  "/slider": SliderDemo,
  "/checkbox": CheckboxDemo,
  "/phone-input": PhoneInputDemo,
  "/time-picker": TimePickerDemo,
  "/radio-group": RadioGroupDemo,
  "/tag-input": TagInputDemo,
  "/pagination": PaginationDemo,
  "/alert-dialog": AlertDialogDemo,
  "/sheet": SheetDemo,
  "/otp": InputOTPDemo,
  "/mask-input": MaskInputDemo,
  "/popover": PopoverDemo,
  "/tooltip": TooltipDemo,
  "/button-family": ButtonFamilyDemo,
  "/nps": NpsDemo,
  "/tree": TreeDemo,
  "/likert": LikertDemo,
  "/rating": RatingDemo,
  "/scroll-area": ScrollAreaDemo,
  "/stepper": StepperDemo,
  "/toolbar": ToolbarDemo,
  "/document-tabs": DocumentTabsDemo,
  "/carousel": CarouselDemo,
  "/dropdown-menu": DropdownMenuDemo,
  "/context-menu": ContextMenuDemo,
  "/file-upload": FileUploadDemo,
  "/color-picker": ColorPickerDemo,
  "/multi-combobox": MultiComboboxDemo,
  "/skip-to-content": SkipToContentDemo,
  "/shellbar": ShellBarDemo,
  "/sidebar": SidebarDemo,
  "/date-input": DateInputDemo,
  "/date-picker": DatePickerDemo,
  "/notifications-inbox": NotificationsInboxDemo,
  "/virtualized-items": VirtualizedItemsDemo,
  "/lazy-options": LazyOptionsDemo,
  "/filter-bar": FilterBarDemo,
  "/flexible-column-layout": FlexibleColumnLayoutDemo,
  "/select-dialog": SelectDialogDemo,
  "/value-help": ValueHelpDemo,
  "/date-time-picker": DateTimePickerDemo,
  "/date-range-picker": DateRangePickerDemo,
  "/dynamic-page": DynamicPageDemo,
  "/view-settings": ViewSettingsDemo,
  "/filter-builder": FilterBuilderDemo,
  "/view-manager": ViewManagerDemo,
  "/selectable-card": SelectableCardDemo,
  "/object-page": ObjectPageLayoutDemo,
  "/dynamic-date-range": DynamicDateRangeDemo,
  "/list-report": ListReportDemo,
  "/toast": ToastDemo,
  "/shortcuts": ShortcutsDemo,
  "/rich-text": RichTextDemo,
  "/camera": CameraDemo,
  "/barcode": BarcodeDemo,
  "/qr-scanner": QRScannerDemo,
  "/map": MapDemo,
  "/chart": ChartDemo,
  "/analytic-chart": AnalyticChartDemo,
  "/data-table": DataTableDemo,
  "/tree-table": TreeTableDemo,
  "/micro-chart": MicroChartDemo,
  "/timeline": TimelineDemo,
  "/upload-collection": UploadCollectionDemo,
  "/planning-calendar": PlanningCalendarDemo,
  "/gantt": GanttDemo,
  "/production-schedule": ProductionScheduleDemo,
  "/state-pill": StatePillDemo,
  "/oee-gauge": OeeGaugeDemo,
  "/state-timeline": StateTimelineDemo,
  "/andon": AndonDemo,
  "/reason-code-picker": ReasonCodePickerDemo,
  "/scan-input": ScanInputDemo,
  "/production-progress": ProductionProgressDemo,
  "/measurement-input": MeasurementInputDemo,
  "/step-runner": StepRunnerDemo,
  "/live-indicator": LiveIndicatorDemo,
  "/status-bar": StatusBarDemo,
  "/shift-navigator": ShiftNavigatorDemo,
  "/planned-vs-actual": PlannedVsActualDemo,
  "/rate-bars": RateBarsDemo,
  "/line-card": LineCardDemo,
  "/capacity-heatmap": CapacityHeatmapDemo,
  "/column-mapper": ColumnMapperDemo,
  "/genealogy-graph": GenealogyGraphDemo,
  "/routing-graph": RoutingGraphDemo,
  "/form": FormDemo,
  "/pivot": PivotDemo,
  "/media-timeline": MediaTimelineDemo,
  "/waveform": WaveformDemo,
  "/countdown": CountdownDemo,
  "/spreadsheet-grid": SpreadsheetGridDemo,
  "/proctor": ProctorDemo,
  "/chunk-uploader": ChunkUploaderDemo,
  "/diff-view": DiffViewDemo,
  "/splitter": SplitterDemo,
  "/sortable-list": SortableListDemo,
  "/code-editor": CodeEditorDemo,
  "/document-viewer": DocumentViewerDemo,
  "/diagram-canvas": DiagramCanvasDemo,
};

/**
 * The deploy base, read back rather than hardcoded: "/builder-wc/" in dev and
 * "/zen-ui/builder-wc/" on Pages. deploy.sh is the only place that knows the
 * real base; hardcoding it here would be the second place, and they would drift.
 * A wrong base fails silently — the router matches nothing and renders a blank
 * page inside a working shell.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** The landing page, one level up from this demo. Mirrors React's ROOT_URL. */
const ROOT_URL = new URL("..", new URL(import.meta.env.BASE_URL, window.location.origin)).pathname;

/**
 * The component tally shown in the subtitle, derived from NAV exactly as React's
 * COMPONENT_COUNT is: skip sidebar-only groups (Getting started) and groups flagged
 * `components: false`, so nothing is double-counted.
 */
const COMPONENT_COUNT = NAV.filter((g) => g.catalogue !== false && g.components !== false).reduce(
  (sum, g) => sum + g.items.length,
  0,
);

const SOURCE_BASE = "https://github.com/Algorisys-Technologies/zen-ui/blob/main/";

/** The GitHub source for the current route, from nav.ts. Mirrors React's ViewCode. */
const sourceHref = (route: string): string | undefined => {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.to === route && item.source) return SOURCE_BASE + item.source;
    }
  }
  return undefined;
};

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

const path = () => {
  const p = window.location.pathname;
  const stripped = p.startsWith(BASE) ? p.slice(BASE.length) : p;
  return stripped === "" ? "/" : stripped;
};

const SIDEBAR_KEY = "zen-sidebar-collapsed";

/**
 * The shell's class names are App.css's contract, copied from the React demo along
 * with the stylesheet. They are not decorative: invent your own and the CSS
 * matches nothing, which renders a working page with no layout — every nav link
 * run together on one line, which is exactly what the first version of this did.
 */
function shell() {
  const root = document.getElementById("root")!;
  const app = el("div", "app-shell");

  const header = el("header", "app-header");
  const left = el("div", "app-header-left");

  const toggle = el("button", "sidebar-toggle");
  toggle.type = "button";
  toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

  const headerText = el("div", "app-header-text");
  headerText.append(
    el("h1", "app-title", "Zen UI · Web Components"),
    el(
      "p",
      "app-subtitle",
      `Native custom-element component library by Algorisys · ${COMPONENT_COUNT} components`,
    ),
  );
  left.append(toggle, headerText);

  // Order and content mirror the React demo's header: All-demos link, View-code
  // link, theme switcher. "← All demos", not "All bindings", to match.
  const actions = el("div", "app-header-actions");

  const home = el("a", "app-home-link");
  home.href = ROOT_URL;
  home.innerHTML = '<span aria-hidden="true">←</span> All demos';

  // A real anchor: it leaves the SPA for the root site, so the router must not
  // intercept it (no click handler here on purpose).
  const viewCode = el("a", "app-home-link");
  viewCode.target = "_blank";
  viewCode.rel = "noreferrer noopener";
  viewCode.title = "The demo source for this page on GitHub";
  viewCode.innerHTML = 'View code <span aria-hidden="true">↗</span>';

  const theme = ThemeSwitcher();
  actions.append(home, viewCode, theme.el);
  header.append(left, actions);

  const body = el("div", "app-body");
  const sidebar = el("aside", "sidebar");

  /**
   * The sidebar filtered by the search box — this binding's own <zen-search>
   * element, dogfooded (the vanilla demo uses the factory; this one uses the
   * declarative layer). Matches the label AND the nav description, so "wizard"
   * finds Stepper; a group with no hits disappears rather than sitting as an
   * empty heading. Rebuilding on each keystroke re-derives the active link
   * from path(), because the links are new nodes each time and render()'s
   * repaint only runs on navigation.
   */
  const searchWrap = el("div", "sidebar-search");
  const searchField = document.createElement("zen-search");
  searchField.setAttribute("size", "sm");
  searchField.setAttribute("placeholder", "Search components");
  searchField.setAttribute("aria-label", "Search components");
  searchField.addEventListener("zen-value-change", (e) => {
    renderGroups(String((e as CustomEvent).detail ?? ""));
  });
  searchWrap.append(searchField);
  const groupsHost = el("div");
  sidebar.append(searchWrap, groupsHost);

  const renderGroups = (query = "") => {
    const q = query.trim().toLowerCase();
    const active = path() in ROUTES ? path() : "/";
    const groups: HTMLElement[] = [];
    for (const group of NAV) {
      const items = !q
        ? group.items
        : group.items.filter(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              (item.description?.toLowerCase().includes(q) ?? false),
          );
      if (items.length === 0) continue;
      const g = el("div", "sidebar-group");
      g.append(el("h4", "sidebar-group-title", group.title));
      const ul = el("ul", "sidebar-list");
      for (const item of items) {
        const li = el("li");
        const isActive = item.to === active;
        const a = el(
          "a",
          `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`,
          item.label,
        );
        const tag = navTag(item, "zen-ml-1.5");
        if (tag) a.append(tag);
        a.href = `${BASE}${item.to}`;
        a.dataset.route = item.to;
        if (isActive) a.setAttribute("aria-current", "page");
        a.addEventListener("click", (e) => {
          // Intercept only a plain left click: ctrl/cmd/shift/middle must still open
          // a new tab. An <a> that swallows them is a broken link.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          navigate(item.to);
        });
        li.append(a);
        ul.append(li);
      }
      g.append(ul);
      groups.push(g);
    }
    groupsHost.replaceChildren(
      ...(groups.length ? groups : [el("p", "sidebar-empty", `No components match “${query}”.`)]),
    );
  };
  renderGroups();

  const content = el("main", "app-content");
  body.append(sidebar, content);

  // Footer mirrors the React demo: copyright + tagline on the left, the version
  // chip (which opens the release notes) on the right.
  const footer = el("footer", "app-footer");
  const copy = el("span");
  const algorisys = el("a", undefined, "Algorisys Technologies Pvt. Ltd");
  algorisys.href = "https://www.algorisys.com";
  algorisys.target = "_blank";
  algorisys.rel = "noreferrer noopener";
  // The licence, where someone evaluating the library is already looking.
  // "Noncommercial" is the fact they need; the link carries the rest. Stated as
  // what they MAY do, because a footer that only names a licence makes a reader
  // go and find out what it means.
  const licence = el("a", undefined, "Free for noncommercial use");
  licence.href = "https://github.com/Algorisys-Technologies/zen-ui/blob/main/LICENSE";
  licence.target = "_blank";
  licence.rel = "noreferrer noopener";
  copy.append(
    document.createTextNode(`© ${new Date().getFullYear()} `),
    algorisys,
    el("span", "app-footer-sep", "·"),
    document.createTextNode("zen-ui · web-components binding"),
    el("span", "app-footer-sep", "·"),
    licence,
  );
  const notes = ReleaseNotes();
  footer.append(copy, notes.el);

  app.append(header, body, footer);
  root.append(app);

  let collapsed = localStorage.getItem(SIDEBAR_KEY) === "true";
  const paintSidebar = () => {
    sidebar.classList.toggle("is-collapsed", collapsed);
    sidebar.setAttribute("aria-hidden", String(collapsed));
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Open sidebar" : "Close sidebar");
  };
  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    paintSidebar();
  });
  paintSidebar();

  return { sidebar, content, viewCode };
}

const { sidebar, content, viewCode } = shell();

function render() {
  const to = path();
  const page = ROUTES[to] ?? ROUTES["/"];
  const active = to in ROUTES ? to : "/";
  content.replaceChildren(page());
  for (const a of sidebar.querySelectorAll<HTMLAnchorElement>("a[data-route]")) {
    const isActive = a.dataset.route === active;
    a.className = `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`;
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  // View-code points at THIS route's demo source, and is hidden where there is
  // none (the Welcome page) — matching React's ViewCode returning null.
  const src = sourceHref(active);
  if (src) {
    viewCode.href = src;
    viewCode.style.display = "";
  } else {
    viewCode.style.display = "none";
  }
  window.scrollTo(0, 0);
}

function navigate(to: string) {
  window.history.pushState({}, "", `${BASE}${to}`);
  render();
}

window.addEventListener("popstate", render);

/**
 * Deep-link re-entry. `/zen-ui/builder-wc/tabs` is not a file, so Pages serves
 * the root 404.html, which works out which app was wanted and bounces here with the
 * route in `?p=`. Same shim the other two demos use.
 */
const p = new URLSearchParams(window.location.search).get("p");
if (p) window.history.replaceState({}, "", `${BASE}/${p.replace(/^\//, "")}`);

/** Theme is CSS-driven: toggling data-theme on <html> is the whole mechanism. */
applyTheme(getInitialTheme());

render();
