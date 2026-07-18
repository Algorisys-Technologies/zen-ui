import "./index.css";
// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …) is
// evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
import "virtual:uno.css";
import "./App.css";

import { applyTheme, getInitialTheme } from "@algorisys/zen-ui-core/theme";
import { NAV } from "./nav";
import { ThemeSwitcher } from "./components/theme-switcher";
import { ReleaseNotes } from "./components/ReleaseNotes";
import Welcome from "./components/Welcome";
import ButtonDemo from "./components/ButtonDemo";
import BadgeDemo from "./components/BadgeDemo";
import IconDemo from "./components/IconDemo";
import AccordionDemo from "./components/AccordionDemo";
import TabsDemo from "./components/TabsDemo";
import DialogDemo from "./components/DialogDemo";
import InputDemo from "./components/InputDemo";
import SearchDemo from "./components/SearchDemo";
import PasswordInputDemo from "./components/PasswordInputDemo";
import SelectDemo from "./components/SelectDemo";
import ComboboxDemo from "./components/ComboboxDemo";
import SeparatorDemo from "./components/SeparatorDemo";
import ProgressDemo from "./components/ProgressDemo";
import LoadingDemo from "./components/LoadingDemo";
import SkeletonDemo from "./components/SkeletonDemo";
import AvatarDemo from "./components/AvatarDemo";
import LinkDemo from "./components/LinkDemo";
import StackDemo from "./components/StackDemo";
import StatCardDemo from "./components/StatCardDemo";
import CardDemo from "./components/CardDemo";
import EmptyStateDemo from "./components/EmptyStateDemo";
import AlertDemo from "./components/AlertDemo";
import FABDemo from "./components/FABDemo";
import BannerDemo from "./components/BannerDemo";
import BreadcrumbDemo from "./components/BreadcrumbDemo";
import PageDemo from "./components/PageDemo";
import ObjectDemo from "./components/ObjectDemo";
import SwitchDemo from "./components/SwitchDemo";
import PageHeaderDemo from "./components/PageHeaderDemo";
import NumberFieldDemo from "./components/NumberFieldDemo";
import TextareaDemo from "./components/TextareaDemo";
import SliderDemo from "./components/SliderDemo";
import CheckboxDemo from "./components/CheckboxDemo";
import PhoneInputDemo from "./components/PhoneInputDemo";
import TimePickerDemo from "./components/TimePickerDemo";
import RadioGroupDemo from "./components/RadioGroupDemo";
import TagInputDemo from "./components/TagInputDemo";
import PaginationDemo from "./components/PaginationDemo";
import AlertDialogDemo from "./components/AlertDialogDemo";
import SheetDemo from "./components/SheetDemo";
import InputOTPDemo from "./components/InputOTPDemo";
import PopoverDemo from "./components/PopoverDemo";
import TooltipDemo from "./components/TooltipDemo";
import ButtonFamilyDemo from "./components/ButtonFamilyDemo";
import NpsDemo from "./components/NpsDemo";
import TreeDemo from "./components/TreeDemo";
import LikertDemo from "./components/LikertDemo";
import RatingDemo from "./components/RatingDemo";
import ScrollAreaDemo from "./components/ScrollAreaDemo";
import StepperDemo from "./components/StepperDemo";
import ToolbarDemo from "./components/ToolbarDemo";
import CarouselDemo from "./components/CarouselDemo";
import DropdownMenuDemo from "./components/DropdownMenuDemo";
import FileUploadDemo from "./components/FileUploadDemo";
import ColorPickerDemo from "./components/ColorPickerDemo";
import MultiComboboxDemo from "./components/MultiComboboxDemo";
import ShellBarDemo from "./components/ShellBarDemo";
import SkipToContentDemo from "./components/SkipToContentDemo";
import SidebarDemo from "./components/SidebarDemo";
import DatePickerDemo from "./components/DatePickerDemo";
import NotificationsInboxDemo from "./components/NotificationsInboxDemo";
import VirtualizedItemsDemo from "./components/VirtualizedItemsDemo";
import FilterBarDemo from "./components/FilterBarDemo";
import FlexibleColumnLayoutDemo from "./components/FlexibleColumnLayoutDemo";
import SelectDialogDemo from "./components/SelectDialogDemo";
import ValueHelpDemo from "./components/ValueHelpDemo";
import DateTimePickerDemo from "./components/DateTimePickerDemo";
import DateRangePickerDemo from "./components/DateRangePickerDemo";
import DynamicPageDemo from "./components/DynamicPageDemo";
import ViewSettingsDemo from "./components/ViewSettingsDemo";
import SelectableCardDemo from "./components/SelectableCardDemo";
import ObjectPageLayoutDemo from "./components/ObjectPageLayoutDemo";
import DynamicDateRangeDemo from "./components/DynamicDateRangeDemo";
import ToastDemo from "./components/ToastDemo";
import RichTextDemo from "./components/RichTextDemo";
import CameraDemo from "./components/CameraDemo";
import QRScannerDemo from "./components/QRScannerDemo";
import MapDemo from "./components/MapDemo";
import ChartDemo from "./components/ChartDemo";
import DataTableDemo from "./components/DataTableDemo";
import FormDemo from "./components/FormDemo";
import PivotDemo from "./components/PivotDemo";

/**
 * The route table. `bun run check:nav` re-derives route -> component -> file from
 * THIS object and compares it with nav.ts's `source` fields, so a demo that gets
 * renamed cannot leave a "View code" link pointing at the wrong file.
 */
const ROUTES: Record<string, () => HTMLElement> = {
  "/": Welcome,
  "/button": ButtonDemo,
  "/badge": BadgeDemo,
  "/icon": IconDemo,
  "/accordion": AccordionDemo,
  "/tabs": TabsDemo,
  "/dialog": DialogDemo,
  "/input": InputDemo,
  "/search": SearchDemo,
  "/password-input": PasswordInputDemo,
  "/select": SelectDemo,
  "/combobox": ComboboxDemo,
  "/separator": SeparatorDemo,
  "/progress": ProgressDemo,
  "/loading": LoadingDemo,
  "/skeleton": SkeletonDemo,
  "/avatar": AvatarDemo,
  "/link": LinkDemo,
  "/stack": StackDemo,
  "/stat-card": StatCardDemo,
  "/card": CardDemo,
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
  "/carousel": CarouselDemo,
  "/dropdown-menu": DropdownMenuDemo,
  "/file-upload": FileUploadDemo,
  "/color-picker": ColorPickerDemo,
  "/multi-combobox": MultiComboboxDemo,
  "/skip-to-content": SkipToContentDemo,
  "/shellbar": ShellBarDemo,
  "/sidebar": SidebarDemo,
  "/date-picker": DatePickerDemo,
  "/notifications-inbox": NotificationsInboxDemo,
  "/virtualized-items": VirtualizedItemsDemo,
  "/filter-bar": FilterBarDemo,
  "/flexible-column-layout": FlexibleColumnLayoutDemo,
  "/select-dialog": SelectDialogDemo,
  "/value-help": ValueHelpDemo,
  "/date-time-picker": DateTimePickerDemo,
  "/date-range-picker": DateRangePickerDemo,
  "/dynamic-page": DynamicPageDemo,
  "/view-settings": ViewSettingsDemo,
  "/selectable-card": SelectableCardDemo,
  "/object-page": ObjectPageLayoutDemo,
  "/dynamic-date-range": DynamicDateRangeDemo,
  "/toast": ToastDemo,
  "/rich-text": RichTextDemo,
  "/camera": CameraDemo,
  "/qr-scanner": QRScannerDemo,
  "/map": MapDemo,
  "/chart": ChartDemo,
  "/data-table": DataTableDemo,
  "/form": FormDemo,
  "/pivot": PivotDemo,
};

/**
 * The deploy base, read back rather than hardcoded: "/builder-vanilla/" in dev and
 * "/zen-ui/builder-vanilla/" on Pages. deploy.sh is the only place that knows the
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
    el("h1", "app-title", "Zen UI · Vanilla"),
    el(
      "p",
      "app-subtitle",
      `Framework-free component library by Algorisys · ${COMPONENT_COUNT} components`,
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

  for (const group of NAV) {
    const g = el("div", "sidebar-group");
    g.append(el("h4", "sidebar-group-title", group.title));
    const ul = el("ul", "sidebar-list");
    for (const item of group.items) {
      const li = el("li");
      const a = el("a", "sidebar-link sidebar-link-inactive", item.label);
      a.href = `${BASE}${item.to}`;
      a.dataset.route = item.to;
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
    sidebar.append(g);
  }

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
  copy.append(
    document.createTextNode(`© ${new Date().getFullYear()} `),
    algorisys,
    el("span", "app-footer-sep", "·"),
    document.createTextNode("zen-ui · framework-free binding"),
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
 * Deep-link re-entry. `/zen-ui/builder-vanilla/tabs` is not a file, so Pages serves
 * the root 404.html, which works out which app was wanted and bounces here with the
 * route in `?p=`. Same shim the other two demos use.
 */
const p = new URLSearchParams(window.location.search).get("p");
if (p) window.history.replaceState({}, "", `${BASE}/${p.replace(/^\//, "")}`);

/** Theme is CSS-driven: toggling data-theme on <html> is the whole mechanism. */
applyTheme(getInitialTheme());

render();
