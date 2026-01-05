// **************** Creating Arrays ****************8
// Method 1 Array Literal (99% of industry): Array literals almost always create packed (dense) arrays, which are fastest in JS engines (V8, SpiderMonkey).
// const a = [];
// const b = [1, 2, 3];
// const c = ["JS", true, null, { x: 1 }];
// // Array Constructor — THE MOST DANGEROUS ONE
// // Case 1: Multiple arguments
// let multipleArgument = new Array(1,2,3); // Same as [1,2,3] (but don’t use it)
// // Case 2: Single numeric argument 
// let singleNumericArgument = new Array(5); // [ <5 empty slots> ]
// // Case 3: Multiple arguments: Array.of() — THE SAFE CONSTRUCTOR
// let arrayDotOf = Array.of(5); // [5]
// let waseem = Array.of(1,2,3); // [1,2,3]  ===> Rare, but good to know. Rare, but good to know.
// console.log(a);
// console.log(b);
// console.log(c);
// console.log(multipleArgument);
// console.log(singleNumericArgument);
// console.log(arrayDotOf);
// console.log(waseem);

// const myString = "I Love trees";
// let arrayDotFrom = Array.from(myString);
// console.log(arrayDotFrom);


// Array-like objects (CRITICAL CONCEPT)
// const obj = {length: 3};
// let objectArray = Array.from(obj);
// console.log(objectArray);


// Spread Operator (...) — MODERN DEFAULT
// 