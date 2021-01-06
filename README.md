# HOW TO USE THIS APP:

# Step 1

After cloning, make sure you start the json server by running the following command in the terminal:  
npx json-server --watch ./db.json --port 3001

# Step 2

In another terminal, run the following command to run the program:  
node ./index.js

## OR (alternative Step 2)

In another terminal, run the following command to run the updated program with additional features:  
node ./indexUsingGen.js

# Step 3

## Valid commands to use in the application:

log - Allows you to make new food log entries. You must enter food eaten followed by the serving size after this command.  
list vegan foods - Lists all the vegan foods that are recognized by the database.  
today's log - Lists all log entries for the current day. You must enter the default email (sam@acme.com) after this command.

