// 1️⃣ What is Date in JavaScript?
// Date is a built-in object
// It represents a single moment in time
// Internally stored as milliseconds since Jan 1, 1970 (UTC)
// 👉 called a timestamp

const now = new Date();
const firstTimeStamp = new Date(0);
console.log(now);
console.log(firstTimeStamp);
console.log(new Date(1700000000000));
console.log(new Date("2026-01-13"));
console.log(new Date("2026-01-13T10:30:00"));