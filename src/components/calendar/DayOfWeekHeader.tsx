const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DayOfWeekHeader() {
  return (
    <div className="grid grid-cols-7 mb-2">
      {DAYS.map((day, i) => (
        <div key={i} className="text-center text-xs font-semibold text-text-muted py-1">
          {day}
        </div>
      ))}
    </div>
  );
}
