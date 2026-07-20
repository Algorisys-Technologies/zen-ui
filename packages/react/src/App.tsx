import { useState } from "react";
import "./App.css";
import { NavLink, Routes, Route, useLocation } from "react-router-dom";
import { NAV } from "./nav";

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

import Welcome from "./components/Welcome";
import ThemeSwitcher from "./components/theme-switcher";

import NewButtonDemo from "./components/NewButtonDemo";
import NewTooltipDemo from "./components/NewTooltipDemo";
import NewDropdownMenuDemo from "./components/NewDropdownMenuDemo";
import NewSeparatorDemo from "./components/NewSeparatorDemo";
import NewSwitchDemo from "./components/NewSwitchDemo";
import NewCheckboxDemo from "./components/NewCheckboxDemo";
import NewRadioGroupDemo from "./components/NewRadioGroupDemo";
import NewProgressDemo from "./components/NewProgressDemo";
import NewAvatarDemo from "./components/NewAvatarDemo";
import NewBadgeDemo from "./components/NewBadgeDemo";
import NewSkeletonDemo from "./components/NewSkeletonDemo";
import NewLoadingDemo from "./components/NewLoadingDemo";
import NewSelectDemo from "./components/NewSelectDemo";
import NewSliderDemo from "./components/NewSliderDemo";
import NewScrollAreaDemo from "./components/NewScrollAreaDemo";
import NewInputDemo from "./components/NewInputDemo";
import SearchDemo from "./components/SearchDemo";
import PasswordInputDemo from "./components/PasswordInputDemo";
import NewNumberFieldDemo from "./components/NewNumberFieldDemo";
import NewDatePickerDemo from "./components/NewDatePickerDemo";
import NewOTPDemo from "./components/NewOTPDemo";
import NewPhoneInputDemo from "./components/NewPhoneInputDemo";
import NewFABDemo from "./components/NewFABDemo";
import NewFormDemo from "./components/NewFormDemo";
import NewDataTableDemo from "./components/NewDataTableDemo";
import NewLazyOptionsDemo from "./components/NewLazyOptionsDemo";
import NewComboboxDemo from "./components/NewComboboxDemo";
import NewAlertDemo from "./components/NewAlertDemo";
import NewDialogDemo from "./components/NewDialogDemo";
import NewToastDemo from "./components/NewToastDemo";
import NewFileUploadDemo from "./components/NewFileUploadDemo";
import NewBoundFieldsDemo from "./components/NewBoundFieldsDemo";
import NewStepperDemo from "./components/NewStepperDemo";
import NewBannerDemo from "./components/NewBannerDemo";
import NewEmptyStateDemo from "./components/NewEmptyStateDemo";
import NewTabsDemo from "./components/NewTabsDemo";
import NewAccordionDemo from "./components/NewAccordionDemo";
import NewCardDemo from "./components/NewCardDemo";
import NewSheetDemo from "./components/NewSheetDemo";
import NewDateRangePickerDemo from "./components/NewDateRangePickerDemo";
import NewTagInputDemo from "./components/NewTagInputDemo";
import NewMultiComboboxDemo from "./components/NewMultiComboboxDemo";
import NewRatingDemo from "./components/NewRatingDemo";
import NewNpsDemo from "./components/NewNpsDemo";
import NewLikertDemo from "./components/NewLikertDemo";
import NewTimePickerDemo from "./components/NewTimePickerDemo";
import NewDateTimePickerDemo from "./components/NewDateTimePickerDemo";
import NewQRScannerDemo from "./components/NewQRScannerDemo";
import NewNotificationsInboxDemo from "./components/NewNotificationsInboxDemo";
import NewBreadcrumbDemo from "./components/NewBreadcrumbDemo";
import NewPaginationDemo from "./components/NewPaginationDemo";
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
import SkipToContentDemo from "./components/SkipToContentDemo";
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
import NewPopoverDemo from "./components/NewPopoverDemo";
import NewLinkDemo from "./components/NewLinkDemo";
import NewThemeDemo from "./components/NewThemeDemo";
import NewDirectionDemo from "./components/NewDirectionDemo";
import NewColorPickerDemo from "./components/NewColorPickerDemo";
import NewCarouselDemo from "./components/NewCarouselDemo";
import NewDynamicDateRangeDemo from "./components/NewDynamicDateRangeDemo";
import NewListReportDemo from "./components/NewListReportDemo";
import NewPivotDemo from "./components/NewPivotDemo";
import ReleaseNotes from "./components/ReleaseNotes";
import { Toaster } from "./components/toast/toaster";

/**
 * Navigation data — single source of truth for the sidebar.
 * Add a new component's route here and it shows up under the right group.
 */


const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <aside className={`sidebar${collapsed ? " is-collapsed" : ""}`} aria-hidden={collapsed}>
    {NAV.map((group) => (
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
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </aside>
);

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

            <Route path="/button-new" element={<NewButtonDemo />} />
            <Route path="/tooltip-new" element={<NewTooltipDemo />} />
            <Route path="/dropdown-menu" element={<NewDropdownMenuDemo />} />
            <Route path="/separator" element={<NewSeparatorDemo />} />
            <Route path="/switch-new" element={<NewSwitchDemo />} />
            <Route path="/checkbox-new" element={<NewCheckboxDemo />} />
            <Route path="/radio-group" element={<NewRadioGroupDemo />} />
            <Route path="/progress-new" element={<NewProgressDemo />} />
            <Route path="/avatar-new" element={<NewAvatarDemo />} />
            <Route path="/badge-new" element={<NewBadgeDemo />} />
            <Route path="/skeleton-new" element={<NewSkeletonDemo />} />
            <Route path="/loading-new" element={<NewLoadingDemo />} />
            <Route path="/select-new" element={<NewSelectDemo />} />
            <Route path="/slider-new" element={<NewSliderDemo />} />
            <Route path="/scroll-area-new" element={<NewScrollAreaDemo />} />
            <Route path="/input-new" element={<NewInputDemo />} />
            <Route path="/search" element={<SearchDemo />} />
            <Route path="/password-input" element={<PasswordInputDemo />} />
            <Route path="/number-field-new" element={<NewNumberFieldDemo />} />
            <Route path="/date-picker-new" element={<NewDatePickerDemo />} />
            <Route path="/otp-new" element={<NewOTPDemo />} />
            <Route path="/phone-input-new" element={<NewPhoneInputDemo />} />
            <Route path="/fab-new" element={<NewFABDemo />} />
            <Route path="/form-new" element={<NewFormDemo />} />
            <Route path="/data-table" element={<NewDataTableDemo />} />
            <Route path="/lazy-options" element={<NewLazyOptionsDemo />} />
            <Route path="/combobox" element={<NewComboboxDemo />} />
            <Route path="/alert" element={<NewAlertDemo />} />
            <Route path="/dialog" element={<NewDialogDemo />} />
            <Route path="/toast" element={<NewToastDemo />} />
            <Route path="/file-upload" element={<NewFileUploadDemo />} />
            <Route path="/form-bound" element={<NewBoundFieldsDemo />} />
            <Route path="/stepper" element={<NewStepperDemo />} />
            <Route path="/banner" element={<NewBannerDemo />} />
            <Route path="/empty-state" element={<NewEmptyStateDemo />} />
            <Route path="/tabs" element={<NewTabsDemo />} />
            <Route path="/accordion" element={<NewAccordionDemo />} />
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
            <Route path="/qr-scanner" element={<NewQRScannerDemo />} />
            <Route path="/notifications-inbox" element={<NewNotificationsInboxDemo />} />
            <Route path="/breadcrumb" element={<NewBreadcrumbDemo />} />
            <Route path="/pagination" element={<NewPaginationDemo />} />
            <Route path="/sidebar" element={<NewSidebarDemo />} />
            <Route path="/chart" element={<NewChartDemo />} />
            <Route path="/rich-text" element={<NewRichTextDemo />} />
            <Route path="/map" element={<NewMapDemo />} />
            <Route path="/camera" element={<NewCameraDemo />} />
            <Route path="/icon" element={<NewIconDemo />} />
            <Route path="/object" element={<NewObjectDemo />} />
            <Route path="/button-family" element={<NewButtonFamilyDemo />} />
            <Route path="/tree" element={<NewTreeDemo />} />
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
            <Route path="/filter-bar" element={<NewFilterBarDemo />} />
            <Route path="/page-header" element={<NewPageHeaderDemo />} />
            <Route path="/stat-card" element={<NewStatCardDemo />} />
            <Route path="/customizing" element={<NewCustomizingDemo />} />
            <Route path="/mask-input" element={<NewMaskInputDemo />} />
            <Route path="/popover" element={<NewPopoverDemo />} />
            <Route path="/link" element={<NewLinkDemo />} />
            <Route path="/theme" element={<NewThemeDemo />} />
            <Route path="/direction" element={<NewDirectionDemo />} />
            <Route path="/color-picker" element={<NewColorPickerDemo />} />
            <Route path="/carousel" element={<NewCarouselDemo />} />
            <Route path="/dynamic-date-range" element={<NewDynamicDateRangeDemo />} />
            <Route path="/list-report" element={<NewListReportDemo />} />
            <Route path="/pivot" element={<NewPivotDemo />} />
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
