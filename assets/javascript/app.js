// JavaScript Document

// Steps to complete
// 1. Initialize Firebase
// 2. Create button for adding trains - then update the html + update the database
// 3. Create a way to retrieve users from the firebase database.
// 4. Use Moment js to calculate the difference between train times
// 5. Bonus use the firebase database to update and remove trains


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCVA5OJpsiDVOMsjZG8A9jaz8HwZsXwDGA",
    authDomain: "bootcamptrain-1.firebaseapp.com",
    databaseURL: "https://bootcamptrain-1.firebaseio.com",
    projectId: "bootcamptrain-1",
    storageBucket: "bootcamptrain-1.appspot.com",
    messagingSenderId: "697351375869"
  };
  firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();	
// Initial Values
var trainName = "";
var trainDestination = "";
var trainTime = "";
var trainFrequency = "";
// Added variable to manipulate key to update the table content
var keyToUpdate = '';
	
// Create button event to clear trains
function clearTrains(event) {
    event.preventDefault();
    $("#trainName").val('');
    $("#trainDest").val('');
    $("#trainTime").val('');
    $("#trainFreq").val('');
}
	
	// Create button event for user to add trains
$("#add_trains").on("click", function (event) {
    event.preventDefault();

    // Use the variables and form id's for user input
    trainName = $("#trainName").val().trim();
    trainDestination = $("#trainDest").val().trim();
    trainTime = $("#trainTime").val().trim();
    trainFrequency = $("#trainFreq").val().trim();

    // Creates local "temporary" object for holding the trains data
	// And use if statement to push data to database only if input fileds are not empty
    if (trainName !== '' && trainDestination !== '' && trainTime !== '' && trainFrequency !== '') {
    var trains = {
        trainName: trainName,
        trainDestination: trainDestination,
        trainTime: trainTime,
        trainFrequency: trainFrequency
    };
	// Uploads data to firebase database

        if (keyToUpdate === '') {
            database.ref().push(trains);

        } else {
            database.ref(keyToUpdate).update(trains);
        }
        keyToUpdate = '';

    } else {
        return;
    }

   // Clears all of the text-boxes
    $("#trainName").val("");
    $("#trainDest").val("");
    $("#trainTime").val("");
    $("#trainFreq").val("");
});
	
	// Create Firebase event for adding trains data to the database and a row in the HTML when a user adds an entry
    database.ref().on("child_added", function (snapshot) {
	// store the variables value in the database
    var content = snapshot.val();
    // Create the variables to hold the train values
    var trainName = content.trainName;
    var trainDestination = content.trainDestination;
    var trainTime = content.trainTime;
    var trainFrequency = content.trainFrequency;
     // Use key to update and remove data
	var trainKey = snapshot.key;

    // Create the convert time for the trains
    var timeConversion = moment(trainTime, "hh:mm");
    // Moment js calculates the difference between train times
    var diffTime = moment().diff(moment(timeConversion), "minutes");
   // Moment js calculates the train times away %=remainder
    var timeRemainder = diffTime % trainFrequency;
   // Moment js calculates the minutes until next train
    var minutesAway = trainFrequency - timeRemainder;
    // Moment js calculates the arrival of the next train
    var nextTrain = moment().add(minutesAway, "minutes").format("hh:mm");
    
   // Each train's data appended into the table
   $("#train_table>tbody").append(
	   
"<tr><td>" + trainName + "</td><td>" + trainDestination + "</td><td>" + trainFrequency + "</td><td>" + nextTrain + "</td><td>" + minutesAway + "</td><td>" + "<button class='updateTrainBtn' data-train=" + trainKey + ">Update</button>" + "</td><td>" + "<button class='removeTrainBtn' data-train=" + trainKey + ">Remove</button>" + "</td></tr>"
);	
		


});

// Use firebase key to store data then remove
// Create variable to store data attribute 
function removeTrain() {
    var keyToRemove = $(this).attr("data-train");
    database.ref(keyToRemove).remove();
    $(this).closest('tr').remove();
}

//Use firebase key to store data then update
function updateTrain() { 
    keyToUpdate = $(this).attr("data-train");
    database.ref(keyToUpdate).once('value').then(function (childSnapshot) {

        $("#trainName").val(childSnapshot.val().trainName);
        $("#trainDest").val(childSnapshot.val().trainDestination);
        $("#trainTime").val(childSnapshot.val().trainTime);
        $("#trainFreq").val(childSnapshot.val().trainFrequency);
      });
}
	
// Calls clearForm function when user click on Clear button to remove form input data in the html page
$(document).on("click", ".clearButton", clearTrains);
// Calls updateTrain function when user click on Update button to update train info
$(document).on("click", ".updateTrainBtn", updateTrain);
// Calls removeTrain function when user click on Delete button to remove train
$(document).on("click", ".removeTrainBtn", removeTrain);
	
	
