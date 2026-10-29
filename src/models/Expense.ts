import { model, models, Schema, Types, type InferSchemaType } from "mongoose";
import { CATEGORY_KEYS, PAYMENT_MODE_KEYS } from "@/lib/constants";

const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: CATEGORY_KEYS, required: true },
    paymentMode: { type: String, enum: PAYMENT_MODE_KEYS, required: true },
    note: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

expenseSchema.index({ userId: 1, date: -1 });

export type ExpenseDocument = InferSchemaType<typeof expenseSchema> & {
  _id: Types.ObjectId;
};
const Expense = models.Expense || model("Expense", expenseSchema);

export default Expense;
