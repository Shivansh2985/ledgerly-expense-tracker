import { z } from "zod";
import { CATEGORY_KEYS, PAYMENT_MODE_KEYS } from "@/lib/constants";
import { parseDay, todayUTC } from "@/lib/dates";

const email = z.email();
const password = z.string().min(6).max(100);

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email,
  password,
});

export const loginSchema = z.object({ email, password });

export const expenseInputSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000_000),
  category: z.enum(CATEGORY_KEYS),
  paymentMode: z.enum(PAYMENT_MODE_KEYS),
  note: z.string().trim().min(1).max(200),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      try {
        parseDay(value);
        const maxDate = parseDay(todayUTC());
        maxDate.setUTCDate(maxDate.getUTCDate() + 1);
        return parseDay(value) <= maxDate;
      } catch {
        return false;
      }
    }, "Date must be a valid calendar day no later than tomorrow"),
});

export const expensePatchSchema = expenseInputSchema.partial();
