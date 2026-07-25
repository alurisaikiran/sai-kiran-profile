"use client";

/**
 * Wrapper for one item in a list-style editor: title, reorder and remove
 * controls. Keeps every list section (roles, cards, demos…) behaving alike.
 */
export function ListCard({
  title,
  index,
  total,
  onRemove,
  onMove,
  children,
}: {
  title: string;
  index: number;
  total: number;
  onRemove: () => void;
  onMove?: (to: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-section-card">
      <div className="admin-section-card-head">
        <h2>{title}</h2>
        <div className="admin-card-actions">
          {onMove && (
            <>
              <button
                type="button"
                className="admin-icon-btn"
                title="Move up"
                disabled={index === 0}
                onClick={() => onMove(index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                title="Move down"
                disabled={index === total - 1}
                onClick={() => onMove(index + 1)}
              >
                ↓
              </button>
            </>
          )}
          <button type="button" className="admin-btn ghost" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/** "+ Add …" button shown above a list. */
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="admin-list-actions">
      <button type="button" className="admin-btn primary" onClick={onClick}>
        + {label}
      </button>
    </div>
  );
}
