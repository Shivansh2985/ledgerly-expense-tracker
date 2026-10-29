import { CATEGORIES, PAYMENT_MODES, categoryMeta, modeMeta } from "@/lib/constants";
import type { StatementResponse } from "@/lib/types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function statementToCsv(statement: StatementResponse): string {
  const rows = [
    ["Date", "Note", "Category", "Payment Mode", "Amount"].map(csvCell).join(","),
    ...statement.items.map((item) => [
      item.date,
      item.note,
      categoryMeta(item.category).label,
      modeMeta(item.paymentMode).label,
      item.amount.toFixed(2),
    ].map(csvCell).join(",")),
    ["TOTAL", "", "", "", statement.totals.total.toFixed(2)].map(csvCell).join(","),
  ];
  return rows.join("\r\n");
}

function formatMoney(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function displayDay(day: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00.000Z`));
}

function drawSummaryBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  value: string,
) {
  doc.setDrawColor(226, 229, 238);
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(x, y, width, 20, 2, 2, "FD");
  doc.setTextColor(100, 107, 125);
  doc.setFontSize(8);
  doc.text(title, x + 5, y + 7);
  doc.setTextColor(35, 39, 55);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 5, y + 15);
  doc.setFont("helvetica", "normal");
}

export function generateStatementPdf(statement: StatementResponse): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(108, 92, 231);
  doc.rect(0, 0, pageWidth, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("Ledgerly", 16, 16);
  doc.setFontSize(13);
  doc.text("Expense Statement", 16, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${statement.user.name}  ·  ${statement.user.email}`, 16, 34);
  doc.text(`${displayDay(statement.range.from)} – ${displayDay(statement.range.to)}`, pageWidth - 16, 16, { align: "right" });
  doc.text(`Generated ${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(statement.generatedAt))} UTC`, pageWidth - 16, 25, { align: "right" });

  doc.setTextColor(35, 39, 55);
  const gap = 4;
  const boxWidth = (pageWidth - 32 - gap * 2) / 3;
  drawSummaryBox(doc, 16, 49, boxWidth, "TOTAL SPENT", formatMoney(statement.totals.total));
  drawSummaryBox(doc, 16 + boxWidth + gap, 49, boxWidth, "TRANSACTIONS", String(statement.totals.count));
  drawSummaryBox(doc, 16 + (boxWidth + gap) * 2, 49, boxWidth, "AVG / DAY", formatMoney(statement.totals.avgPerDay));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Category breakdown", 16, 81);
  autoTable(doc, {
    startY: 85,
    head: [["Category", "Count", "Amount", "Share %"]],
    body: statement.byCategory.map((item) => [
      CATEGORIES.find((category) => category.key === item.key)?.label ?? item.key,
      String(item.count),
      formatMoney(item.total),
      `${item.pct.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 247, 252] },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5 },
    margin: { left: 16, right: 16 },
  });

  const transactionY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Transactions", 16, transactionY + 10);
  autoTable(doc, {
    startY: transactionY + 14,
    head: [["Date", "Note", "Category", "Mode", "Amount"]],
    body: statement.items.map((item) => [
      displayDay(item.date),
      item.note,
      CATEGORIES.find((category) => category.key === item.category)?.label ?? item.category,
      PAYMENT_MODES.find((mode) => mode.key === item.paymentMode)?.label ?? item.paymentMode,
      formatMoney(item.amount),
    ]),
    foot: [["", "", "", "TOTAL", formatMoney(statement.totals.total)]],
    showFoot: "lastPage",
    theme: "grid",
    headStyles: { fillColor: [108, 92, 231], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [239, 237, 253], textColor: [40, 36, 76], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 247, 252] },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, overflow: "linebreak" },
    columnStyles: { 4: { halign: "right" } },
    margin: { left: 16, right: 16, bottom: 18 },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 125, 140);
    doc.text(`Page ${page} of ${pages}`, pageWidth - 16, doc.internal.pageSize.getHeight() - 8, { align: "right" });
  }

  return doc;
}
