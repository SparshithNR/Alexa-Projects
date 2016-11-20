/**
 * This simple application which keeps trck of water you drink on daily basis
 * Uses dynamoDB to store the data value, taking date in ddmmyyyy as unique string(dataStamp) and waterAmount : total number of glasses of water
 *
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask water tracker how much water did I drink today"
 *  Alexa: "You drank 12 glasses of water today!!!"
 *  User: "Alexa, ask water tracker add six glasses of water"
 *  Alexa: "You drank 18 glasses of water today!!!"
 */
/**
 * App ID for the skill
 */
var AWS = require("aws-sdk");
var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'}); 
/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkills');

var Water = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Water.prototype = Object.create(AlexaSkill.prototype);
Water.prototype.constructor = Water;

Water.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    // any initialization logic goes here
};

Water.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Water.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    // any cleanup logic goes here
};

Water.prototype.intentHandlers = {
    "GetWaterAmountIntent": function (intent, session, response) {
        handleGetWaterAmountRequest(response);
    },
    "AddWaterAmountIntent": function(intent, session, response) {
        handleAddWaterAmountRequest(intent, response);
    },
    "DeleteWaterAmountIntent": function(intent, session, response) {
        handleDeleteWaterAmountRequest(intent, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say tell me a space fact, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleGetWaterAmountRequest(response) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    var dateString = dd.toString()+mm.toString()+yyyy.toString();
    var cardTitle = "Drink water and stay Healthy";
    var speechOutput;
    //read the data from database
    //dataString has current Date in ddmmyyyy format
    dynamodb.getItem({
        TableName: "waterStore",
        Key: {
            dateStamp: {
                S:dateString
            }
        } 
    }, function(err, data) {
        if (err) {
            speechOutput = "Sorry Couldn't store value at this time. Please try again"+err;
            response.tellWithCard(speechOutput, cardTitle, speechOutput);
        } else {
             if (JSON.stringify(data) === JSON.stringify({})) {
                speechOutput = "You didn't drink water yet!!!";
            } else {
                var totalWater = data.Item.waterAmount.S;
                speechOutput = "You drank " + totalWater +" glasses of water today!!!";
            }
            response.tellWithCard(speechOutput, cardTitle, speechOutput);
        }
    });
    // Create speech output
    
    
}
function handleAddWaterAmountRequest(intent, response) {
    var glasses = intent.slots.glassNumber.value;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    var dateString = dd.toString()+mm.toString()+yyyy.toString();
    var cardTitle = "Drink water and stay Healthy";
    var speechOutput;
    dynamodb.getItem({
        TableName: "waterStore",
        Key: {
            dateStamp: {
                S:dateString
            }
        } 
    }, function(err, data) {
        if (err) {
            speechOutput = "Sorry Couldn't store value at this time. Please try again";
            response.tellWithCard(speechOutput, cardTitle, speechOutput);
            return;
        } else {
            var totalWater;
            var put;
            if (glasses) {
                if (JSON.stringify(data) === JSON.stringify({})) {
                    speechOutput = "You are starting a new day!!";
                    totalWater = 0;
                    put = true;
                } else {
                    totalWater = data.Item.waterAmount.S;
                }
                totalWater = parseInt(totalWater) + parseInt(glasses);
                //window.localStorage.setItem('totalWater', totalWater);
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1;
                var yyyy = today.getFullYear();
                dateString = dd.toString()+mm.toString()+yyyy.toString();
                var params = {
                        TableName: 'waterStore',
                        Item: {
                            dateStamp: {
                                S: dateString
                            },
                            waterAmount: {
                                S: JSON.stringify(totalWater)
                            }
                        }
                    };
                if(put) {
                    dynamodb.putItem(params , function (err, data) {
                        if (err) {
                            speechOutput = "Sorry Couldn't store value at this time. Please try again";
                        } else {
                            speechOutput = speechOutput + "You drank " + totalWater +" glasses of water today!!!" 
                        }
                        response.tellWithCard(speechOutput, cardTitle, speechOutput);
                    });
                } else {
                    dynamodb.updateItem({
                        TableName: 'waterStore',
                            Key : {
                                dateStamp: {
                                    S: dateString
                                }
                            },
                            UpdateExpression: "SET waterAmount = :label",
                            ExpressionAttributeValues: { 
                                ":label": {
                                    S:JSON.stringify(totalWater)
                                }
                            }  
                    } , function (err, data) {
                        if (err) {
                            speechOutput = "Sorry Couldn't store value at this time. Please try again";
                        } else {
                            speechOutput = "You drank " + totalWater +" glasses of water today!!!" ;
                        }
                        response.tellWithCard(speechOutput, cardTitle, speechOutput);
                    });
                }
            } else {
                speechOutput = "You didn't tell how much water!!";
                response.tellWithCard(speechOutput, cardTitle, speechOutput);
                
            }
        }
    });
}
function handleDeleteWaterAmountRequest(intent, response) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    dateString = dd.toString()+mm.toString()+yyyy.toString();
    //if user asks to clear out the data, just wipe out entry from table
    dynamodb.deleteItem({
        TableName: "waterStore",
        Key: {
            dateStamp: {
                S:dateString
            }
        }  
    }, function(err, data){
        var speechOutput;
        if(err) {
            speechOutput = "Couldn't clear the data";
        } else {
            speechOutput = "Cleared today's data";
        }
        var cardTitle = "Drink water and stay Healthy";
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    });
    
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SpaceGeek skill.
    var water = new Water();
    water.execute(event, context);
};