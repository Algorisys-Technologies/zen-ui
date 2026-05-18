import { useState } from "react";
import "./App.css";
import { NavLink, Routes, Route } from "react-router-dom";

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
import { Toaster } from "./components/toast/toaster";

/**
 * Navigation data — single source of truth for the sidebar.
 * Add a new component's route here and it shows up under the right group.
 */
type NavEntry = { to: string; label: string };
type NavGroup = { title: string; items: NavEntry[] };

const NAV: NavGroup[] = [
  {
    title: "Getting started",
    items: [{ to: "/", label: "Welcome" }],
  },
  {
    title: "Components",
    items: [
      { to: "/button-new", label: "Button" },
      { to: "/tooltip-new", label: "Tooltip" },
      { to: "/dropdown-menu", label: "DropdownMenu" },
      { to: "/separator", label: "Separator" },
      { to: "/switch-new", label: "Switch" },
      { to: "/checkbox-new", label: "Checkbox" },
      { to: "/radio-group", label: "RadioGroup" },
      { to: "/progress-new", label: "Progress" },
      { to: "/avatar-new", label: "Avatar" },
      { to: "/badge-new", label: "Badge" },
      { to: "/skeleton-new", label: "Skeleton" },
      { to: "/loading-new", label: "Loading" },
      { to: "/select-new", label: "Select" },
      { to: "/slider-new", label: "Slider" },
      { to: "/scroll-area-new", label: "ScrollArea" },
      { to: "/input-new", label: "Input + Textarea" },
      { to: "/number-field-new", label: "NumberField" },
      { to: "/date-picker-new", label: "DatePicker" },
      { to: "/otp-new", label: "InputOTP" },
      { to: "/phone-input-new", label: "PhoneInput" },
      { to: "/fab-new", label: "FAB" },
      { to: "/form-new", label: "Form (RHF + Zod)" },
      { to: "/data-table", label: "DataTable" },
      { to: "/lazy-options", label: "Lazy options" },
      { to: "/combobox", label: "Combobox + Async" },
      { to: "/alert", label: "Alert" },
      { to: "/dialog", label: "Dialog + AlertDialog" },
      { to: "/toast", label: "Toast" },
      { to: "/file-upload", label: "FileUpload" },
      { to: "/form-bound", label: "Bound* fields" },
      { to: "/stepper", label: "Stepper" },
    ],
  },
];

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
              shadcn / Radix-style React component library by Algorisys.
            </p>
          </div>
        </div>
        <div className="app-header-actions">
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
          </Routes>
        </main>
      </div>
      {/* Mounted once near the root so toast({...}) can be called from
       * anywhere in the demo tree. */}
      <Toaster />
    </div>
  );
};

export default App;
