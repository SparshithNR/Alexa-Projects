Water Tracker Skill for Alexa
This skill is to keep track of the amout of water a user drinks per day.

When a user say "Alexa, as Water Tracker how much water did I drink today"
Alexa will reply "You drank x glasses of water today"
You can check samle utterness to see how to add, read and clear the data.

intent JSON has the structure of each intent.
sample utterness has which intent to be invoked for perticular invocation.

under src folder we have the functions to handle the utterness.

AlexaSkills.js we can keep the default. We need not change it.
All the handling code goes into index.js
Index.js uses dynamoDB to store the stats of each day. current date in DDMMYYYY format is used as unique key to store DB.
Before invoking make sure that you have table created in DynamoDB.
