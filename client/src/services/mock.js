// In-browser mock of the Meridian API, used only for the hosted preview (VITE_MOCK=1)
const now = () => new Date().toISOString(); const D = (s) => new Date(s).toISOString(); let n = 100; const gid = () => "m" + ++n;
const users = [["u1", "Pritimeena TV", "employee@company.com", "employee", "Engineering", "u2"], ["u2", "Arjun Menon", "manager@company.com", "manager", "Engineering"], ["u3", "Kavya Rao", "finance@company.com", "finance", "Finance"], ["u4", "Admin User", "admin@company.com", "admin", "Operations"]]
  .map(([_id, name, email, role, department, managerId]) => ({ _id, name, email, role, department, managerId, isActive: true }));
const pol = [["Flight", 30000, 1, 1], ["Train", 8000, 1, 0], ["Hotel", 6000, 1, 1], ["Food", 1500, 0, 0], ["Local Transport", 2000, 0, 0], ["Conference", 25000, 1, 1], ["Other", 3000, 1, 0]].map(([category, maxAmount, r, p], i) => ({ _id: "p" + i, category, maxAmount, receiptRequired: !!r, requiresPreApproval: !!p }));
const PX = { Flight: [["Invoice", "Boarding pass"], 20000, 0], Train: [["Ticket"], 0, 0], Hotel: [["Invoice", "Stay record"], 4000, 0], Food: [[], 1000, 500], "Local Transport": [[], 1500, 500], Conference: [["Invoice", "Registration confirmation"], 15000, 0], Other: [["Invoice"], 2000, 300] };
pol.forEach((p) => { [p.requiredDocs, p.extraProofAbove, p.noReceiptLimit] = PX[p.category]; });
const h = (id, name, role, action, comment = "", t = now()) => ({ approverId: id, name, role, action, comment, timestamp: t });
const trip = (code, dest, s, e, cost, status, extra = {}) => ({ _id: "t" + code, code: "TR-" + code, employeeId: "u1", destination: dest, purpose: "Client engagement and project review", startDate: D(s), endDate: D(e), travelMode: "Flight",
  accommodation: { required: true, hotel: "Taj Vivanta", nights: 3 }, travelCost: cost * .5, accommodationCost: cost * .4, otherCost: cost * .1, estimatedCost: cost, projectCode: "PRJ-204", status, createdAt: D("2026-09-10"), updatedAt: now(),
  approvals: [h("u1", "Pritimeena TV", "employee", "Submitted"), h("u2", "Arjun Menon", "manager", "Approved", "Looks good.")], ...extra });
const trips = [trip(1021, "Hyderabad", "2026-09-20", "2026-09-23", 24000, "Expense Submitted"), trip(1022, "Delhi", "2026-09-25", "2026-09-27", 18000, "Expense Submitted"), trip(1023, "Bangalore", "2026-10-12", "2026-10-15", 32000, "Approved"),
  trip(1024, "Mumbai", "2026-11-03", "2026-11-05", 21000, "Pending Manager Approval", { approvals: [h("u1", "Pritimeena TV", "employee", "Submitted")] }), trip(1025, "Pune", "2026-11-20", "2026-11-21", 9000, "Draft", { approvals: [] })];
const ex = (category, amount, date, description, receiptUrl, policyFlag = "") => ({ category, amount, date: D(date), description, receiptUrl, policyFlag });
const claims = [{ _id: "c2031", code: "EC-2031", employeeId: "u1", travelRequestId: "t1021", status: "Under Finance Review", submittedAt: D("2026-09-28"), createdAt: D("2026-09-28"), updatedAt: now(),
  expenses: [ex("Flight", 12400, "2026-09-20", "Return flight", "#"), ex("Hotel", 7200, "2026-09-21", "Hotel, 2 nights", "#", "Above Policy Limit"), ex("Food", 1100, "2026-09-22", "Meals", "")], approvals: [h("u1", "Pritimeena TV", "employee", "Submitted"), h("u2", "Arjun Menon", "manager", "Approved")] },
  { _id: "c2032", code: "EC-2032", employeeId: "u1", travelRequestId: "t1022", status: "Under Manager Review", submittedAt: D("2026-09-30"), createdAt: D("2026-09-30"), updatedAt: now(),
  expenses: [ex("Train", 5200, "2026-09-25", "Rajdhani tickets", "#"), ex("Local Transport", 900, "2026-09-26", "Cabs", "")], approvals: [h("u1", "Pritimeena TV", "employee", "Submitted")] }];
claims.forEach((c) => (c.totalAmount = c.expenses.reduce((s, x) => s + x.amount, 0)));
const seedV = (c, rows) => c.expenses.forEach((x, i) => { x._id = "e" + c._id + i; Object.assign(x, rows[i] || {}); x.verification = x.verification || { status: "Pending" }; });
const vOk = (note = "") => ({ status: "Verified", byName: "Arjun Menon", role: "manager", at: D("2026-09-29"), note });
seedV(claims[0], [{ vendor: "IndiGo", invoiceNo: "6E-88231", billAmount: 12400, billDate: D("2026-09-20"), verification: vOk(), documents: [{ docType: "Invoice", name: "indigo-invoice.pdf", url: "#" }, { docType: "Boarding pass", name: "boarding-pass.png", url: "#" }] }, { vendor: "Taj Vivanta", invoiceNo: "TV-4410", billAmount: 7200, billDate: D("2026-09-21"), verification: vOk("Within client-approved rate."), documents: [{ docType: "Invoice", name: "taj-invoice.pdf", url: "#" }, { docType: "Stay record", name: "folio.pdf", url: "#" }] },
  { verification: { status: "Rejected", byName: "Arjun Menon", role: "manager", at: D("2026-09-29"), note: "No receipt provided." } }]); claims[0].approvedAmount = 19600; claims.forEach((c) => (c.declaration = { byName: "Pritimeena TV", at: c.submittedAt, text: "I confirm these bills are genuine, relate to this business trip, and have not been claimed elsewhere." }));
seedV(claims[1], [{ vendor: "IRCTC", invoiceNo: "PNR-2284", billAmount: 5200, billDate: D("2026-09-25"), documents: [{ docType: "Ticket", name: "irctc-ticket.pdf", url: "#" }], employeeNote: "Ticket PDF attached. The PNR matches the booking." }, {}]);
const notes = [["u1", "Travel request approved", "Your travel request TR-1023 has been approved."], ["u2", "Travel request awaiting approval", "Pritimeena TV submitted TR-1024 to Mumbai."], ["u2", "Expense claim awaiting review", "Pritimeena TV submitted EC-2032 (₹6,100)."], ["u3", "Claim awaiting finance review", "EC-2031 (₹20,700) is ready for review."]]
  .map(([userId, title, message], i) => ({ _id: "n" + i, userId, title, message, read: false, createdAt: now() }));
const inr = (v) => "₹" + Number(v).toLocaleString("en-IN"); const u = (id) => users.find((x) => x._id === id);
const notify = (userId, title, message) => userId && notes.unshift({ _id: gid(), userId, title, message, read: false, createdAt: now() });
const notifyRole = (r, t, m) => users.filter((x) => x.role === r).forEach((x) => notify(x._id, t, m));
const fail = (status, message) => { throw { response: { status, data: { message } } }; };
const scope = (me) => (x) => me.role === "employee" ? x.employeeId === me._id : me.role === "manager" ? u(x.employeeId).managerId === me._id : true;
const pT = (t) => ({ ...t, employeeId: u(t.employeeId) }); const pC = (c) => ({ ...c, employeeId: u(c.employeeId), travelRequestId: trips.find((t) => t._id === c.travelRequestId) });
const total = (b) => (+b.travelCost || 0) + (+b.accommodationCost || 0) + (+b.otherCost || 0);
const req = (r, ...ro) => { if (!ro.includes(r.role)) fail(403, "Forbidden for your role"); };
function checkPolicy(t, e, hasFile) { const p = pol.find((x) => x.category === e.category); const f = []; if (p?.receiptRequired && !hasFile) f.push("Receipt Required"); if (p && e.amount > p.maxAmount) f.push("Above Policy Limit");
  const d = new Date(e.date); if (d < new Date(t.startDate).setHours(0, 0, 0, 0) || d > new Date(t.endDate).setHours(23, 59, 59, 999)) f.push("Outside Trip Period");
  if (p?.requiresPreApproval && !["Approved", "Trip Completed", "Expense Submitted"].includes(t.status)) f.push("Pre-Approval Missing"); return f.join(", "); }
const mkCtx = (me) => { const all = claims.flatMap((c) => c.expenses); const bkey = (x) => (x.vendor && x.invoiceNo ? (x.vendor + "|" + x.invoiceNo).trim().toLowerCase().replace(/\s+/g, " ") : "");
  return { bkey, billKeys: new Set(all.map(bkey).filter(Boolean)), hashes: new Set(all.flatMap((x) => [x.receiptHash, ...(x.documents || []).map((d) => d.hash)]).filter(Boolean)),
    mine: new Set(claims.filter((c) => c.employeeId === me._id).flatMap((c) => c.expenses).map((x) => [x.category, x.amount, new Date(x.date).toISOString().slice(0, 10)].join("|"))) }; };
const DECL = "I confirm these bills are genuine, relate to this business trip, and have not been claimed elsewhere.";
function buildItem(t, e, i, fileOf, hashKey, ctx) {
  const amount = +e.amount; if (!(amount > 0)) fail(400, "Each expense needs an amount greater than zero"); const p = pol.find((z) => z.category === e.category); const label = `${e.category} (item ${i + 1})`;
  const docs = (e.docs || []).slice(0, 5).map((m, j) => ({ f: fileOf(j), docType: String(m.docType || "Document").trim().slice(0, 40), hash: HASH[hashKey(j)] || "" })).filter((d) => d.f);
  const reason = String(e.missingReason || "").trim().slice(0, 300); const declared = !docs.length && !!reason;
  if (declared && !(p?.noReceiptLimit > 0 && amount <= p.noReceiptLimit)) fail(400, `${label}: a missing-receipt declaration is only allowed up to ₹${p?.noReceiptLimit || 0}`);
  if (!declared && p) { const have = docs.map((d) => d.docType.toLowerCase()); const need = [...p.requiredDocs]; if (p.extraProofAbove > 0 && amount > p.extraProofAbove) need.push("Supporting document");
    const miss = need.filter((r) => !have.includes(r.toLowerCase())); if (miss.length) fail(400, `${label}: missing required document(s): ${miss.join(", ")}`); }
  const fl = [checkPolicy(t, { ...e, amount }, docs.length > 0 || declared)]; const bn = e.billAmount === "" || e.billAmount == null ? null : +e.billAmount;
  if (docs.length && (!e.vendor?.trim() || !e.invoiceNo?.trim())) fl.push("Bill Details Missing"); if (bn != null && Math.abs(bn - amount) > 0.5) fl.push("Bill Amount Mismatch");
  if (e.billDate) { if (e.billDate !== e.date) fl.push("Bill Date Differs"); const bd = new Date(e.billDate); if (bd < new Date(t.startDate).setHours(0, 0, 0, 0) || bd > new Date(t.endDate).setHours(23, 59, 59, 999)) fl.push("Bill Outside Trip Period"); }
  if (e.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(e.gstin.toUpperCase())) fl.push("Invalid GSTIN");
  const bk = ctx.bkey(e); if (bk) { if (ctx.billKeys.has(bk)) fl.push("Duplicate Bill"); ctx.billKeys.add(bk); }
  docs.forEach((d) => { if (d.hash) { if (ctx.hashes.has(d.hash)) fl.push("Receipt Already Used"); ctx.hashes.add(d.hash); } });
  const mk = [e.category, amount, e.date].join("|"); if (ctx.mine.has(mk)) fl.push("Possible Duplicate"); ctx.mine.add(mk); if (declared) fl.push("Missing Receipt Declared");
  const documents = docs.map((d) => ({ docType: d.docType, name: d.f.name, url: URL.createObjectURL(d.f), size: d.f.size, hash: d.hash, uploadedAt: now() }));
  return { _id: gid(), category: e.category, amount, date: e.date, description: e.description, employeeNote: String(e.employeeNote || "").trim().slice(0, 500), vendor: e.vendor?.trim(), invoiceNo: e.invoiceNo?.trim(), gstin: e.gstin?.toUpperCase(),
    billAmount: bn ?? undefined, billDate: e.billDate, documents, receiptUrl: documents[0]?.url || "", receiptHash: docs[0]?.hash || "", missingReceipt: declared ? { reason } : undefined, policyFlag: [...new Set(fl.filter(Boolean))].join(", "), verification: { status: "Pending" } };
}
function route(m, url, body, me) {
  let x;
  if (m === "post" && url === "/auth/login") { const a = users.find((z) => z.email === body.email?.toLowerCase()); if (!a || body.password !== (a.password || "demo123")) fail(401, "Invalid email or password"); return { token: "tok-" + a._id, user: { ...a, id: a._id } }; }
  if (m === "post" && url === "/auth/register") { const email = String(body.email || "").trim().toLowerCase(); if (String(body.name || "").trim().length < 2) fail(400, "Please enter your full name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, "Enter a valid email address"); if (String(body.password || "").length < 8) fail(400, "Password must be at least 8 characters");
    if (users.some((z) => z.email === email)) fail(409, "An account with this email already exists. Try signing in.");
    const a = { _id: gid(), name: body.name.trim(), email, role: ["employee", "manager", "finance", "admin"].includes(body.role) ? body.role : "employee", department: "Unassigned", managerId: (body.role || "employee") === "employee" ? "u2" : undefined, isActive: true, password: body.password }; users.push(a); return { token: "tok-" + a._id, user: { ...a, id: a._id } }; }
  if (m === "post" && url === "/auth/oauth-demo") { let a = users.find((z) => z.email === "demo.user@gmail.com"); // preview only: simulates a first-time Google/LinkedIn sign-up
    if (!a) { a = { _id: gid(), name: body.provider === "google" ? "Demo Google User" : "Demo LinkedIn User", email: "demo.user@gmail.com", role: "employee", department: "Unassigned", managerId: "u2", isActive: true }; users.push(a); } return { token: "tok-" + a._id }; }
  if (!me) fail(401, "Unauthorized");
  if (url === "/me") return { ...me, id: me._id };
  if (m === "get" && url === "/travel") return trips.filter(scope(me)).filter((t) => me.role === "employee" || t.status !== "Draft").map(pT).reverse();
  if (m === "post" && url === "/travel") { req(me, "employee"); const t = { _id: gid(), code: "TR-" + (1000 + trips.length + 20), employeeId: me._id, ...body, estimatedCost: total(body), status: "Draft", approvals: [], createdAt: now(), updatedAt: now() }; trips.push(t); return t; }
  if ((x = url.match(/^\/travel\/(\w+)(?:\/(\w+))?$/))) { const t = trips.find((z) => z._id === x[1]); if (!t || !scope(me)(t)) fail(404, "Not found"); const a = x[2];
    if (m === "get") return pT(t);
    if (m === "put") { if (!["Draft", "Returned for Changes"].includes(t.status)) fail(400, "Only drafts or returned requests can be edited"); Object.assign(t, body, { estimatedCost: total(body) }); return t; }
    if (a === "submit") { if (!["Draft", "Returned for Changes"].includes(t.status)) fail(400, "Cannot submit in current status"); t.status = "Pending Manager Approval"; t.approvals.push(h(me._id, me.name, "employee", "Submitted")); notify(me.managerId, "Travel request awaiting approval", `${me.name} submitted ${t.code} to ${t.destination}.`); return t; }
    if (a === "review") { const map = { approve: "Approved", reject: "Rejected", return: "Returned for Changes" }; if (!map[body.action]) fail(400, "Invalid action"); if (body.action !== "approve" && !body.comment?.trim()) fail(400, "A comment is required to reject or return a request");
      t.status = map[body.action]; t.approvals.push(h(me._id, me.name, "manager", t.status, body.comment)); notify(t.employeeId, `Travel request ${t.status}`, `Your travel request ${t.code} has been ${t.status.toLowerCase()}.`); return t; }
    if (a === "complete") { if (t.status !== "Approved") fail(400, "Only approved trips can be completed"); t.status = "Trip Completed"; t.approvals.push(h(me._id, me.name, "employee", "Trip Completed")); return t; } }
  if (m === "get" && url === "/claims") return claims.filter(scope(me)).filter((c) => me.role !== "finance" || !(c.status === "Under Manager Review" || (c.status === "Proof Requested" && c.returnedTo !== "Under Finance Review"))).map(pC).reverse();
  if (m === "post" && url === "/claims") { req(me, "employee"); const { travelRequestId, expenses, declaration } = JSON.parse(body.get("data")); const t = trips.find((z) => z._id === travelRequestId);
    if (!["Approved", "Trip Completed"].includes(t?.status)) fail(400, "Claims need an approved trip"); if (!expenses?.length) fail(400, "Add at least one expense"); if (declaration !== true) fail(400, "Please confirm the declaration before submitting");
    const ctx = mkCtx(me); const items = expenses.map((e, i) => buildItem(t, e, i, (j) => body.get(`doc_${i}_${j}`), (j) => `doc_${i}_${j}`, ctx));
    const c = { _id: gid(), code: "EC-" + (2030 + claims.length + 1), employeeId: me._id, travelRequestId, expenses: items, totalAmount: items.reduce((s, z) => s + z.amount, 0), status: "Under Manager Review", submittedAt: now(), createdAt: now(), updatedAt: now(),
      declaration: { text: DECL, byName: me.name, at: now() }, approvals: [h(me._id, me.name, "employee", "Submitted")] };
    claims.push(c); t.status = "Expense Submitted"; notify(me.managerId, "Expense claim awaiting review", `${me.name} submitted ${c.code} (${inr(c.totalAmount)}).`); return c; }
  
if ((x = url.match(/^\/claims\/(\w+)(?:\/([\w-]+))?$/))) { const c = claims.find((z) => z._id === x[1]); if (!c || !scope(me)(c)) fail(404, "Not found"); const a = x[2]; if (m === "get") return pC(c);
    if (a === "return-for-proof") { req(me, "manager", "finance"); const stage = me.role === "manager" ? "Under Manager Review" : "Under Finance Review"; if (c.status !== stage) fail(400, "This claim is not awaiting your review");
      const need = c.expenses.filter((z) => z.verification?.status === "Needs Proof"); if (!need.length) fail(400, "Mark at least one item as Needs Proof first");
      c.status = "Proof Requested"; c.returnedTo = stage; c.approvals.push(h(me._id, me.name, me.role, "Proof Requested", need.map((z) => `${z.category}: ${z.verification.note}`).join(" | "))); notify(c.employeeId, "More proof needed", `${c.code}: ${need.length} item(s) need more documents. Open the claim to upload them.`); return c; }
    if (a === "proof") { req(me, "employee"); if (c.status !== "Proof Requested") fail(400, "This claim is not waiting for more proof"); const data = JSON.parse(body.get("data") || "{}"); const ctx = mkCtx(me);
      const needs = c.expenses.filter((z) => z.verification?.status === "Needs Proof"); if (!needs.length) fail(400, "No items need proof");
      needs.forEach((x) => { const entry = (data.items || []).find((z) => z.itemId === x._id); const docs = (entry?.docs || []).slice(0, 5).map((m2, j) => ({ f: body.get(`doc_${x._id}_${j}`), docType: String(m2.docType || "Document").trim().slice(0, 40), hash: HASH[`doc_${x._id}_${j}`] || "" })).filter((d) => d.f);
        if (!docs.length) fail(400, `Add at least one document for ${x.category}${x.description ? " (" + x.description + ")" : ""}`);
        const flags = (x.policyFlag || "").split(", ").filter((f) => f && f !== "Receipt Required" && f !== "Missing Receipt Declared");
        docs.forEach((d) => { if (d.hash && ctx.hashes.has(d.hash)) flags.push("Receipt Already Used"); ctx.hashes.add(d.hash); x.documents = [...(x.documents || []), { docType: d.docType, name: d.f.name, url: URL.createObjectURL(d.f), size: d.f.size, hash: d.hash, uploadedAt: now() }]; });
        x.receiptUrl = x.receiptUrl || x.documents[0].url; delete x.missingReceipt; if (entry?.message) x.employeeNote = String(entry.message).trim().slice(0, 500); x.policyFlag = [...new Set(flags)].join(", "); x.verification = { status: "Pending" }; });
      const stage = c.returnedTo || "Under Manager Review"; c.status = stage; delete c.returnedTo; c.approvals.push(h(me._id, me.name, "employee", "Proof Submitted"));
      if (stage === "Under Manager Review") notify(me.managerId, "Proof submitted", `${me.name} added the documents you asked for on ${c.code}.`); else notifyRole("finance", "Proof submitted", `${me.name} added the documents you asked for on ${c.code}.`); return c; }
    
if (a === "verify") { req(me, "manager", "finance"); const stage = me.role === "manager" ? "Under Manager Review" : "Under Finance Review"; if (c.status !== stage) fail(400, "This claim is not awaiting your review");
      const x = c.expenses.find((z) => z._id === body.itemId); if (!x) fail(400, "Expense item not found"); if (!["Verified", "Rejected", "Needs Proof"].includes(body.status)) fail(400, "Invalid status");
      if (["Rejected", "Needs Proof"].includes(body.status) && !body.note?.trim()) fail(400, "A note is required to reject a bill or ask for more proof");
      if (body.status === "Verified") { if (/Receipt Required/.test(x.policyFlag || "")) fail(400, "A receipt is required for this item. Reject it instead."); if (/Duplicate Bill|Receipt Already Used|Possible Duplicate|Missing Receipt Declared/.test(x.policyFlag || "") && !body.note?.trim()) fail(400, "Add a note explaining why this flagged bill is acceptable"); }
      x.verification = { status: body.status, byName: me.name, role: me.role, at: now(), note: body.note?.trim() || "" }; return c; }
    if (a === "manager" || a === "finance") { req(me, a); const from = a === "manager" ? "Under Manager Review" : "Under Finance Review"; if (c.status !== from) fail(400, "Claim is not awaiting this review");
      if (!["approve", "reject"].includes(body.action)) fail(400, "Invalid action");
      if (body.action === "approve") { const vs = c.expenses.map((z) => z.verification?.status || "Pending"); if (vs.includes("Pending")) fail(400, "Verify or reject every expense item before approving"); if (vs.includes("Needs Proof")) fail(400, "Some items need more proof. Send the claim back to the employee first."); if (!vs.includes("Verified")) fail(400, "Every item was rejected. Reject the claim instead.");
        c.approvedAmount = c.expenses.filter((z) => z.verification?.status === "Verified").reduce((t, z) => t + z.amount, 0); } if (body.action === "reject" && !body.comment?.trim()) fail(400, "A rejection reason is required");
      c.status = body.action === "reject" ? "Rejected" : a === "manager" ? "Under Finance Review" : "Approved for Payment"; c.approvals.push(h(me._id, me.name, a, body.action === "approve" ? "Approved" : "Rejected", body.comment));
      notify(c.employeeId, "Expense claim update", `Your expense claim ${c.code} is now: ${c.status}.`); if (a === "manager" && body.action === "approve") notifyRole("finance", "Claim awaiting finance review", `${c.code} (${inr(c.totalAmount)}) is ready for review.`); return c; }
    if (a === "pay") { req(me, "finance"); if (c.status !== "Approved for Payment") fail(400, "Claim is not approved for payment"); if (!body.date || !body.reference) fail(400, "Amount, date and reference are required");
      c.payment = { amount: c.approvedAmount ?? c.totalAmount, date: body.date, reference: body.reference }; c.status = "Paid"; c.updatedAt = now(); c.approvals.push(h(me._id, me.name, "finance", "Paid", body.reference)); notify(c.employeeId, "Reimbursement paid", `Your reimbursement of ${inr(c.approvedAmount ?? c.totalAmount)} has been paid.`); return c; } }
  if (url === "/notifications") return notes.filter((z) => z.userId === me._id);
  if (url === "/notifications/read") { notes.forEach((z) => z.userId === me._id && (z.read = true)); return { ok: true }; }
  if (url === "/reports") { req(me, "finance", "admin", "manager"); const cl = claims.filter(scope(me)), tr = trips.filter(scope(me)).filter((t) => t.status !== "Draft"); const sum = (a, f) => a.reduce((s, z) => s + f(z), 0);
    const grp = (a, k, v) => Object.entries(a.reduce((o, z) => ((o[k(z)] = (o[k(z)] || 0) + v(z)), o), {})).map(([name, value]) => ({ name, value }));
    return { totalTravel: sum(tr, (t) => t.estimatedCost), totalReimbursed: sum(cl.filter((c) => c.status === "Paid"), (c) => c.totalAmount), pendingReimbursements: sum(cl.filter((c) => !["Paid", "Rejected"].includes(c.status)), (c) => c.totalAmount),
      monthly: grp(cl, (c) => c.createdAt.slice(0, 7), (c) => c.totalAmount), department: grp(cl, (c) => u(c.employeeId).department, (c) => c.totalAmount), category: grp(cl.flatMap((c) => c.expenses), (e) => e.category, (e) => e.amount), avgApprovalHours: 6.5 }; }
  if (url === "/users") { req(me, "admin"); if (m === "get") return users.map((z) => ({ ...z, managerId: z.managerId ? { name: u(z.managerId)?.name } : null }));
    const nu = { _id: gid(), isActive: true, ...body, managerId: body.managerId || undefined }; users.push(nu); return nu; }
  if ((x = url.match(/^\/users\/(\w+)$/))) { req(me, "admin"); Object.assign(users.find((z) => z._id === x[1]), body); return {}; }
  if (m === "get" && url === "/policies") return pol;
  if ((x = url.match(/^\/policies\/(\w+)$/))) { req(me, "admin"); Object.assign(pol.find((z) => z._id === x[1]), body); return {}; }
  fail(404, "Not found");
}
const HASH = {};
export const mockAdapter = async (config) => { if (config.data instanceof FormData) for (const [k, v] of config.data.entries()) if (k.startsWith("doc_") && v.arrayBuffer) HASH[k] = [...new Uint8Array(await crypto.subtle.digest("SHA-256", await v.arrayBuffer()))].map((b) => b.toString(16).padStart(2, "0")).join(""); const tok = (config.headers?.Authorization || "").replace("Bearer ", ""); const me = users.find((z) => "tok-" + z._id === tok);
  const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data; const data = route(config.method, config.url.replace(/^\/api/, ""), body, me);
  return { data: data instanceof Object ? JSON.parse(JSON.stringify(data)) : data, status: 200, statusText: "OK", headers: {}, config }; };
