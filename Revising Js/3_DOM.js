// Get the content of the element with id "screen" including any HTML tags inside it
// const screen = document.querySelector("#screen").innerHTML;
// Get the content of the element with id "screen" including any HTML tags inside it
// const screen1 = document.querySelector("#screen");
// console.log("InnerHTML = ", screen);
// console.log("Screen = ", screen1);

// Get all elements with class "box" (returns an HTMLCollection)
// Loop through each button and print only the visible text (ignores any HTML tags inside)
// const buttons = document.getElementsByClassName("box");
// for (let i = 0; i < buttons.length; i++) {
//   console.log(buttons[i].innerText); // innerText shows only the visible text, not HTML
// }

/*
Difference:
- innerHTML: retrieves the HTML content of an element, including any HTML tags inside.
- innerText: retrieves only the visible text inside an element, ignoring HTML tags and hidden content.
*/

const inputs = document.getElementsByName("color");
for (let index = 0; index < inputs.length; index++) {
    console.log(inputs.value);
}
