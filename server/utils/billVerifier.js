import fs from "fs"; import crypto from "crypto";
// Real file type from the first bytes, not the file name
export const detectType = (file) => { const b = Buffer.alloc(8); const fd = fs.openSync(file.path, "r"); fs.readSync(fd, b, 0, 8, 0); fs.closeSync(fd);
  if (b.subarray(0, 4).toString() === "%PDF") return "pdf"; if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "png"; return null; };
export const hashFile = (file) => crypto.createHash("sha256").update(fs.readFileSync(file.path)).digest("hex");
const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, " "); const day = (d) => new Date(d).toISOString().slice(0, 10);
export const billKey = (x) => (x.vendor && x.invoiceNo ? norm(x.vendor) + "|" + norm(x.invoiceNo) : "");
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
// Only these bill fields are accepted from the client
export const cleanBill = (e) => ({ vendor: String(e.vendor || "").trim().slice(0, 100), invoiceNo: String(e.invoiceNo || "").trim().slice(0, 60), gstin: String(e.gstin || "").trim().toUpperCase().slice(0, 15),
  billAmount: e.billAmount === "" || e.billAmount == null || isNaN(+e.billAmount) ? undefined : +e.billAmount, billDate: e.billDate ? new Date(e.billDate) : undefined });
// ctx: { billKeys:Set (all existing claims), hashes:Set (all existing), mine:Set (this employee's category|amount|date) }; mutated so duplicates inside one submission are caught too
export function billFlags({ item, trip, hasFile, hash, ctx }) { const f = [];
  if (hasFile && (!item.vendor || !item.invoiceNo)) f.push("Bill Details Missing");
  if (item.billAmount != null && Math.abs(item.billAmount - item.amount) > 0.5) f.push("Bill Amount Mismatch");
  if (item.billDate) { if (day(item.billDate) !== day(item.date)) f.push("Bill Date Differs");
    if (item.billDate < new Date(trip.startDate).setHours(0, 0, 0, 0) || item.billDate > new Date(trip.endDate).setHours(23, 59, 59, 999)) f.push("Bill Outside Trip Period"); }
  if (item.gstin && !GSTIN.test(item.gstin)) f.push("Invalid GSTIN");
  const bk = billKey(item); if (bk) { if (ctx.billKeys.has(bk)) f.push("Duplicate Bill"); ctx.billKeys.add(bk); }
  if (hash) { if (ctx.hashes.has(hash)) f.push("Receipt Already Used"); ctx.hashes.add(hash); }
  const mk = [item.category, item.amount, day(item.date)].join("|"); if (ctx.mine.has(mk)) f.push("Possible Duplicate"); ctx.mine.add(mk); return f; }
