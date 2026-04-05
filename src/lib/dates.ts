import { format, subYears, startOfMonth, endOfMonth } from "date-fns";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatMonthYear(date: Date): string {
  return format(date, "yyyy년 M월");
}

export function getMonthRange(date: Date): { start: string; end: string } {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  };
}

export function getOneYearAgo(): string {
  return format(subYears(new Date(), 1), "yyyy-MM-dd");
}
