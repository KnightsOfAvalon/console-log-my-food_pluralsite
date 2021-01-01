#! /usr/bin/env node
// The comment above let's the computer know that we want to
// execute this file with node

const { default: axios } = require('axios');

// Using the Readline node module to deal with terminal prompts
const readline = require('readline').createInterface({
  input: process.stdin, // input will be taken from the terminal
  output: process.stdout, // output will be put out on the terminal
})

// This asks the user a question in the terminal. Once the user provides
// a response it is passed into the asynchronous callback function as
// "item"
readline.question(`What would you like to log today? `, async (item) => {

  // Destructures the response from the json server and stores just the
  // data in a variable
  const { data } = await axios.get("http://localhost:3001/food");

  // Initializes an iterator for the data object
  const it = data[Symbol.iterator]();

  // Starts iteration by calling it.next() and saves the object returned
  // (which has a value property and a done property) to the variable
  // named "position".
  let position = it.next();

  // This while loop will repeat until done is set to true
  while (!position.done) {
    // Creates a variable that holds the name property of the json object
    const food = position.value.name;

    // If the name property of the json object matches the user's
    // response to the question...
    if (food === item) {
      //...then print a message to the console
      console.log(`${item} has ${position.value.calories} calories.`);
    }

    // Call it.next() again and save the next object as "position"
    position = it.next();
  }

  readline.close(); // Close the readline and end the program
})