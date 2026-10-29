import { formatDay } from "@/lib/dates";
import type { ExpenseDTO } from "@/lib/types";
import type { ExpenseDocument } from "@/models/Expense";

export function toExpenseDTO(doc: ExpenseDocument): ExpenseDTO {
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    category: doc.category,
    paymentMode: doc.paymentMode,
    note: doc.note,
    date: formatDay(doc.date),
    createdAt: doc.createdAt.toISOString(),
  };
}
