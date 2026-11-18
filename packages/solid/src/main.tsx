/* @refresh reload */
import { render } from "solid-js/web";
import { Navigate, Router, Route } from "@solidjs/router";

import "./index.css";
// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …)
// is evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
import "virtual:uno.css";

import App from "./App";
import Welcome from "./demos/welcome";
import { applyTheme, getInitialTheme } from "./lib/theme";

import NewButtonDemo from "./demos/button";
import NewBadgeDemo from "./demos/badge";
import NewCardDemo from "./demos/card";
import NewSkeletonDemo from "./demos/skeleton";
import NewLoadingDemo from "./demos/loading";
import NewFABDemo from "./demos/fab";
import NewSeparatorDemo from "./demos/separator";
import NewAlertDemo from "./demos/alert";
import NewBannerDemo from "./demos/banner";
import NewEmptyStateDemo from "./demos/empty-state";
import NewStepperDemo from "./demos/stepper";
import NewRatingDemo from "./demos/rating";
import NewNpsDemo from "./demos/nps";
import NewLikertDemo from "./demos/likert";
import NewAvatarDemo from "./demos/avatar";
import NewProgressDemo from "./demos/progress";
import NewSwitchDemo from "./demos/switch";
import NewCheckboxDemo from "./demos/checkbox";
import NewRadioGroupDemo from "./demos/radio-group";
import NewTooltipDemo from "./demos/tooltip";
import NewTabsDemo from "./demos/tabs";
import NewAccordionDemo from "./demos/accordion";
import NewCollapsibleDemo from "./demos/collapsible";
import NewPaperDemo from "./demos/paper";
import NewLabelDemo from "./demos/label";
import NewSliderDemo from "./demos/slider";
import NewPopoverDemo from "./demos/popover";
import NewDialogDemo from "./demos/dialog";
import NewSheetDemo from "./demos/sheet";
import NewDropdownMenuDemo from "./demos/dropdown-menu";
import NewContextMenuDemo from "./demos/context-menu";
import NewTileDemo from "./demos/tile";
import NewTreeSelectDemo from "./demos/tree-select";
import NewLookupFieldDemo from "./demos/lookup-field";
import NewShortcutsDemo from "./demos/shortcuts";
import NewSelectDemo from "./demos/select";
import NewScrollAreaDemo from "./demos/scroll-area";
import NewToastDemo from "./demos/toast";
import NewInputDemo from "./demos/input";
import SearchDemo from "./demos/search";
import PasswordInputDemo from "./demos/password-input";
import NewNumberFieldDemo from "./demos/number-field";
import NewAmountFieldDemo from "./demos/amount-field";
import NewLocaleDemo from "./demos/localization";
import NewTagInputDemo from "./demos/tag-input";
import NewPhoneInputDemo from "./demos/phone-input";
import NewOTPDemo from "./demos/otp";
import NewFileUploadDemo from "./demos/file-upload";
import NewDataTableDemo from "./demos/data-table";
import NewTreeTableDemo from "./demos/tree-table";
import NewMicroChartDemo from "./demos/micro-chart";
import NewCountdownDemo from "./demos/countdown";
import NewCodeEditorDemo from "./demos/code-editor";
import NewSpreadsheetGridDemo from "./demos/spreadsheet-grid";
import NewProctorDemo from "./demos/proctor";
import NewChunkUploaderDemo from "./demos/chunk-uploader";
import NewDiagramCanvasDemo from "./demos/diagram-canvas";
import NewTimelineDemo from "./demos/timeline";
import NewDiffViewDemo from "./demos/diff-view";
import NewDocumentViewerDemo from "./demos/document-viewer";
import NewSplitterDemo from "./demos/splitter";
import NewSortableListDemo from "./demos/sortable-list";
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
import NewComboboxDemo from "./demos/combobox";
import NewMultiComboboxDemo from "./demos/multi-combobox";
import NewLazyOptionsDemo from "./demos/lazy-options";
import NewFormDemo from "./demos/form";
import NewBoundFieldsDemo from "./demos/bound-fields";
import NewDatePickerDemo from "./demos/date-picker";
import NewDateInputDemo from "./demos/date-input";
import NewDateRangePickerDemo from "./demos/date-range-picker";
import NewTimePickerDemo from "./demos/time-picker";
import NewDateTimePickerDemo from "./demos/date-time-picker";
import NewQRScannerDemo from "./demos/qr-scanner";
import NewBarcodeDemo from "./demos/barcode";
import NewNotificationsInboxDemo from "./demos/notifications-inbox";
import NewStackDemo from "./demos/stack";
import NewBreadcrumbDemo from "./demos/breadcrumb";
import NewPaginationDemo from "./demos/pagination";
import NewCommandDemo from "./demos/command";
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
import NewFilterBarDemo from "./demos/filter-bar";
import NewFilterBuilderDemo from "./demos/filter-builder";
import NewViewManagerDemo from "./demos/view-manager";
import NewPageHeaderDemo from "./demos/page-header";
import NewStatCardDemo from "./demos/stat-card";
import NewCustomizingDemo from "./demos/customizing";
import NewMaskInputDemo from "./demos/mask-input";
import NewLinkDemo from "./demos/link";
import NewThemeDemo from "./demos/theme";
import NewDirectionDemo from "./demos/direction";
import NewPageDemo from "./demos/page";
import NewMessagePopoverDemo from "./demos/message-popover";
import { DirectionProvider } from "./components/direction/direction";
import NewColorPickerDemo from "./demos/color-picker";
import NewCarouselDemo from "./demos/carousel";
import NewDynamicDateRangeDemo from "./demos/dynamic-date-range";
import NewPivotDemo from "./demos/pivot";
import NewMediaTimelineDemo from "./demos/media-timeline";
import NewWaveformDemo from "./demos/waveform";
import NewListReportDemo from "./demos/list-report";

applyTheme(getInitialTheme());

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

// The router's base must match the base the app is actually SERVED under, or no
// route matches on a direct visit or a refresh. Derived from Vite's BASE_URL
// rather than hardcoded to "/builder-solid", because the base is not fixed: it
// is "/builder-solid/" under dev:all and "/zen-ui/builder-solid/" on GitHub
// Pages, where a hardcoded value would match nothing and render a blank page.
// BASE_URL is baked in at build time and always has a trailing slash; base must
// not. Mirrors the React binding.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

render(
  () => (
    // DirectionProvider follows <html dir> — see the React binding's note.
    <DirectionProvider>
    <Router base={BASE} root={App}>
      <Route path="/" component={Welcome} />
      <Route path="/button" component={NewButtonDemo} />
      <Route path="/badge" component={NewBadgeDemo} />
      <Route path="/card" component={NewCardDemo} />
      <Route path="/skeleton" component={NewSkeletonDemo} />
      <Route path="/loading" component={NewLoadingDemo} />
      <Route path="/fab" component={NewFABDemo} />
      <Route path="/separator" component={NewSeparatorDemo} />
      <Route path="/alert" component={NewAlertDemo} />
      <Route path="/banner" component={NewBannerDemo} />
      <Route path="/empty-state" component={NewEmptyStateDemo} />
      <Route path="/stepper" component={NewStepperDemo} />
      <Route path="/rating" component={NewRatingDemo} />
      <Route path="/nps" component={NewNpsDemo} />
      <Route path="/likert" component={NewLikertDemo} />
      <Route path="/avatar" component={NewAvatarDemo} />
      <Route path="/progress" component={NewProgressDemo} />
      <Route path="/switch" component={NewSwitchDemo} />
      <Route path="/checkbox" component={NewCheckboxDemo} />
      <Route path="/radio-group" component={NewRadioGroupDemo} />
      <Route path="/tooltip" component={NewTooltipDemo} />
      <Route path="/tabs" component={NewTabsDemo} />
      <Route path="/accordion" component={NewAccordionDemo} />
      <Route path="/collapsible" component={NewCollapsibleDemo} />
      <Route path="/paper" component={NewPaperDemo} />
      <Route path="/label" component={NewLabelDemo} />
      <Route path="/slider" component={NewSliderDemo} />
      <Route path="/popover" component={NewPopoverDemo} />
      <Route path="/dialog" component={NewDialogDemo} />
      <Route path="/sheet" component={NewSheetDemo} />
      <Route path="/dropdown-menu" component={NewDropdownMenuDemo} />
      <Route path="/context-menu" component={NewContextMenuDemo} />
      <Route path="/tile" component={NewTileDemo} />
      <Route path="/tree-select" component={NewTreeSelectDemo} />
      <Route path="/lookup-field" component={NewLookupFieldDemo} />
      <Route path="/shortcuts" component={NewShortcutsDemo} />
      <Route path="/select" component={NewSelectDemo} />
      <Route path="/scroll-area" component={NewScrollAreaDemo} />
      <Route path="/toast" component={NewToastDemo} />
      <Route path="/input" component={NewInputDemo} />
      <Route path="/search" component={SearchDemo} />
      <Route path="/password-input" component={PasswordInputDemo} />
      <Route path="/number-field" component={NewNumberFieldDemo} />
      <Route path="/amount-field" component={NewAmountFieldDemo} />
      <Route path="/localization" component={NewLocaleDemo} />
      <Route path="/tag-input" component={NewTagInputDemo} />
      <Route path="/phone-input" component={NewPhoneInputDemo} />
      <Route path="/otp" component={NewOTPDemo} />
      <Route path="/file-upload" component={NewFileUploadDemo} />
      <Route path="/data-table" component={NewDataTableDemo} />
      <Route path="/tree-table" component={NewTreeTableDemo} />
      <Route path="/micro-chart" component={NewMicroChartDemo} />
      <Route path="/countdown" component={NewCountdownDemo} />
      <Route path="/code-editor" component={NewCodeEditorDemo} />
      <Route path="/spreadsheet-grid" component={NewSpreadsheetGridDemo} />
      <Route path="/proctor" component={NewProctorDemo} />
      <Route path="/chunk-uploader" component={NewChunkUploaderDemo} />
      <Route path="/diagram-canvas" component={NewDiagramCanvasDemo} />
      <Route path="/timeline" component={NewTimelineDemo} />
      <Route path="/diff-view" component={NewDiffViewDemo} />
      <Route path="/document-viewer" component={NewDocumentViewerDemo} />
      <Route path="/splitter" component={NewSplitterDemo} />
      <Route path="/sortable-list" component={NewSortableListDemo} />
      <Route path="/upload-collection" component={NewUploadCollectionDemo} />
      <Route path="/planning-calendar" component={NewPlanningCalendarDemo} />
      <Route path="/gantt" component={NewGanttDemo} />
      <Route path="/production-schedule" component={NewProductionScheduleDemo} />
      <Route path="/state-pill" component={NewStatePillDemo} />
      <Route path="/oee-gauge" component={NewOeeGaugeDemo} />
      <Route path="/state-timeline" component={NewStateTimelineDemo} />
      <Route path="/andon" component={NewAndonDemo} />
      <Route path="/reason-code-picker" component={NewReasonCodePickerDemo} />
      <Route path="/scan-input" component={NewScanInputDemo} />
      <Route path="/production-progress" component={NewProductionProgressDemo} />
      <Route path="/measurement-input" component={NewMeasurementInputDemo} />
      <Route path="/step-runner" component={NewStepRunnerDemo} />
      <Route path="/live-indicator" component={NewLiveIndicatorDemo} />
      <Route path="/status-bar" component={NewStatusBarDemo} />
      <Route path="/shift-navigator" component={NewShiftNavigatorDemo} />
      <Route path="/planned-vs-actual" component={NewPlannedVsActualDemo} />
      <Route path="/rate-bars" component={NewRateBarsDemo} />
      <Route path="/line-card" component={NewLineCardDemo} />
      <Route path="/capacity-heatmap" component={NewCapacityHeatmapDemo} />
      <Route path="/column-mapper" component={NewColumnMapperDemo} />
      <Route path="/genealogy-graph" component={NewGenealogyGraphDemo} />
      <Route path="/routing-graph" component={NewRoutingGraphDemo} />
      <Route path="/combobox" component={NewComboboxDemo} />
      <Route path="/multi-combobox" component={NewMultiComboboxDemo} />
      <Route path="/lazy-options" component={NewLazyOptionsDemo} />
      {/* Old URL, kept as a redirect: it shipped on the public demo site. */}
      <Route path="/form-new" component={() => <Navigate href="/form" />} />
      <Route path="/form" component={NewFormDemo} />
      <Route path="/bound-fields" component={NewBoundFieldsDemo} />
      <Route path="/date-picker" component={NewDatePickerDemo} />
      <Route path="/date-input" component={NewDateInputDemo} />
      <Route path="/date-range-picker" component={NewDateRangePickerDemo} />
      <Route path="/time-picker" component={NewTimePickerDemo} />
      <Route path="/date-time-picker" component={NewDateTimePickerDemo} />
      <Route path="/qr-scanner" component={NewQRScannerDemo} />
      <Route path="/barcode" component={NewBarcodeDemo} />
      <Route path="/notifications-inbox" component={NewNotificationsInboxDemo} />
      <Route path="/stack" component={NewStackDemo} />
      <Route path="/breadcrumb" component={NewBreadcrumbDemo} />
      <Route path="/pagination" component={NewPaginationDemo} />
      <Route path="/command" component={NewCommandDemo} />
      <Route path="/sidebar" component={NewSidebarDemo} />
      <Route path="/chart" component={NewChartDemo} />
      <Route path="/analytic-chart" component={NewAnalyticChartDemo} />
      <Route path="/rich-text" component={NewRichTextDemo} />
      <Route path="/map" component={NewMapDemo} />
      <Route path="/camera" component={NewCameraDemo} />
      <Route path="/icon" component={NewIconDemo} />
      <Route path="/object" component={NewObjectDemo} />
      <Route path="/button-family" component={NewButtonFamilyDemo} />
      <Route path="/tree" component={NewTreeDemo} />
      <Route path="/toolbar" component={NewToolbarDemo} />
      <Route path="/document-tabs" component={NewDocumentTabsDemo} />
      <Route path="/skip-to-content" component={SkipToContentDemo} />
      <Route path="/shellbar" component={NewShellBarDemo} />
      <Route
        path="/flexible-column-layout"
        component={NewFlexibleColumnLayoutDemo}
      />
      <Route path="/dynamic-page" component={NewDynamicPageDemo} />
      <Route path="/object-page" component={NewObjectPageDemo} />
      <Route path="/select-dialog" component={NewSelectDialogDemo} />
      <Route path="/value-help" component={NewValueHelpDemo} />
      <Route path="/view-settings" component={NewViewSettingsDemo} />
      <Route path="/filter-bar" component={NewFilterBarDemo} />
      <Route path="/filter-builder" component={NewFilterBuilderDemo} />
      <Route path="/view-manager" component={NewViewManagerDemo} />
      <Route path="/page-header" component={NewPageHeaderDemo} />
      <Route path="/stat-card" component={NewStatCardDemo} />
      <Route path="/customizing" component={NewCustomizingDemo} />
      <Route path="/mask-input" component={NewMaskInputDemo} />
      <Route path="/link" component={NewLinkDemo} />
      <Route path="/theme" component={NewThemeDemo} />
      <Route path="/direction" component={NewDirectionDemo} />
      <Route path="/page" component={NewPageDemo} />
      <Route path="/message-popover" component={NewMessagePopoverDemo} />
      <Route path="/color-picker" component={NewColorPickerDemo} />
      <Route path="/carousel" component={NewCarouselDemo} />
      <Route path="/dynamic-date-range" component={NewDynamicDateRangeDemo} />
      <Route path="/pivot" component={NewPivotDemo} />
      <Route path="/media-timeline" component={NewMediaTimelineDemo} />
      <Route path="/waveform" component={NewWaveformDemo} />
      <Route path="/list-report" component={NewListReportDemo} />
    </Router>
    </DirectionProvider>
  ),
  root,
);
