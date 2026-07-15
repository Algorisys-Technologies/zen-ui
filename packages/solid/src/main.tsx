/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …)
// is evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
import "virtual:uno.css";

import App from "./App";
import Welcome from "./components/Welcome";
import { applyTheme, getInitialTheme } from "./lib/theme";

import NewButtonDemo from "./components/NewButtonDemo";
import NewBadgeDemo from "./components/NewBadgeDemo";
import NewCardDemo from "./components/NewCardDemo";
import NewSkeletonDemo from "./components/NewSkeletonDemo";
import NewLoadingDemo from "./components/NewLoadingDemo";
import NewFABDemo from "./components/NewFABDemo";
import NewSeparatorDemo from "./components/NewSeparatorDemo";
import NewAlertDemo from "./components/NewAlertDemo";
import NewBannerDemo from "./components/NewBannerDemo";
import NewEmptyStateDemo from "./components/NewEmptyStateDemo";
import NewStepperDemo from "./components/NewStepperDemo";
import NewRatingDemo from "./components/NewRatingDemo";
import NewNpsDemo from "./components/NewNpsDemo";
import NewLikertDemo from "./components/NewLikertDemo";
import NewAvatarDemo from "./components/NewAvatarDemo";
import NewProgressDemo from "./components/NewProgressDemo";
import NewSwitchDemo from "./components/NewSwitchDemo";
import NewCheckboxDemo from "./components/NewCheckboxDemo";
import NewRadioGroupDemo from "./components/NewRadioGroupDemo";
import NewTooltipDemo from "./components/NewTooltipDemo";
import NewTabsDemo from "./components/NewTabsDemo";
import NewAccordionDemo from "./components/NewAccordionDemo";
import NewSliderDemo from "./components/NewSliderDemo";
import NewPopoverDemo from "./components/NewPopoverDemo";
import NewDialogDemo from "./components/NewDialogDemo";
import NewSheetDemo from "./components/NewSheetDemo";
import NewDropdownMenuDemo from "./components/NewDropdownMenuDemo";
import NewSelectDemo from "./components/NewSelectDemo";
import NewScrollAreaDemo from "./components/NewScrollAreaDemo";
import NewToastDemo from "./components/NewToastDemo";
import NewInputDemo from "./components/NewInputDemo";
import NewNumberFieldDemo from "./components/NewNumberFieldDemo";
import NewTagInputDemo from "./components/NewTagInputDemo";
import NewPhoneInputDemo from "./components/NewPhoneInputDemo";
import NewOTPDemo from "./components/NewOTPDemo";
import NewFileUploadDemo from "./components/NewFileUploadDemo";
import NewDataTableDemo from "./components/NewDataTableDemo";
import NewComboboxDemo from "./components/NewComboboxDemo";
import NewMultiComboboxDemo from "./components/NewMultiComboboxDemo";
import NewLazyOptionsDemo from "./components/NewLazyOptionsDemo";
import NewFormDemo from "./components/NewFormDemo";
import NewBoundFieldsDemo from "./components/NewBoundFieldsDemo";
import NewDatePickerDemo from "./components/NewDatePickerDemo";
import NewDateRangePickerDemo from "./components/NewDateRangePickerDemo";
import NewTimePickerDemo from "./components/NewTimePickerDemo";
import NewDateTimePickerDemo from "./components/NewDateTimePickerDemo";
import NewQRScannerDemo from "./components/NewQRScannerDemo";
import NewNotificationsInboxDemo from "./components/NewNotificationsInboxDemo";
import NewStackDemo from "./components/NewStackDemo";
import NewBreadcrumbDemo from "./components/NewBreadcrumbDemo";
import NewPaginationDemo from "./components/NewPaginationDemo";
import NewCommandDemo from "./components/NewCommandDemo";
import NewSidebarDemo from "./components/NewSidebarDemo";
import NewChartDemo from "./components/NewChartDemo";
import NewRichTextDemo from "./components/NewRichTextDemo";
import NewMapDemo from "./components/NewMapDemo";
import NewCameraDemo from "./components/NewCameraDemo";
import NewIconDemo from "./components/NewIconDemo";
import NewObjectDemo from "./components/NewObjectDemo";
import NewButtonFamilyDemo from "./components/NewButtonFamilyDemo";
import NewTreeDemo from "./components/NewTreeDemo";
import NewToolbarDemo from "./components/NewToolbarDemo";
import NewShellBarDemo from "./components/NewShellBarDemo";
import NewFlexibleColumnLayoutDemo from "./components/NewFlexibleColumnLayoutDemo";
import NewDynamicPageDemo from "./components/NewDynamicPageDemo";
import NewObjectPageDemo from "./components/NewObjectPageDemo";
import NewSelectDialogDemo from "./components/NewSelectDialogDemo";
import NewValueHelpDemo from "./components/NewValueHelpDemo";
import NewViewSettingsDemo from "./components/NewViewSettingsDemo";
import NewFilterBarDemo from "./components/NewFilterBarDemo";
import NewPageHeaderDemo from "./components/NewPageHeaderDemo";
import NewStatCardDemo from "./components/NewStatCardDemo";
import NewCustomizingDemo from "./components/NewCustomizingDemo";
import NewMaskInputDemo from "./components/NewMaskInputDemo";
import NewLinkDemo from "./components/NewLinkDemo";
import NewColorPickerDemo from "./components/NewColorPickerDemo";
import NewCarouselDemo from "./components/NewCarouselDemo";
import NewDynamicDateRangeDemo from "./components/NewDynamicDateRangeDemo";
import NewPivotDemo from "./components/NewPivotDemo";
import NewListReportDemo from "./components/NewListReportDemo";

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
      <Route path="/slider" component={NewSliderDemo} />
      <Route path="/popover" component={NewPopoverDemo} />
      <Route path="/dialog" component={NewDialogDemo} />
      <Route path="/sheet" component={NewSheetDemo} />
      <Route path="/dropdown-menu" component={NewDropdownMenuDemo} />
      <Route path="/select" component={NewSelectDemo} />
      <Route path="/scroll-area" component={NewScrollAreaDemo} />
      <Route path="/toast" component={NewToastDemo} />
      <Route path="/input" component={NewInputDemo} />
      <Route path="/number-field" component={NewNumberFieldDemo} />
      <Route path="/tag-input" component={NewTagInputDemo} />
      <Route path="/phone-input" component={NewPhoneInputDemo} />
      <Route path="/otp" component={NewOTPDemo} />
      <Route path="/file-upload" component={NewFileUploadDemo} />
      <Route path="/data-table" component={NewDataTableDemo} />
      <Route path="/combobox" component={NewComboboxDemo} />
      <Route path="/multi-combobox" component={NewMultiComboboxDemo} />
      <Route path="/lazy-options" component={NewLazyOptionsDemo} />
      <Route path="/form-new" component={NewFormDemo} />
      <Route path="/bound-fields" component={NewBoundFieldsDemo} />
      <Route path="/date-picker" component={NewDatePickerDemo} />
      <Route path="/date-range-picker" component={NewDateRangePickerDemo} />
      <Route path="/time-picker" component={NewTimePickerDemo} />
      <Route path="/date-time-picker" component={NewDateTimePickerDemo} />
      <Route path="/qr-scanner" component={NewQRScannerDemo} />
      <Route path="/notifications-inbox" component={NewNotificationsInboxDemo} />
      <Route path="/stack" component={NewStackDemo} />
      <Route path="/breadcrumb" component={NewBreadcrumbDemo} />
      <Route path="/pagination" component={NewPaginationDemo} />
      <Route path="/command" component={NewCommandDemo} />
      <Route path="/sidebar" component={NewSidebarDemo} />
      <Route path="/chart" component={NewChartDemo} />
      <Route path="/rich-text" component={NewRichTextDemo} />
      <Route path="/map" component={NewMapDemo} />
      <Route path="/camera" component={NewCameraDemo} />
      <Route path="/icon" component={NewIconDemo} />
      <Route path="/object" component={NewObjectDemo} />
      <Route path="/button-family" component={NewButtonFamilyDemo} />
      <Route path="/tree" component={NewTreeDemo} />
      <Route path="/toolbar" component={NewToolbarDemo} />
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
      <Route path="/page-header" component={NewPageHeaderDemo} />
      <Route path="/stat-card" component={NewStatCardDemo} />
      <Route path="/customizing" component={NewCustomizingDemo} />
      <Route path="/mask-input" component={NewMaskInputDemo} />
      <Route path="/link" component={NewLinkDemo} />
      <Route path="/color-picker" component={NewColorPickerDemo} />
      <Route path="/carousel" component={NewCarouselDemo} />
      <Route path="/dynamic-date-range" component={NewDynamicDateRangeDemo} />
      <Route path="/pivot" component={NewPivotDemo} />
      <Route path="/list-report" component={NewListReportDemo} />
    </Router>
  ),
  root,
);
