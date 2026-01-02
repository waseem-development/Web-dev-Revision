const a = Number(prompt("Enter the first number:"));
const operator = prompt("Enter the operator (+, -, *, /):");
const b = Number(prompt("Enter the second number:"));

if (operator === "+") {
    console.log(`${a} + ${b} = ${a + b}`);
    document.writeln(`${a} + ${b} = ${a + b}`);
} else if (operator === "-") {
    console.log((`${a} - ${b} = ${a - b}`));
    document.writeln(`${a} - ${b} = ${a - b}`);
} else if (operator === "*") {
    console.log((`${a} * ${b} = ${a * b}`));
    document.writeln(`${a} * ${b} = ${a * b}`);
} else if (operator === "/") {
    if (    b === 0) {
        console.error("Error: Division by zero is not allowed.");
        document.writeln("Error: Division by zero is not allowed.");
    } else {
        console.log(`${a} / ${b} = ${a / b}`);
        document.writeln(`${a} / ${b} = ${a / b}`);
    }
}