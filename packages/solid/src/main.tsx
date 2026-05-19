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

applyTheme(getInitialTheme());

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

render(
  () => (
    <Router base="/builder-solid" root={App}>
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
    </Router>
  ),
  root,
);
