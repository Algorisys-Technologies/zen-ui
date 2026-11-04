<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# date-picker — API (React, the parity reference)

Exports: `DatePicker`, `Calendar`, `DatePickerProps`, `CalendarProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-date-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DatePicker

- `value?: Date | undefined`
- `defaultValue?: Date | undefined`
- `onValueChange?: ((date: Date | undefined) => void) | undefined`
- `placeholder?: string | undefined`
- `disabled?: import("react-day-picker/dist/esm/index").Matcher | import("react-day-picker/dist/esm/index").Matcher[] | undefined`
- `className?: string | undefined`
- `formatDate?: ((date: Date) => string) | undefined` — Format displayed in the trigger. Defaults to toLocaleDateString().
- `initialFocus?: "first" | "selected" | undefined` — Where focus lands when the calendar opens. "first" (default, as before): the first control, "Previous month". "selected": the chosen day (else today), so the arrow keys move between days at once; the calendar then opens on the chosen day's month. "selected" becomes the default in the next major version.

### Calendar

- from `react-day-picker`: `mode?`, `required?`, `className?`, `classNames?`, `modifiersClassNames?`, `style?`, `styles?`, `modifiersStyles?`, `id?`, `defaultMonth?`, `month?`, `numberOfMonths?`, `startMonth?`, `endMonth?`, `pagedNavigation?`, `reverseMonths?`, `hideNavigation?`, `disableNavigation?`, `captionLayout?`, `reverseYears?`, `navLayout?`, `fixedWeeks?`, `hideWeekdays?`, `showOutsideDays?`, `showWeekNumber?`, `animate?`, `broadcastCalendar?`, `ISOWeek?`, `timeZone?`, `noonSafe?`, `components?`, `footer?`, `autoFocus?`, `disabled?`, `hidden?`, `today?`, `modifiers?`, `labels?`, `formatters?`, `dir?`, `aria-label?`, `aria-labelledby?`, `role?`, `nonce?`, `title?`, `lang?`, `locale?`, `numerals?`, `weekStartsOn?`, `firstWeekContainsDate?`, `useAdditionalWeekYearTokens?`, `useAdditionalDayOfYearTokens?`, `onMonthChange?`, `onNextClick?`, `onPrevClick?`, `onDayClick?`, `onDayFocus?`, `onDayBlur?`, `onDayKeyDown?`, `onDayMouseEnter?`, `onDayMouseLeave?`, `dateLib?`

### Types

- `DatePickerProps` — type (see the component above)
- `CalendarProps` — type (see the component above)
