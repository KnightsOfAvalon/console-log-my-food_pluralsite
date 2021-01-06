#! /usr/bin/env node
// The comment above let's the computer know that we want to
// execute this file with node

/** THIS FILE IS A DUPLICATE OF THE INDEX.JS FILE THAT HAS BEEN **/
/** MODIFIED TO USE GENERATOR FUNCTIONS INSTEAD OF CUSTOM ITERATORS **/

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
        // This will make an API call to the database, then save
        // the retrieved data to a variable
        const { data } = await axios.get('http://localhost:3001/food');
        
        // Declaring the generator function
        function * listVeganFoods() {
          try { // Tries the code in curly braces
            let idx = 0; // Creates a variable that holds an index

            // Creates a filtered array from the array that was retrieved
            // from the database and saves it in the "veganOnly" variable
            const veganOnly = data.filter(food => {
              // Returns only those foods in the array that are vegan
              return food.dietary_preferences.includes('vegan');
            });

            // As long as you have not reached the end of the veganOnly
            // array...
            while (veganOnly[idx]) {
              // ...pass the value stored at the current index to the
              // iterator and wait
              yield veganOnly[idx];
              idx++; //...then increment the index
            }
          } catch (error) { // Catches any errors
            // Logs error to console
            console.log(
              'Something went wrong while listing vegan items',
              {error}
            )
          }
        }
          
        // Run the generator through a for...of loop
        for (let val of listVeganFoods()) {
          // Prints each value name to the console, effectively listing
          // all the vegan food items
          console.log(val.name)
        }

        readline.prompt(); // Returns to the prompt after listing food
      } /** End of 'list vegan foods' case **/
      break;

    case 'log' :
      { /** Start of 'log' case **/
        // Destructures the response from the json server and stores
        // just the data in a variable
        const { data } = await axios.get("http://localhost:3001/food");

        // Initializes an iterator for the data object
        const it = data[Symbol.iterator]();

        // Creates a variable that will hold a custom iterator
        let actionIt;

        function * actionGenerator() {
          try { // Tries the code within curly braces
            // Creates a variable that will hold the food item, then
            // waits for the food item to be provided by the iterator.
            const food = yield;

            // Creates a variable that will hold the serving size, then
            // waits for the serving size to be provided by the
            // iterator.
            const servingSize = yield askForServingSize();

            // After waiting, calls the displayCalories function, passing
            // in the required arguments.
            yield displayCalories(servingSize, food);

          } catch (error) { // Catches any errors
            console.log({error}); // Logs error to console
          }
        }

        // Declaring the first function in the actionGenerator.
        // This function will allow the user to specify how many
        // servings they had of a particular food item.
        function askForServingSize(food) {
          readline.question(
            // The question asked in the console
            `How many servings did you eat? (as a decimal: 1, 0.5, 1.25, etc...) `,
            // Callback method that will use the user's response as
            // the "servingSize" parameter.
            servingSize => {
              servingSizeNum = parseFloat(servingSize); // Creates a variable that holds the servingSize string converted to a float

              // If user says nevermind...
              if (servingSize === 'nevermind' || servingSize === 'n') {
                //...then the return() method will be called
                actionIt.return();
              } else if (typeof servingSizeNum !== "number" || isNaN(servingSizeNum)) {
                // If the user entry is not a number, have the
                // iterator throw this error
                actionIt.throw('Numbers only, please!');
              } else if (servingSizeNum <= 0) {
                // If the user attempts to enter a number less than
                // or equal to 0, have the iterator throw an error
                actionIt.throw('Only numbers greater than 0, please!');
              }

              // The next iteration for the iterator will begin
              actionIt.next(servingSize)
            }
          )
        }

        // Declaring the second function in the actionGenerator.
        // This function will calculate and display the calorie count
        // based on the food item and the servingSize provided by the
        // user. It also saves the user's info to the database.
        async function displayCalories(servingSize, food) {
          // Creates a variable that holds the calorie count for the
          // food item that is passed in
          const calories = food.calories;

          // Prints a console message with the calculated calorie count
          console.log(
            `${food.name} with a serving size of ${servingSize} has ${Number.parseFloat(calories * parseFloat(servingSize, 10)).toFixed()} calories.`
          );

          // Retrieves user's data from the database
          const { data } = await axios.get('http://localhost:3001/users/1');

          // Saves user's data log to a variable. If the log is undefined
          // (empty), then usersLog will be set equal to an empty array.
          const usersLog = data.log || [];

          // Constructs the new object that holds the user's updated
          // data and saves it to a variable.
          const putBody = {
            ...data,
            log: [
              ...usersLog,
              {
                [Date.now()]: {
                  food: food.name,
                  servingSize,
                  calories: Number.parseFloat(
                    calories * parseFloat(servingSize, 10),
                  )
                }
              }
            ]
          };

          // Creates an axios put command and transfers the new
          // user data to the database.
          await axios.put('http://localhost:3001/users/1', putBody, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

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

              //...and itialize the generator iterator
              actionIt = actionGenerator();
              actionIt.next(); //...and start the iterator

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

    case `today's log`:
      { /** Start of `today's log` case **/
        // This asks the user a question, then takes the user's
        // response and uses it as a parameter in the callback
        // function
        readline.question('Email: ', async emailAddress => {
          // Retrieves the user data for a specific user and
          // saves it to a variable
          const { data } = await axios.get(
            `http://localhost:3001/users?email=${emailAddress}`
          );

          // Saves just the log portion of the selected user's data
          // to a variable. If the log is empty, the variable will hold
          // an empty array.
          const foodLog = data[0].log || [];

          // Creates a variable that will hold total calorie count
          let totalCalories = 0;

          // Defining the generator function
          function * getFoodLog() {
            try { // Tries the code in curly braces
              // Passes the first item in the foodLog array to iterator
              // and waits
              yield* foodLog;
            } catch (error) { // Catches any errors
              // Logs error to console
              console.log(
                'Error reading the food log', { error }
              );
            }
          }

          // Initializes a generator iterator
          const logIterator = getFoodLog();

          // This for...of loop will iterate the logIterator
          for (const entry of logIterator) {
            // Creates a variable that will hold the timestamp
            // for the current log entry
            const timestamp = Object.keys(entry)[0];

            // If isToday() function returns true when passed
            // the timestamp of the current log entry...
            if (isToday(new Date(Number(timestamp)))) {
              //...then log the entry to the console
              console.log(
                `${entry[timestamp].food}, ${entry[timestamp].servingSize} serving`
              )

              //...and add calories from the log entry to totalCalories
              totalCalories += entry[timestamp].calories;

              //...also, if 12000 or more calories are logged today, print a special console message
              if (totalCalories >= 12000) {
                console.log(
                  `Impressive! You've reached 12,000 calories`
                );
                logIterator.return(); // Return from the iterator
              }
            }
          }

          //If no items were logged today...
          if (totalCalories === 0) {
            //...then print a special console message
            console.log(
              `There are no entries logged today. Please use the 'log' command to create entries for today.`
            );

            readline.prompt(); //...and call the prompt
          } else {
            //...otherwise...
            console.log('-------------------'); //...print a divider line

            //...print total calories to console
            console.log(`Total Calories: ${totalCalories}`);
            readline.prompt(); //...and call the prompt
          }          
        })
      } /** End of `today's log` case **/
      break;
  }
  readline.prompt(); // Calls the prompt
})

// Helper function to find out if a given timestamp is from
// today. This function is used when iterating the getFoodLog().
function isToday(timestamp) {
  // Creates variable that holds current timestamp
  const today = new Date();

  // Returns a boolean. It will return true only if all the following
  // conditions are met:
  return (
    // Numerical date for timestamp and today match
    timestamp.getDate() === today.getDate() &&

    // Numerical month for timestamp and today match
    timestamp.getMonth() === today.getMonth() &&

    // Numerical year for timestamp and today match
    timestamp.getFullYear() === today.getFullYear()
  )
}