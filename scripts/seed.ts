import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { formatDay } from "@/lib/dates";
import Expense from "@/models/Expense";
import User from "@/models/User";

type SeedExpense = {
  amount: number;
  category: string;
  paymentMode: string;
  note: string;
  date: Date;
  userId: unknown;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4_294_967_296;
  };
}

function amountBetween(random: () => number, min: number, max: number) {
  return Math.round(min + random() * (max - min));
}

async function seed() {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: "demo@ledgerly.app" },
    {
      $set: {
        name: "Aarav Sharma",
        email: "demo@ledgerly.app",
        passwordHash: await bcrypt.hash("demo1234", 10),
        currency: "INR",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  await Expense.deleteMany({ userId: user._id });

  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - 13);
  start.setUTCDate(1);
  const random = seededRandom(20261027);
  const entries: SeedExpense[] = [];

  const add = (
    date: Date,
    amount: number,
    category: string,
    paymentMode: string,
    note: string,
  ) => {
    entries.push({
      userId: user._id,
      date: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
      amount,
      category,
      paymentMode,
      note,
    });
  };

  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const day = new Date(date);
    const dayOfMonth = day.getUTCDate();
    const month = day.getUTCMonth();
    const weekday = day.getUTCDay();
    const dayIndex = Math.floor((end.getTime() - day.getTime()) / 86_400_000);

    if (dayOfMonth === 1) add(day, 18000, "rent", "net_banking", "Monthly apartment rent");
    if (dayOfMonth === 3) add(day, amountBetween(random, 850, 1900), "bills", "upi", "Electricity bill");
    if (dayOfMonth === 7) add(day, 999, "bills", "credit_card", "Home Wi-Fi bill");
    if (dayOfMonth === 14) add(day, 399, "bills", "upi", "Mobile recharge");
    if (dayOfMonth === 5) add(day, 5000, "investments", "net_banking", "Monthly SIP investment");
    if (weekday === 0) {
      add(day, amountBetween(random, 700, 2400), "groceries", random() < 0.68 ? "upi" : "credit_card", random() < 0.5 ? "BigBasket groceries" : "DMart weekly groceries");
    }

    if (random() > 0.22) {
      const count = 1 + Math.floor(random() * 3);
      for (let item = 0; item < count; item += 1) {
        const choice = Math.floor(random() * 6);
        if (choice === 0) add(day, amountBetween(random, 20, 55), "food", "cash", "Morning chai");
        else if (choice === 1) add(day, amountBetween(random, 100, 350), "transport", "upi", "Metro card recharge");
        else if (choice === 2) add(day, amountBetween(random, 50, 260), "transport", random() < 0.5 ? "cash" : "upi", "Auto ride");
        else if (choice === 3) add(day, amountBetween(random, 120, 360), "food", "upi", "Lunch near office");
        else if (choice === 4) add(day, amountBetween(random, 180, 560), "food", random() < 0.7 ? "upi" : "wallet", random() < 0.5 ? "Swiggy dinner" : "Zomato dinner");
        else add(day, amountBetween(random, 70, 220), "food", "upi", "Coffee and snack");
      }
    }

    if (dayIndex % 31 === 0) add(day, amountBetween(random, 650, 4500), "shopping", "credit_card", random() < 0.5 ? "Amazon household order" : "Myntra clothing");
    if (dayIndex % 73 === 0) add(day, amountBetween(random, 350, 1000), "entertainment", "credit_card", "Weekend movie tickets");
    if (dayIndex % 46 === 0) add(day, amountBetween(random, 250, 1200), "health", "upi", random() < 0.5 ? "Gym membership" : "Pharmacy essentials");
    if (dayIndex % 97 === 0) add(day, amountBetween(random, 500, 3500), "gifts", "upi", "Birthday gift");
    if (dayIndex === 110 || dayIndex === 330) {
      add(day, amountBetween(random, 5200, 9800), "travel", "credit_card", "Flight tickets for weekend trip");
      add(day, amountBetween(random, 3000, 6500), "travel", "credit_card", "Hotel stay for weekend trip");
    }
    if (month === 8 && dayOfMonth === 9) add(day, 1200, "education", "upi", "Online course subscription");
  }

  await Expense.insertMany(entries);
  console.log(`Seeded user ${user.email} with ${entries.length} expenses from ${formatDay(start)} through ${formatDay(end)}.`);
  console.log("Demo login: demo@ledgerly.app / demo1234");
  await mongoose.disconnect();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
