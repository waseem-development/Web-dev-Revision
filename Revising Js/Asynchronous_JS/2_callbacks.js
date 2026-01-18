const fs = require('fs');
const path = require('path');

// What is a Callback (REAL Definition)
// A callback is a function passed as an argument to another function,
// to be executed later when some operation finishes.
// Not async by definition — “called later” is the key.

// function greet(name, callback) {
//     console.log("Hello", name);
// }

// greet("Waseem", () => {
//     console.log("Welcome");
    
// })

// 📌 This is still synchronous.

// So:

// ❗ Callback ≠ Async automatically

// 2️⃣ Why Callbacks Were Needed

// JS needed a way to say:

// “When this slow thing finishes, run THIS code.”

// Example:

// setTimeout(() => {
//   console.log("Executed later");
// }, 1000);


// Here:

// JS does not wait

// Runtime stores callback

// Calls it after timer expires


// 3️⃣ How Async Callbacks ACTUALLY Work (Internals)


// console.log("Start");

// setTimeout(() => {
//     console.log("Callback");
    
// }, 1000);

// console.log("End");

// Step-by-step Execution

// 1️⃣ Start → Call Stack → printed
// 2️⃣ setTimeout → Web API (timer starts)
// 3️⃣ End → printed
// 4️⃣ Call Stack empty
// 5️⃣ Timer expires
// 6️⃣ Callback enters Callback Queue
// 7️⃣ Event Loop moves it to Call Stack
// 8️⃣ Callback executes


// 4️⃣ Callback Queue (Macrotask Queue)

// Also called:

// Task Queue

// Macrotask Queue

// Contains:

// setTimeout

// setInterval

// DOM events

// I/O callbacks (Node)

// 📌 Lower priority than microtasks


// 5️⃣ Error Handling in Callbacks (VERY IMPORTANT)
// ❌ Problematic Style
// setTimeout(() => {
//   throw new Error("Oops");
// }, 1000);

      
// ❌ This error cannot be caught outside.


// function readFile(path, callback) {
//     if (!path) {
//         return callback(new Error("Invalid path name"));
//     }
//     callback(null, "File Content");
// }


// readFile("file.txt", (err, data) => {
//     if (err) {
//         console.error(err);
//     return;
//     }
//     console.log(data);

// });
// This is the Node.js error-first callback pattern.

// Joins the folder of the current script with the filename
const filePath = path.join(__dirname, 'file.txt');
fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});