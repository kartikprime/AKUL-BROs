const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export function MonthPicker({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const years = [year - 1, year, year + 1];

  return (
    <div className="card grid grid-cols-2 gap-3 p-3">
      <label className="block">
        <span className="label-text mb-2 block">MONTH</span>
        <select
          className="field"
          value={month}
          onChange={(event) => onChange(year, Number(event.target.value))}
        >
          {MONTHS.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label-text mb-2 block">YEAR</span>
        <select
          className="field"
          value={year}
          onChange={(event) => onChange(Number(event.target.value), month)}
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
