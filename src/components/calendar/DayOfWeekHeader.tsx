const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DayOfWeekHeader() {
  return (
    <div className="grid grid-cols-7 mb-1">
      {DAYS.map((day) => (
        <div
          key={day}
          className="text-center text-xs text-text-muted py-2 font-medium"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
