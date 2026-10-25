// Default expense policies and proof rules (used by seed.js and demoUsers.js)
export const defaultPolicies = [
  { category: "Flight", maxAmount: 30000, receiptRequired: true, requiresPreApproval: true, requiredDocs: ["Invoice", "Boarding pass"], extraProofAbove: 20000, noReceiptLimit: 0 },
  { category: "Train", maxAmount: 8000, receiptRequired: true, requiresPreApproval: false, requiredDocs: ["Ticket"], extraProofAbove: 0, noReceiptLimit: 0 },
  { category: "Hotel", maxAmount: 6000, receiptRequired: true, requiresPreApproval: true, requiredDocs: ["Invoice", "Stay record"], extraProofAbove: 4000, noReceiptLimit: 0 },
  { category: "Food", maxAmount: 1500, receiptRequired: false, requiresPreApproval: false, requiredDocs: [], extraProofAbove: 1000, noReceiptLimit: 500 },
  { category: "Local Transport", maxAmount: 2000, receiptRequired: false, requiresPreApproval: false, requiredDocs: [], extraProofAbove: 1500, noReceiptLimit: 500 },
  { category: "Conference", maxAmount: 25000, receiptRequired: true, requiresPreApproval: true, requiredDocs: ["Invoice", "Registration confirmation"], extraProofAbove: 15000, noReceiptLimit: 0 },
  { category: "Other", maxAmount: 3000, receiptRequired: true, requiresPreApproval: false, requiredDocs: ["Invoice"], extraProofAbove: 2000, noReceiptLimit: 300 },
];
