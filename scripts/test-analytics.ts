import assert from "node:assert/strict";
import { computeAnalytics } from "@/lib/analytics";
import type { ExpenseDTO } from "@/lib/types";

function expense(
  id: string,
  date: string,
  amount: number,
  note: string,
  category: ExpenseDTO["category"] = "food",
): ExpenseDTO {
  return {
    id,
    date,
    amount,
    note,
    category,
    paymentMode: "upi",
    createdAt: `${date}T12:00:00.000Z`,
  };
}

const monthly = computeAnalytics(
  [
    expense("a", "2026-03-02", 20, "Morning chai"),
    expense("b", "2026-03-10", 40, " morning   CHAI "),
  ],
  "monthly",
  "2026-03-10",
  "2026-03-10",
  [
    expense("c", "2026-02-01", 30, "Rent", "rent"),
    expense("d", "2026-02-20", 20, "Groceries", "groceries"),
  ],
);

assert.equal(monthly.summary.total, 60);
assert.equal(monthly.summary.avgPerDay, 6);
assert.equal(monthly.summary.previousTotal, 50);
assert.equal(monthly.summary.changePct, 20);
assert.equal(monthly.timeline.length, 31);
assert.equal(monthly.previousTimeline.length, 31);
assert.equal(monthly.previousTimeline[0].total, 30);
assert.equal(monthly.previousTimeline[28].total, 0);
assert.equal(monthly.topNotes.length, 1);
assert.equal(monthly.topNotes[0].note, "Morning chai");
assert.equal(monthly.topNotes[0].count, 2);

const yearly = computeAnalytics(
  [
    expense("e", "2025-01-02", 100, "January"),
    expense("f", "2025-08-15", 1100, "August"),
  ],
  "yearly",
  "2025-08-15",
  "2025-08-15",
  [],
);
assert.equal(yearly.summary.total, 1200);
assert.equal(yearly.summary.avgPerMonth, 150);
assert.equal(yearly.timeline.length, 12);
assert.equal(yearly.heatmap.length, 365);

console.log("Analytics tests passed.");
