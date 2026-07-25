"use client";

import { RANGE_PRESETS, describeRange, type DateRange } from "@/lib/gmail-query";

export default function DateRangePicker({
  value,
  onChange,
  disabled,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-range">
      <div className="admin-subnav" style={{ marginBottom: 12 }}>
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            className={`admin-chip${value.preset === p.key ? " active" : ""}`}
            disabled={disabled}
            onClick={() => onChange({ preset: p.key })}
          >
            {p.label}
          </button>
        ))}
        <button
          className={`admin-chip${value.preset === "custom" ? " active" : ""}`}
          disabled={disabled}
          onClick={() => onChange({ preset: "custom", from: "", to: today })}
        >
          Custom
        </button>
      </div>

      {value.preset === "custom" && (
        <div className="admin-row" style={{ marginBottom: 12 }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input
              className="admin-input"
              type="date"
              max={today}
              value={value.from ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input
              className="admin-input"
              type="date"
              max={today}
              value={value.to ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </div>
        </div>
      )}

      <p className="admin-muted-text" style={{ marginBottom: 0 }}>
        Covering <strong>{describeRange(value)}</strong>
      </p>
    </div>
  );
}
