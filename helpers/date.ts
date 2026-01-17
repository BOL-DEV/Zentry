export type DemoDateParts = {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
  /** 0-23 */
  hour?: number;
  /** 0-59 */
  minute?: number;
};

export function demoDate({
  year,
  month,
  day,
  hour = 0,
  minute = 0,
}: DemoDateParts): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatDateText(date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  }
}

export function formatDateTimeText(
  date: Date,
  options?: {
    month?: "short" | "long";
  }
): string {
  const monthStyle = options?.month ?? "short";

  try {
    const datePart = new Intl.DateTimeFormat("en-US", {
      month: monthStyle,
      day: "2-digit",
      year: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return `${datePart} at ${timePart}`;
  } catch {
    const datePart = date.toDateString();
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  }
}

export function demoDateText(parts: DemoDateParts): string {
  return formatDateText(demoDate(parts));
}

export function demoDateTimeText(
  parts: DemoDateParts,
  options?: {
    month?: "short" | "long";
  }
): string {
  return formatDateTimeText(demoDate(parts), options);
}
