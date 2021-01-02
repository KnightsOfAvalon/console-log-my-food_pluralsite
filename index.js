#! /usr/bin/env node
// The comment above let's the computer know that we want to
// execute this file with node

const { default: axios } = require('axios');

// Using the Readline node module to deal with terminal prompts
const readline = require('readline').createInterface({
  input: process.stdin, // input will be taken from the terminal
  output: process.stdout, // output will be put out on the terminal
  prompt: 'enter command > ' // when prompt is called, the enter command string will print in the console
});

readline.prompt(); // Calls the prompt

// Listens for user response
readline.on('line', async line => {
  // Switch will control functionality based on user input
  switch (line.trim()) {
    case 'list vegan foods':
      { /** Start of 'list vegan foods' case **/
        // This will make an API call to the database, then use
        // the retrieved data as a parameter in the then method
        axios.get('http://localhost:3001/food').then(({data}) => {
          let idx = 0; // Creates a variable that holds an index
          // Creates a filtered array from the array that was retrieved
          // from the database and saves it in the "veganOnly" variable
          const veganOnly = data.filter(food => {
            // Returns only those foods in the array that are vegan
            return food.dietary_preferences.includes('vegan');
          })

          // This is our custom interator
          const veganIterable = {
            // Implements the Symbol.iterator method
            [Symbol.iterator]() {
              return {
                // Returns the iterator itself
                [Symbol.iterator]() { return this; },

                // Returns the required next() method
                next() {
                  // Creates a variable that hold the current item in
                  // the veganOnly array
                  const current = veganOnly[idx];
                  idx++; // Increments the index for the next iteration

                  // If the current item is not undefined...
                  if (current) {
                    //... then return the value property as current
                    // and the done property as false (not done 
                    // iterating)
                    return { value: current, done: false }
                  } else {
                    //... otherwise, return the value property as current
                    // and the done property as true (done iterating
                    // because there are no more items)
                    return { value: current, done: true }
                  }
                },
              };
            },
          };

          // Run the custom iterator through a for...of loop
          for (let val of veganIterable) {
            // Prints each value name to the console, effectively listing
            // all the vegan food items
            console.log(val.name)
          }

          readline.prompt(); // Returns to the prompt after listing food
        });
      } /** End of 'list vegan foods' case **/
      break;

    case 'log' :
      { /** Start of 'log' case **/
        // Destructures the response from the json server and stores
        // just the data in a variable
        const { data } = await axios.get("http://localhost:3001/food");

        // Initializes an iterator for the data object
        const it = data[Symbol.iterator]();

        // Creates a variable that will hold another custom iterator
        let actionIt;

        // Another custom iterator
        const actionIterator = {
          // Implements the Symbol.iterator method
          [Symbol.iterator]() {
            // Creates a variable that stores the current position
            // in the sequence of actions
            const positions = [...this.actions];

            return {
              // Iterator returns itself
              [Symbol.iterator]() {
                return this;
              },

              // Returns the required next() method. Some of the next
              // calls can have arguments, so we pass in ...args to the
              // next method
              next(...args) {
                // If there are still items in the positions array...
                if (positions.length > 0) {
                  //...then take the first function out of the positions
                  // array and store it in the "position" variable
                  const position = positions.shift();

                  //...then call the function stored in "position",
                  // passing in any required arguments.
                  const result = position(...args);

                  //...finally, return value property as result and
                  // done property as false (not done iterating if
                  // there are still items in the positions array)
                  return { value: result, done: false}
                } else {
                  // Otherwise, if there are no items in the positions
                  // array...
                  return { done: true };
                }
              }
            }
          },
          // This property holds an array of actions (functions) we
          // will need
          actions: [askForServingSize, displayCalories],
        }

        // Declaring the first function in the iterator's action array.
        // This function will allow the user to specify how many
        // servings they had of a particular food item.
        function askForServingSize(food) {
          readline.question(
            // The question asked in the console
            `How many servings did you eat? (as a decimal: 1, 0.5, 1.25, etc...)`,
            // Callback method that will use the user's response as
            // the "servingSize" parameter. The next iteration for the
            // iterator will begin.
            servingSize => {
              actionIt.next(servingSize, food)
            }
          )
        }

        // Declaring the second function in the iterator's action array.
        // This function will calculate and display the calorie count
        // based on the food item and the servingSize provided by the
        // user.
        function displayCalories(servingSize, food) {
          // Creates a variable that holds the calorie count for the
          // food item that is passed in
          const calories = food.calories;

          // Prints a console message with the calculated calorie count
          console.log(
            `${food.name} with a serving size of ${servingSize} has ${Number.parseFloat(calories * parseFloat(servingSize, 10)).toFixed()} calories.`
          );

          // Calls the next() method. The next iteration will begin.
          actionIt.next();
          readline.prompt(); // returns to the prompt
        };

        // This asks the user a question in the terminal. Once the user
        // provides a response it is passed into the asynchronous
        // callback function as "item"
        readline.question(`What would you like to log today? `, async (item) => {
          // Starts iteration by calling it.next() and saves the object
          // returned (which has a value property and a done property)
          // to the variable named "position".
          let position = it.next();

          // This while loop will repeat until done is set to true
          while (!position.done) {
            // Creates a variable that holds the name property of the
            // json object
            const food = position.value.name;

            // If the name property of the json object matches the user's
            // response to the question...
            if (food === item) {
              //...then print a message to the console
              console.log(`${item} has ${position.value.calories} calories.`);

              //...and itialize the custom iterator
              actionIt = actionIterator[Symbol.iterator]();

              //...and, finally, call next on the iterator, passing in
              // needed arguments
              actionIt.next(position.value);
            }

            // Call it.next() again and save the next object as
            // "position"
            position = it.next();
          }

          readline.prompt(); // Returns to the prompt after logging food
        })
      } /** End of 'log' case **/
      break;
  }
})

