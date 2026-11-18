import { useState } from "react";
import "./App.css";
import { NavLink, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { NAV } from "./nav";
import { NavTag } from "./demos/nav-tag";

/**
 * Derived from NAV, never hand-counted: nav.ts is already the single source of
 * truth for the sidebar and the landing catalogue, and a hard-coded number here
 * would drift the moment a component is added.
 *
 * Two exclusions, for two different reasons. `catalogue: false` groups (Getting
 * started) are routes rather than components. `components: false` groups
 * (Patterns) ARE on the landing page but are screens assembled from the
 * components above — counting them would count the same components twice.
 */
const COMPONENT_COUNT = NAV.filter((g) => g.catalogue !== false && g.components !== false).reduce(
  (n, g) => n + g.items.length,
  0,
);

/**
 * The root site, one level up from this demo's own base — derived, not "/".
 * The demo is mounted at /builder/ under `dev:all` and at /zen-ui/builder/ on
 * GH-Pages, and the way out has to land on the right root in both. Hardcoding
 * "/" would walk out of the deployment entirely.
 */
const ROOT_URL = new URL("..", new URL(import.meta.env.BASE_URL, window.location.origin))
  .pathname;

/**
 * "View code" opens the demo file for the route you are on — the USAGE, not the
 * component's internals. The page already prints a snippet, but that snippet is
 * a hand-typed `code` string sitting next to the JSX it claims to describe, and
 * nothing keeps the two honest. This is the file that actually ran.
 *
 * Pinned to `main` rather than the current branch: a link that only resolves on
 * whatever branch happened to build it is a link that breaks on every other one.
 * The paths come from nav.ts and are checked by `bun run check:nav`.
 */
const SOURCE_BASE = "https://github.com/Algorisys-Technologies/zen-ui/blob/main/";

/** The nav entry for the current route, if it has a source. */
const useSourceHref = (): string | undefined => {
  const { pathname } = useLocation();
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.to === pathname && item.source) return SOURCE_BASE + item.source;
    }
  }
  return undefined;
};

const ViewCode: React.FC = () => {
  const href = useSourceHref();
  if (!href) return null;
  return (
    <a
      className="app-home-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title="The demo source for this page on GitHub"
    >
      View code <span aria-hidden>↗</span>
    </a>
  );
};

import Welcome from "./demos/welcome";
import ThemeSwitcher from "./demos/theme-switcher";

import NewButtonDemo from "./demos/button";
import NewTooltipDemo from "./demos/tooltip";
import NewDropdownMenuDemo from "./demos/dropdown-menu";
import NewContextMenuDemo from "./demos/context-menu";
import NewSeparatorDemo from "./demos/separator";
import NewSwitchDemo from "./demos/switch";
import NewCheckboxDemo from "./demos/checkbox";
import NewRadioGroupDemo from "./demos/radio-group";
import NewProgressDemo from "./demos/progress";
import NewAvatarDemo from "./demos/avatar";
import NewBadgeDemo from "./demos/badge";
import NewSkeletonDemo from "./demos/skeleton";
import NewLoadingDemo from "./demos/loading";
import NewSelectDemo from "./demos/select";
import NewSliderDemo from "./demos/slider";
import NewScrollAreaDemo from "./demos/scroll-area";
import NewInputDemo from "./demos/input";
import NewTextareaDemo from "./demos/textarea";
import SearchDemo from "./demos/search";
import PasswordInputDemo from "./demos/password-input";
import NewNumberFieldDemo from "./demos/number-field";
import NewAmountFieldDemo from "./demos/amount-field";
import NewDatePickerDemo from "./demos/date-picker";
import NewDateInputDemo from "./demos/date-input";
import NewOTPDemo from "./demos/otp";
import NewPhoneInputDemo from "./demos/phone-input";
import NewFABDemo from "./demos/fab";
import NewFormDemo from "./demos/form";
import NewDataTableDemo from "./demos/data-table";
import NewTreeTableDemo from "./demos/tree-table";
import NewMicroChartDemo from "./demos/micro-chart";
import NewCountdownDemo from "./demos/countdown";
import NewCodeEditorDemo from "./demos/code-editor";
import NewSpreadsheetGridDemo from "./demos/spreadsheet-grid";
import NewProctorDemo from "./demos/proctor";
import NewChunkUploaderDemo from "./demos/chunk-uploader";
import NewDiagramCanvasDemo from "./demos/diagram-canvas";
import NewDiffViewDemo from "./demos/diff-view";
import NewDocumentViewerDemo from "./demos/document-viewer";
import NewSplitterDemo from "./demos/splitter";
import NewSortableListDemo from "./demos/sortable-list";
import NewTimelineDemo from "./demos/timeline";
import NewUploadCollectionDemo from "./demos/upload-collection";
import NewPlanningCalendarDemo from "./demos/planning-calendar";
import NewGanttDemo from "./demos/gantt";
import NewProductionScheduleDemo from "./demos/production-schedule";
import NewStatePillDemo from "./demos/state-pill";
import NewOeeGaugeDemo from "./demos/oee-gauge";
import NewStateTimelineDemo from "./demos/state-timeline";
import NewAndonDemo from "./demos/andon";
import NewReasonCodePickerDemo from "./demos/reason-code-picker";
import NewScanInputDemo from "./demos/scan-input";
import NewProductionProgressDemo from "./demos/production-progress";
import NewMeasurementInputDemo from "./demos/measurement-input";
import NewStepRunnerDemo from "./demos/step-runner";
import NewLiveIndicatorDemo from "./demos/live-indicator";
import NewStatusBarDemo from "./demos/status-bar";
import NewShiftNavigatorDemo from "./demos/shift-navigator";
import NewPlannedVsActualDemo from "./demos/planned-vs-actual";
import NewRateBarsDemo from "./demos/rate-bars";
import NewLineCardDemo from "./demos/line-card";
import NewCapacityHeatmapDemo from "./demos/capacity-heatmap";
import NewColumnMapperDemo from "./demos/column-mapper";
import NewGenealogyGraphDemo from "./demos/genealogy-graph";
import NewRoutingGraphDemo from "./demos/routing-graph";
import NewLazyOptionsDemo from "./demos/lazy-options";
import NewVirtualizedItemsDemo from "./demos/virtualized-items";
import NewComboboxDemo from "./demos/combobox";
import NewTreeSelectDemo from "./demos/tree-select";
import NewLookupFieldDemo from "./demos/lookup-field";
import NewAlertDemo from "./demos/alert";
import NewDialogDemo from "./demos/dialog";
import NewToastDemo from "./demos/toast";
import NewShortcutsDemo from "./demos/shortcuts";
import NewFileUploadDemo from "./demos/file-upload";
import NewBoundFieldsDemo from "./demos/bound-fields";
import NewStepperDemo from "./demos/stepper";
import NewBannerDemo from "./demos/banner";
import NewEmptyStateDemo from "./demos/empty-state";
import NewTabsDemo from "./demos/tabs";
import NewAccordionDemo from "./demos/accordion";
import NewCollapsibleDemo from "./demos/collapsible";
import NewPaperDemo from "./demos/paper";
import NewLabelDemo from "./demos/label";
import NewNativeSelectDemo from "./demos/native-select";
import NewCardDemo from "./demos/card";
import NewSheetDemo from "./demos/sheet";
import NewDateRangePickerDemo from "./demos/date-range-picker";
import NewTagInputDemo from "./demos/tag-input";
import NewMultiComboboxDemo from "./demos/multi-combobox";
import NewRatingDemo from "./demos/rating";
import NewNpsDemo from "./demos/nps";
import NewLikertDemo from "./demos/likert";
import NewTimePickerDemo from "./demos/time-picker";
import NewDateTimePickerDemo from "./demos/date-time-picker";
import NewBarcodeDemo from "./demos/barcode";
import NewQRScannerDemo from "./demos/qr-scanner";
import NewNotificationsInboxDemo from "./demos/notifications-inbox";
import NewBreadcrumbDemo from "./demos/breadcrumb";
import NewPaginationDemo from "./demos/pagination";
import NewSidebarDemo from "./demos/sidebar";
import NewChartDemo from "./demos/chart";
import NewAnalyticChartDemo from "./demos/analytic-chart";
import NewRichTextDemo from "./demos/rich-text";
import NewMapDemo from "./demos/map";
import NewCameraDemo from "./demos/camera";
import NewIconDemo from "./demos/icon";
import NewObjectDemo from "./demos/object";
import NewButtonFamilyDemo from "./demos/button-family";
import NewTreeDemo from "./demos/tree";
import NewToolbarDemo from "./demos/toolbar";
import NewDocumentTabsDemo from "./demos/document-tabs";
import NewShellBarDemo from "./demos/shellbar";
import SkipToContentDemo from "./demos/skip-to-content";
import NewFlexibleColumnLayoutDemo from "./demos/flexible-column-layout";
import NewDynamicPageDemo from "./demos/dynamic-page";
import NewObjectPageDemo from "./demos/object-page";
import NewSelectDialogDemo from "./demos/select-dialog";
import NewValueHelpDemo from "./demos/value-help";
import NewViewSettingsDemo from "./demos/view-settings";
import NewViewManagerDemo from "./demos/view-manager";
import NewFilterBarDemo from "./demos/filter-bar";
import NewFilterBuilderDemo from "./demos/filter-builder";
import NewPageHeaderDemo from "./demos/page-header";
import NewStatCardDemo from "./demos/stat-card";
import NewStackDemo from "./demos/stack";
import NewTileDemo from "./demos/tile";
import NewCustomizingDemo from "./demos/customizing";
import NewMaskInputDemo from "./demos/mask-input";
import NewPopoverDemo from "./demos/popover";
import NewLinkDemo from "./demos/link";
import NewThemeDemo from "./demos/theme";
import NewDirectionDemo from "./demos/direction";
import NewLocaleDemo from "./demos/localization";
import NewPageDemo from "./demos/page";
import NewMessagePopoverDemo from "./demos/message-popover";
import NewColorPickerDemo from "./demos/color-picker";
import NewCarouselDemo from "./demos/carousel";
import NewDynamicDateRangeDemo from "./demos/dynamic-date-range";
import NewListReportDemo from "./demos/list-report";
import NewPivotDemo from "./demos/pivot";
import NewMediaTimelineDemo from "./demos/media-timeline";
import NewWaveformDemo from "./demos/waveform";
import ReleaseNotes from "./demos/release-notes";
import { Toaster } from "./components/toast/toaster";
import { Search } from "./components/form/search/search";

/**
 * Navigation data — single source of truth for the sidebar.
 * Add a new component's route here and it shows up under the right group.
 */


const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const [query, setQuery] = useState("");
  /**
   * The sidebar filtered by the search box — the library's own Search
   * component, dogfooded. Matches the label AND the nav description, so
   * "wizard" finds Stepper; a group with no hits disappears rather than
   * sitting as an empty heading. Empty query returns NAV itself, so the
   * unfiltered sidebar renders exactly what it always did.
   */
  const q = query.trim().toLowerCase();
  const filteredNav = !q
    ? NAV
    : NAV.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            (item.description?.toLowerCase().includes(q) ?? false),
        ),
      })).filter((group) => group.items.length > 0);
  return (
    <aside className={`sidebar${collapsed ? " is-collapsed" : ""}`} aria-hidden={collapsed}>
      <div className="sidebar-search">
        <Search
          size="sm"
          value={query}
          onValueChange={setQuery}
          placeholder="Search components"
          aria-label="Search components"
        />
      </div>
      {filteredNav.length === 0 ? (
        <p className="sidebar-empty">No components match “{query}”.</p>
      ) : (
        filteredNav.map((group) => (
          <div key={group.title} className="sidebar-group">
            <h4 className="sidebar-group-title">{group.title}</h4>
            <ul className="sidebar-list">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      isActive
                        ? "sidebar-link sidebar-link-active"
                        : "sidebar-link sidebar-link-inactive"
                    }
                  >
                    {item.label}
                    <NavTag item={item} className="zen-ml-1.5" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </aside>
  );
};

const SidebarToggle: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
}> = ({ collapsed, onToggle }) => (
  <button
    type="button"
    className="sidebar-toggle"
    onClick={onToggle}
    aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
    aria-expanded={!collapsed}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>
);

const SIDEBAR_KEY = "zen-sidebar-collapsed";

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore quota */
      }
      return next;
    });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <SidebarToggle collapsed={collapsed} onToggle={toggleSidebar} />
          <div className="app-header-text">
            <h1 className="app-title">Zen UI Component Library</h1>
            <p className="app-subtitle">
              shadcn / Radix-style React component library by Algorisys ·{" "}
              {COMPONENT_COUNT} components
            </p>
          </div>
        </div>
        <div className="app-header-actions">
          {/* A real anchor: this leaves the SPA for the root site, so the
              router must not intercept it. */}
          <a className="app-home-link" href={ROOT_URL}>
            <span aria-hidden>←</span> All demos
          </a>
          <ViewCode />
          <ThemeSwitcher />
        </div>
      </header>
      <div className="app-body">
        <Sidebar collapsed={collapsed} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Welcome />} />

            <Route path="/button" element={<NewButtonDemo />} />
            <Route path="/tooltip" element={<NewTooltipDemo />} />
            <Route path="/dropdown-menu" element={<NewDropdownMenuDemo />} />
            <Route path="/context-menu" element={<NewContextMenuDemo />} />
            <Route path="/separator" element={<NewSeparatorDemo />} />
            <Route path="/switch" element={<NewSwitchDemo />} />
            <Route path="/checkbox" element={<NewCheckboxDemo />} />
            <Route path="/radio-group" element={<NewRadioGroupDemo />} />
            <Route path="/progress" element={<NewProgressDemo />} />
            <Route path="/avatar" element={<NewAvatarDemo />} />
            <Route path="/badge" element={<NewBadgeDemo />} />
            <Route path="/skeleton" element={<NewSkeletonDemo />} />
            <Route path="/loading" element={<NewLoadingDemo />} />
            <Route path="/select" element={<NewSelectDemo />} />
            <Route path="/slider" element={<NewSliderDemo />} />
            <Route path="/scroll-area" element={<NewScrollAreaDemo />} />
            <Route path="/input" element={<NewInputDemo />} />
            <Route path="/textarea" element={<NewTextareaDemo />} />
            <Route path="/search" element={<SearchDemo />} />
            <Route path="/password-input" element={<PasswordInputDemo />} />
            <Route path="/number-field" element={<NewNumberFieldDemo />} />
            <Route path="/amount-field" element={<NewAmountFieldDemo />} />
            <Route path="/date-input" element={<NewDateInputDemo />} />
            <Route path="/date-picker" element={<NewDatePickerDemo />} />
            <Route path="/otp" element={<NewOTPDemo />} />
            <Route path="/phone-input" element={<NewPhoneInputDemo />} />
            <Route path="/fab" element={<NewFABDemo />} />
            {/* Old URLs, kept as redirects: they shipped on the public demo site and may
                be bookmarked. Every page now has one canonical route, the same in every
                binding. */}
            <Route path="/avatar-new" element={<Navigate to="/avatar" replace />} />
            <Route path="/badge-new" element={<Navigate to="/badge" replace />} />
            <Route path="/button-new" element={<Navigate to="/button" replace />} />
            <Route path="/checkbox-new" element={<Navigate to="/checkbox" replace />} />
            <Route path="/date-picker-new" element={<Navigate to="/date-picker" replace />} />
            <Route path="/fab-new" element={<Navigate to="/fab" replace />} />
            <Route path="/input-new" element={<Navigate to="/input" replace />} />
            <Route path="/loading-new" element={<Navigate to="/loading" replace />} />
            <Route path="/number-field-new" element={<Navigate to="/number-field" replace />} />
            <Route path="/otp-new" element={<Navigate to="/otp" replace />} />
            <Route path="/phone-input-new" element={<Navigate to="/phone-input" replace />} />
            <Route path="/progress-new" element={<Navigate to="/progress" replace />} />
            <Route path="/scroll-area-new" element={<Navigate to="/scroll-area" replace />} />
            <Route path="/select-new" element={<Navigate to="/select" replace />} />
            <Route path="/skeleton-new" element={<Navigate to="/skeleton" replace />} />
            <Route path="/slider-new" element={<Navigate to="/slider" replace />} />
            <Route path="/switch-new" element={<Navigate to="/switch" replace />} />
            <Route path="/tooltip-new" element={<Navigate to="/tooltip" replace />} />
            <Route path="/form-new" element={<Navigate to="/form" replace />} />
            <Route path="/form-bound" element={<Navigate to="/bound-fields" replace />} />
            <Route path="/form" element={<NewFormDemo />} />
            <Route path="/data-table" element={<NewDataTableDemo />} />
            <Route path="/tree-table" element={<NewTreeTableDemo />} />
            <Route path="/micro-chart" element={<NewMicroChartDemo />} />
            <Route path="/countdown" element={<NewCountdownDemo />} />
            <Route path="/code-editor" element={<NewCodeEditorDemo />} />
            <Route path="/spreadsheet-grid" element={<NewSpreadsheetGridDemo />} />
            <Route path="/proctor" element={<NewProctorDemo />} />
            <Route path="/chunk-uploader" element={<NewChunkUploaderDemo />} />
            <Route path="/diagram-canvas" element={<NewDiagramCanvasDemo />} />
            <Route path="/diff-view" element={<NewDiffViewDemo />} />
            <Route path="/document-viewer" element={<NewDocumentViewerDemo />} />
            <Route path="/splitter" element={<NewSplitterDemo />} />
            <Route path="/sortable-list" element={<NewSortableListDemo />} />
            <Route path="/timeline" element={<NewTimelineDemo />} />
            <Route path="/upload-collection" element={<NewUploadCollectionDemo />} />
            <Route path="/planning-calendar" element={<NewPlanningCalendarDemo />} />
            <Route path="/gantt" element={<NewGanttDemo />} />
            <Route path="/production-schedule" element={<NewProductionScheduleDemo />} />
            <Route path="/state-pill" element={<NewStatePillDemo />} />
            <Route path="/oee-gauge" element={<NewOeeGaugeDemo />} />
            <Route path="/state-timeline" element={<NewStateTimelineDemo />} />
            <Route path="/andon" element={<NewAndonDemo />} />
            <Route path="/reason-code-picker" element={<NewReasonCodePickerDemo />} />
            <Route path="/scan-input" element={<NewScanInputDemo />} />
            <Route path="/production-progress" element={<NewProductionProgressDemo />} />
            <Route path="/measurement-input" element={<NewMeasurementInputDemo />} />
            <Route path="/step-runner" element={<NewStepRunnerDemo />} />
            <Route path="/live-indicator" element={<NewLiveIndicatorDemo />} />
            <Route path="/status-bar" element={<NewStatusBarDemo />} />
            <Route path="/shift-navigator" element={<NewShiftNavigatorDemo />} />
            <Route path="/planned-vs-actual" element={<NewPlannedVsActualDemo />} />
            <Route path="/rate-bars" element={<NewRateBarsDemo />} />
            <Route path="/line-card" element={<NewLineCardDemo />} />
            <Route path="/capacity-heatmap" element={<NewCapacityHeatmapDemo />} />
            <Route path="/column-mapper" element={<NewColumnMapperDemo />} />
            <Route path="/genealogy-graph" element={<NewGenealogyGraphDemo />} />
            <Route path="/routing-graph" element={<NewRoutingGraphDemo />} />
            <Route path="/lazy-options" element={<NewLazyOptionsDemo />} />
            <Route path="/virtualized-items" element={<NewVirtualizedItemsDemo />} />
            <Route path="/combobox" element={<NewComboboxDemo />} />
            <Route path="/tree-select" element={<NewTreeSelectDemo />} />
            <Route path="/lookup-field" element={<NewLookupFieldDemo />} />
            <Route path="/alert" element={<NewAlertDemo />} />
            <Route path="/dialog" element={<NewDialogDemo />} />
            <Route path="/toast" element={<NewToastDemo />} />
            <Route path="/shortcuts" element={<NewShortcutsDemo />} />
            <Route path="/file-upload" element={<NewFileUploadDemo />} />
            <Route path="/bound-fields" element={<NewBoundFieldsDemo />} />
            <Route path="/stepper" element={<NewStepperDemo />} />
            <Route path="/banner" element={<NewBannerDemo />} />
            <Route path="/empty-state" element={<NewEmptyStateDemo />} />
            <Route path="/tabs" element={<NewTabsDemo />} />
            <Route path="/accordion" element={<NewAccordionDemo />} />
            <Route path="/collapsible" element={<NewCollapsibleDemo />} />
            <Route path="/paper" element={<NewPaperDemo />} />
            <Route path="/label" element={<NewLabelDemo />} />
            <Route path="/native-select" element={<NewNativeSelectDemo />} />
            <Route path="/card" element={<NewCardDemo />} />
            <Route path="/sheet" element={<NewSheetDemo />} />
            <Route path="/date-range-picker" element={<NewDateRangePickerDemo />} />
            <Route path="/tag-input" element={<NewTagInputDemo />} />
            <Route path="/multi-combobox" element={<NewMultiComboboxDemo />} />
            <Route path="/rating" element={<NewRatingDemo />} />
            <Route path="/nps" element={<NewNpsDemo />} />
            <Route path="/likert" element={<NewLikertDemo />} />
            <Route path="/time-picker" element={<NewTimePickerDemo />} />
            <Route path="/date-time-picker" element={<NewDateTimePickerDemo />} />
            <Route path="/barcode" element={<NewBarcodeDemo />} />
            <Route path="/qr-scanner" element={<NewQRScannerDemo />} />
            <Route path="/notifications-inbox" element={<NewNotificationsInboxDemo />} />
            <Route path="/breadcrumb" element={<NewBreadcrumbDemo />} />
            <Route path="/pagination" element={<NewPaginationDemo />} />
            <Route path="/sidebar" element={<NewSidebarDemo />} />
            <Route path="/chart" element={<NewChartDemo />} />
            <Route path="/analytic-chart" element={<NewAnalyticChartDemo />} />
            <Route path="/rich-text" element={<NewRichTextDemo />} />
            <Route path="/map" element={<NewMapDemo />} />
            <Route path="/camera" element={<NewCameraDemo />} />
            <Route path="/icon" element={<NewIconDemo />} />
            <Route path="/object" element={<NewObjectDemo />} />
            <Route path="/button-family" element={<NewButtonFamilyDemo />} />
            <Route path="/tree" element={<NewTreeDemo />} />
            <Route path="/document-tabs" element={<NewDocumentTabsDemo />} />
            <Route path="/toolbar" element={<NewToolbarDemo />} />
            <Route path="/skip-to-content" element={<SkipToContentDemo />} />
            <Route path="/shellbar" element={<NewShellBarDemo />} />
            <Route
              path="/flexible-column-layout"
              element={<NewFlexibleColumnLayoutDemo />}
            />
            <Route path="/dynamic-page" element={<NewDynamicPageDemo />} />
            <Route path="/object-page" element={<NewObjectPageDemo />} />
            <Route path="/select-dialog" element={<NewSelectDialogDemo />} />
            <Route path="/value-help" element={<NewValueHelpDemo />} />
            <Route path="/view-settings" element={<NewViewSettingsDemo />} />
            <Route path="/filter-builder" element={<NewFilterBuilderDemo />} />
            <Route path="/view-manager" element={<NewViewManagerDemo />} />
            <Route path="/filter-bar" element={<NewFilterBarDemo />} />
            <Route path="/page-header" element={<NewPageHeaderDemo />} />
            <Route path="/stat-card" element={<NewStatCardDemo />} />
            <Route path="/stack" element={<NewStackDemo />} />
            <Route path="/tile" element={<NewTileDemo />} />
            <Route path="/customizing" element={<NewCustomizingDemo />} />
            <Route path="/mask-input" element={<NewMaskInputDemo />} />
            <Route path="/popover" element={<NewPopoverDemo />} />
            <Route path="/link" element={<NewLinkDemo />} />
            <Route path="/theme" element={<NewThemeDemo />} />
            <Route path="/localization" element={<NewLocaleDemo />} />
            <Route path="/direction" element={<NewDirectionDemo />} />
            <Route path="/page" element={<NewPageDemo />} />
            <Route path="/message-popover" element={<NewMessagePopoverDemo />} />
            <Route path="/color-picker" element={<NewColorPickerDemo />} />
            <Route path="/carousel" element={<NewCarouselDemo />} />
            <Route path="/dynamic-date-range" element={<NewDynamicDateRangeDemo />} />
            <Route path="/list-report" element={<NewListReportDemo />} />
            <Route path="/pivot" element={<NewPivotDemo />} />
            <Route path="/media-timeline" element={<NewMediaTimelineDemo />} />
            <Route path="/waveform" element={<NewWaveformDemo />} />
          </Routes>
        </main>
      </div>
      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()}{" "}
          <a href="https://www.algorisys.com" target="_blank" rel="noreferrer noopener">
            Algorisys Technologies Pvt. Ltd
          </a>
          <span className="app-footer-sep">·</span>
          zen-ui · shadcn / Radix-style components
          {/* The licence, where someone evaluating the library is already
              looking. "Noncommercial" is the fact they need; the link carries
              the rest. Stated as what they MAY do, because a footer that only
              names a licence makes a reader go and find out what it means. */}
          <span className="app-footer-sep">·</span>
          <a
            href="https://github.com/Algorisys-Technologies/zen-ui/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer noopener"
          >
            Free for noncommercial use
          </a>
        </span>
        <ReleaseNotes />
      </footer>
      {/* Mounted once near the root so toast({...}) can be called from
       * anywhere in the demo tree. */}
      <Toaster />
    </div>
  );
};

export default App;
