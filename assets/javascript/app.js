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

//Run Clock  
setInterval(function() {
    $('.current-time').html(moment().format('hh:mm:ss A'));
}, 1000);


// Initial Values
var database = firebase.database();
var fbTime = moment();
var newTime;
// Added variable to manipulate key to update the table content
var keyToUpdate = '';

// Create button event for user to add trains
$(".submit").on("click", function(event) {
    event.preventDefault();
    // Use the variables and form id's for user input
    var trainName = $('#trainName').val().trim();
    var trainDestination = $('#trainDestination').val().trim();
    var trainTime = moment($('#firstTrain').val().trim(), "HH:mm").format("X");
    var trainFreq = $('#trainFrequency').val().trim();

    // Creates local "temporary" object for holding the trains data
    // And use if statement to push data to database only if input fileds are not empty
    if (trainName !== '' && trainDestination !== '' && trainTime !== '' && trainFreq !== '') {
        // Clears all of the text-boxes
        $('#trainName').val('');
        $('#trainDestination').val('');
        $('#firstTrain').val('');
        $('#trainFrequency').val('');
        $('#trainKey').val('');

        fbTime = moment().format('X');
        // Push to firebase
        if (keyToUpdate === '') {
            database.ref().child('trains').push({
                trainName: trainName,
                trainDestination: trainDestination,
                trainTime: trainTime,
                trainFreq: trainFreq,
                currentTime: fbTime,
            });
        } else if (keyToUpdate !== '') {
            database.ref('trains/' + keyToUpdate).update({
                trainName: trainName,
                trainDestination: trainDestination,
                trainTime: trainTime,
                trainFreq: trainFreq,
                currentTime: fbTime,
            });
            keyToUpdate = '';
        }

    } else {
        return;
    }

});

// Update minutes away 
function timeUpdater() {
    database.ref().child('trains').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            fbTime = moment().format('X');
            database.ref('trains/' + childSnapshot.key).update({
                currentTime: fbTime,
            });
        });
    });
}

setInterval(timeUpdater, 10000);


// Database reference to firebase
database.ref().child('trains').on('value', function(snapshot) {
    $('tbody').empty();

    snapshot.forEach(function(childSnapshot) {
        var trainClass = childSnapshot.key;
        var trainId = childSnapshot.val();
        var firstTimeConverted = moment.unix(trainId.trainTime);
        var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
        var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
        var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

        if (timeDiff >= 0) {
            newTime = null;
            newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');

        } else {
            newTime = null;
            newTime = firstTimeConverted.format('hh:mm A');
            timeDiffTotal = Math.abs(timeDiff - 1);
        }
        // Each train's data appended into the table
        $('tbody').append("<tr class=" + trainClass + "><td>" + trainId.trainName + "</td><td>" +
            trainId.trainDestination + "</td><td>" +
            trainId.trainFreq + "</td><td>" +
            newTime + "</td><td>" +
            timeDiffTotal + "</td><td>" + "<button class='removeTrainBtn' data-train=" + trainClass + ">Remove</button>" + "</td></tr>"
        );

    });
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Database reference to firebase
database.ref().child('trains').on('child_changed', function(childSnapshot) {

    var trainClass = childSnapshot.key;
    var trainId = childSnapshot.val();
    var firstTimeConverted = moment.unix(trainId.trainTime);
    var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
    var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
    var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

    if (timeDiff > 0) {
        newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');
    } else {
        newTime = firstTimeConverted.format('hh:mm A');
        timeDiffTotal = Math.abs(timeDiff - 1);
    }

    $('.' + trainClass).html("<td>" + trainId.trainName + "</td><td>" +
        trainId.trainDestination + "</td><td>" +
        trainId.trainFreq + "</td><td>" +
        newTime + "</td><td>" +
        timeDiffTotal + "</td><td>" + "<button class='removeTrainBtn' data-train=" + trainClass + ">Remove</button>" + "</td></tr>"
    );

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Create button to remove train attribute
$(document).on('click', '.removeTrainBtn', function() {
    var trainKey = $(this).attr('data-train');
    database.ref("trains/" + trainKey).remove();
    $('.' + trainKey).remove();
});

