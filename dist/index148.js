import d, { useMemo as K, useCallback as y, useRef as Ge } from "react";
import { DateLib as He } from "./index266.js";
import { createGetModifiers as _e } from "./index267.js";
import { getClassNamesForModifiers as Ie } from "./index268.js";
import { getComponents as Ue } from "./index269.js";
import { getDataAttributes as je } from "./index270.js";
import { getDefaultClassNames as Ve } from "./index271.js";
import { getFormatters as $e } from "./index272.js";
import { getLabels as qe } from "./index273.js";
import { getMonthOptions as ze } from "./index274.js";
import { getStyleForModifiers as Je } from "./index275.js";
import { getWeekdays as Qe } from "./index276.js";
import { getYearOptions as Xe } from "./index277.js";
import { createNoonOverrides as et } from "./index278.js";
import { UI as a, DayFlag as tt, SelectionState as W } from "./index279.js";
import { useAnimation as at } from "./index280.js";
import { useCalendar as ot } from "./index281.js";
import { dayPickerContext as nt } from "./index282.js";
import { useFocus as st } from "./index283.js";
import { useSelection as rt } from "./index284.js";
import { convertMatchersToTimeZone as R } from "./index285.js";
import { rangeIncludesDate as it } from "./index286.js";
import { toTimeZone as N } from "./index287.js";
import { isDateRange as dt } from "./index288.js";
import { enUS as lt } from "./index289.js";
function Ft(Z) {
  let e = Z;
  const f = e.timeZone;
  if (f && (e = {
    ...Z,
    timeZone: f
  }, e.today && (e.today = N(e.today, f)), e.month && (e.month = N(e.month, f)), e.defaultMonth && (e.defaultMonth = N(e.defaultMonth, f)), e.startMonth && (e.startMonth = N(e.startMonth, f)), e.endMonth && (e.endMonth = N(e.endMonth, f)), e.mode === "single" && e.selected ? e.selected = N(e.selected, f) : e.mode === "multiple" && e.selected ? e.selected = e.selected?.map((o) => N(o, f)) : e.mode === "range" && e.selected && (e.selected = {
    from: e.selected.from ? N(e.selected.from, f) : e.selected.from,
    to: e.selected.to ? N(e.selected.to, f) : e.selected.to
  }), e.disabled !== void 0 && (e.disabled = R(e.disabled, f)), e.hidden !== void 0 && (e.hidden = R(e.hidden, f)), e.modifiers)) {
    const o = {};
    Object.keys(e.modifiers).forEach((s) => {
      o[s] = R(e.modifiers?.[s], f);
    }), e.modifiers = o;
  }
  const { components: c, formatters: D, labels: G, dateLib: t, locale: H, classNames: l } = K(() => {
    const o = { ...lt, ...e.locale }, s = e.broadcastCalendar ? 1 : e.weekStartsOn, n = e.noonSafe && e.timeZone ? et(e.timeZone, {
      weekStartsOn: s,
      locale: o
    }) : void 0, u = e.dateLib && n ? { ...n, ...e.dateLib } : e.dateLib ?? n, i = new He({
      locale: o,
      weekStartsOn: s,
      firstWeekContainsDate: e.firstWeekContainsDate,
      useAdditionalWeekYearTokens: e.useAdditionalWeekYearTokens,
      useAdditionalDayOfYearTokens: e.useAdditionalDayOfYearTokens,
      timeZone: e.timeZone,
      numerals: e.numerals
    }, u);
    return {
      dateLib: i,
      components: Ue(e.components),
      formatters: $e(e.formatters),
      labels: qe(e.labels, i.options),
      locale: o,
      classNames: { ...Ve(), ...e.classNames }
    };
  }, [
    e.locale,
    e.broadcastCalendar,
    e.weekStartsOn,
    e.firstWeekContainsDate,
    e.useAdditionalWeekYearTokens,
    e.useAdditionalDayOfYearTokens,
    e.timeZone,
    e.numerals,
    e.dateLib,
    e.noonSafe,
    e.components,
    e.formatters,
    e.labels,
    e.classNames
  ]);
  e.today || (e = { ...e, today: t.today() });
  const { captionLayout: v, mode: E, navLayout: M, numberOfMonths: _ = 1, onDayBlur: I, onDayClick: B, onDayFocus: U, onDayKeyDown: j, onDayMouseEnter: V, onDayMouseLeave: $, onNextClick: q, onPrevClick: z, showWeekNumber: J, styles: m } = e, { formatCaption: Q, formatDay: X, formatMonthDropdown: de, formatWeekNumber: le, formatWeekNumberHeader: me, formatWeekdayName: ce, formatYearDropdown: ue } = D, ee = ot(e, t), { days: fe, months: g, navStart: S, navEnd: O, previousMonth: p, nextMonth: h, goToMonth: k } = ee, L = _e(fe, e, S, O, t), { isSelected: Y, select: x, selected: w } = rt(e, t) ?? {}, { blur: te, focused: ae, isFocusTarget: pe, moveFocus: oe, setFocused: C } = st(e, ee, L, Y ?? (() => !1), t), { labelDayButton: he, labelGridcell: be, labelGrid: ye, labelMonthDropdown: ke, labelNav: ne, labelPrevious: Ne, labelNext: ve, labelWeekday: De, labelWeekNumber: Me, labelWeekNumberHeader: ge, labelYearDropdown: we } = G, Ce = K(() => Qe(t, e.ISOWeek, e.broadcastCalendar, e.today), [t, e.ISOWeek, e.broadcastCalendar, e.today]), se = E !== void 0 || B !== void 0, P = y(() => {
    p && (k(p), z?.(p));
  }, [p, k, z]), F = y(() => {
    h && (k(h), q?.(h));
  }, [k, h, q]), We = y((o, s) => (n) => {
    n.preventDefault(), n.stopPropagation(), C(o), !s.disabled && (x?.(o.date, s, n), B?.(o.date, s, n));
  }, [x, B, C]), Ee = y((o, s) => (n) => {
    C(o), U?.(o.date, s, n);
  }, [U, C]), Be = y((o, s) => (n) => {
    te(), I?.(o.date, s, n);
  }, [te, I]), Se = y((o, s) => (n) => {
    const u = {
      ArrowLeft: [
        n.shiftKey ? "month" : "day",
        e.dir === "rtl" ? "after" : "before"
      ],
      ArrowRight: [
        n.shiftKey ? "month" : "day",
        e.dir === "rtl" ? "before" : "after"
      ],
      ArrowDown: [n.shiftKey ? "year" : "week", "after"],
      ArrowUp: [n.shiftKey ? "year" : "week", "before"],
      PageUp: [n.shiftKey ? "year" : "month", "before"],
      PageDown: [n.shiftKey ? "year" : "month", "after"],
      Home: ["startOfWeek", "before"],
      End: ["endOfWeek", "after"]
    };
    if (u[n.key]) {
      n.preventDefault(), n.stopPropagation();
      const [i, b] = u[n.key];
      oe(i, b);
    }
    j?.(o.date, s, n);
  }, [oe, j, e.dir]), Oe = y((o, s) => (n) => {
    V?.(o.date, s, n);
  }, [V]), Le = y((o, s) => (n) => {
    $?.(o.date, s, n);
  }, [$]), Ye = y((o, s) => (n) => {
    const u = Number(n.target.value), i = t.setMonth(t.startOfMonth(o), u);
    k(t.addMonths(i, -s));
  }, [t, k]), xe = y((o, s) => (n) => {
    const u = Number(n.target.value), i = t.setYear(t.startOfMonth(o), u);
    k(t.addMonths(i, -s));
  }, [t, k]), { className: Pe, style: Fe } = K(() => ({
    className: [l[a.Root], e.className].filter(Boolean).join(" "),
    style: { ...m?.[a.Root], ...e.style }
  }), [l, e.className, e.style, m]), Ae = je(e), re = (o) => {
    const s = m?.[a.Dropdown], n = m?.[o];
    if (!(!s && !n))
      return {
        ...s,
        ...n
      };
  }, ie = Ge(null);
  at(ie, !!e.animate, {
    classNames: l,
    months: g,
    focused: ae,
    dateLib: t
  });
  const Te = {
    dayPickerProps: e,
    selected: w,
    select: x,
    isSelected: Y,
    months: g,
    nextMonth: h,
    previousMonth: p,
    goToMonth: k,
    getModifiers: L,
    components: c,
    classNames: l,
    styles: m,
    labels: G,
    formatters: D
  };
  return d.createElement(
    nt.Provider,
    { value: Te },
    d.createElement(
      c.Root,
      { rootRef: e.animate ? ie : void 0, className: Pe, style: Fe, dir: e.dir, id: e.id, lang: e.lang ?? H.code, nonce: e.nonce, title: e.title, role: e.role, "aria-label": e["aria-label"], "aria-labelledby": e["aria-labelledby"], ...Ae },
      d.createElement(
        c.Months,
        { className: l[a.Months], style: m?.[a.Months] },
        !e.hideNavigation && !M && d.createElement(c.Nav, { "data-animated-nav": e.animate ? "true" : void 0, className: l[a.Nav], style: m?.[a.Nav], "aria-label": ne(), onPreviousClick: P, onNextClick: F, previousMonth: p, nextMonth: h }),
        g.map((o, s) => {
          const n = e.reverseMonths ? g.length - 1 - s : s;
          return d.createElement(
            c.Month,
            {
              "data-animated-month": e.animate ? "true" : void 0,
              className: l[a.Month],
              style: m?.[a.Month],
              // biome-ignore lint/suspicious/noArrayIndexKey: breaks animation
              key: s,
              displayIndex: s,
              calendarMonth: o
            },
            M === "around" && !e.hideNavigation && s === 0 && d.createElement(
              c.PreviousMonthButton,
              { type: "button", className: l[a.PreviousMonthButton], style: m?.[a.PreviousMonthButton], tabIndex: p ? void 0 : -1, "aria-disabled": p ? void 0 : !0, "aria-label": Ne(p), onClick: P, "data-animated-button": e.animate ? "true" : void 0 },
              d.createElement(c.Chevron, { disabled: p ? void 0 : !0, className: l[a.Chevron], style: m?.[a.Chevron], orientation: e.dir === "rtl" ? "right" : "left" })
            ),
            d.createElement(c.MonthCaption, { "data-animated-caption": e.animate ? "true" : void 0, className: l[a.MonthCaption], style: m?.[a.MonthCaption], calendarMonth: o, displayIndex: s }, v?.startsWith("dropdown") ? d.createElement(
              c.DropdownNav,
              { className: l[a.Dropdowns], style: m?.[a.Dropdowns] },
              (() => {
                const u = v === "dropdown" || v === "dropdown-months" ? d.createElement(c.MonthsDropdown, { key: "month", className: l[a.MonthsDropdown], "aria-label": ke(), disabled: !!e.disableNavigation, onChange: Ye(o.date, n), options: ze(o.date, S, O, D, t), style: re(a.MonthsDropdown), value: t.getMonth(o.date) }) : d.createElement("span", { key: "month" }, de(o.date, t)), i = v === "dropdown" || v === "dropdown-years" ? d.createElement(c.YearsDropdown, { key: "year", className: l[a.YearsDropdown], "aria-label": we(t.options), disabled: !!e.disableNavigation, onChange: xe(o.date, n), options: Xe(S, O, D, t, !!e.reverseYears), style: re(a.YearsDropdown), value: t.getYear(o.date) }) : d.createElement("span", { key: "year" }, ue(o.date, t));
                return t.getMonthYearOrder() === "year-first" ? [i, u] : [u, i];
              })(),
              d.createElement("span", { role: "status", "aria-live": "polite", style: {
                border: 0,
                clip: "rect(0 0 0 0)",
                height: "1px",
                margin: "-1px",
                overflow: "hidden",
                padding: 0,
                position: "absolute",
                width: "1px",
                whiteSpace: "nowrap",
                wordWrap: "normal"
              } }, Q(o.date, t.options, t))
            ) : d.createElement(c.CaptionLabel, { className: l[a.CaptionLabel], style: m?.[a.CaptionLabel], role: "status", "aria-live": "polite" }, Q(o.date, t.options, t))),
            M === "around" && !e.hideNavigation && s === _ - 1 && d.createElement(
              c.NextMonthButton,
              { type: "button", className: l[a.NextMonthButton], style: m?.[a.NextMonthButton], tabIndex: h ? void 0 : -1, "aria-disabled": h ? void 0 : !0, "aria-label": ve(h), onClick: F, "data-animated-button": e.animate ? "true" : void 0 },
              d.createElement(c.Chevron, { disabled: h ? void 0 : !0, className: l[a.Chevron], style: m?.[a.Chevron], orientation: e.dir === "rtl" ? "left" : "right" })
            ),
            s === _ - 1 && M === "after" && !e.hideNavigation && d.createElement(c.Nav, { "data-animated-nav": e.animate ? "true" : void 0, className: l[a.Nav], style: m?.[a.Nav], "aria-label": ne(), onPreviousClick: P, onNextClick: F, previousMonth: p, nextMonth: h }),
            d.createElement(
              c.MonthGrid,
              { role: "grid", "aria-multiselectable": E === "multiple" || E === "range", "aria-label": ye(o.date, t.options, t) || void 0, className: l[a.MonthGrid], style: m?.[a.MonthGrid] },
              !e.hideWeekdays && d.createElement(
                c.Weekdays,
                { "data-animated-weekdays": e.animate ? "true" : void 0, className: l[a.Weekdays], style: m?.[a.Weekdays] },
                J && d.createElement(c.WeekNumberHeader, { "aria-label": ge(t.options), className: l[a.WeekNumberHeader], style: m?.[a.WeekNumberHeader], scope: "col" }, me()),
                Ce.map((u) => d.createElement(c.Weekday, { "aria-label": De(u, t.options, t), className: l[a.Weekday], key: String(u), style: m?.[a.Weekday], scope: "col" }, ce(u, t.options, t)))
              ),
              d.createElement(c.Weeks, { "data-animated-weeks": e.animate ? "true" : void 0, className: l[a.Weeks], style: m?.[a.Weeks] }, o.weeks.map((u) => d.createElement(
                c.Week,
                { className: l[a.Week], key: u.weekNumber, style: m?.[a.Week], week: u },
                J && d.createElement(c.WeekNumber, { week: u, style: m?.[a.WeekNumber], "aria-label": Me(u.weekNumber, {
                  locale: H
                }), className: l[a.WeekNumber], scope: "row", role: "rowheader" }, le(u.weekNumber, t)),
                u.days.map((i) => {
                  const { date: b } = i, r = L(i);
                  if (r[tt.focused] = !r.hidden && !!ae?.isEqualTo(i), r[W.selected] = Y?.(b) || r.selected, dt(w)) {
                    const { from: A, to: T } = w;
                    r[W.range_start] = !!(A && T && t.isSameDay(b, A)), r[W.range_end] = !!(A && T && t.isSameDay(b, T)), r[W.range_middle] = it(w, b, !0, t);
                  }
                  const Ke = Je(r, m, e.modifiersStyles), Re = Ie(r, l, e.modifiersClassNames), Ze = !se && !r.hidden ? be(b, r, t.options, t) : void 0;
                  return d.createElement(c.Day, { key: `${i.isoDate}_${i.displayMonthId}`, day: i, modifiers: r, className: Re.join(" "), style: Ke, role: "gridcell", "aria-selected": r.selected || void 0, "aria-label": Ze, "data-day": i.isoDate, "data-month": i.outside ? i.dateMonthId : void 0, "data-selected": r.selected || void 0, "data-disabled": r.disabled || void 0, "data-hidden": r.hidden || void 0, "data-outside": i.outside || void 0, "data-focused": r.focused || void 0, "data-today": r.today || void 0 }, !r.hidden && se ? d.createElement(c.DayButton, { className: l[a.DayButton], style: m?.[a.DayButton], type: "button", day: i, modifiers: r, disabled: !r.focused && r.disabled || void 0, "aria-disabled": r.focused && r.disabled || void 0, tabIndex: pe(i) ? 0 : -1, "aria-label": he(b, r, t.options, t), onClick: We(i, r), onBlur: Be(i, r), onFocus: Ee(i, r), onKeyDown: Se(i, r), onMouseEnter: Oe(i, r), onMouseLeave: Le(i, r) }, X(b, t.options, t)) : !r.hidden && X(i.date, t.options, t));
                })
              )))
            )
          );
        })
      ),
      e.footer && d.createElement(c.Footer, { className: l[a.Footer], style: m?.[a.Footer], role: "status", "aria-live": "polite" }, e.footer)
    )
  );
}
export {
  Ft as DayPicker
};
//# sourceMappingURL=index148.js.map
