// Wrong Reference: 
const a = [1, 2, 3];
const b = a; // in this sense both a and b point to the same memory address so this is actually not copied but it is referenced the same address now if we add or remove a value into any of these arrays change will occur in both not in one. For instance;
// console.log(`a = ${a}`);
// console.log(`b = ${b}`);
// a.push(21);
// b.push(22);
// console.log(`a = ${a}`);
// console.log(`b = ${b}`); // So the arrays are not copiied!!!

// TYPES OF COPIES (REAL DEFINITIONS)
/*
    There are three types of copies in JS
        1- Reference Copy
        2- Shallow Copy
        3- Deep Copy
*/ 
// SHALLOW COPY — THE MOST COMMON (AND DANGEROUS)
