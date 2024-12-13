// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyAuIT3vYOTxILrwX-ExHHIL2IRisMYrj8c",
    authDomain: "cs-ia-d28f4.firebaseapp.com",
    databaseURL: "https://cs-ia-d28f4-default-rtdb.firebaseio.com/",
    projectId: "cs-ia-d28f4",
    storageBucket: "cs-ia-d28f4.appspot.com",
    messagingSenderId: "715769462145",
    appId: "1:715769462145:web:70156048862e9c7d19fc80"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Function to load subjects into the dropdown
function loadSubjects() {
    console.log("Loading subjects...");
    var subjectSelect = document.getElementById('subject');

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var currentUserId = user.uid; // Get the currently logged-in user's ID
            console.log("Authenticated user ID:", currentUserId);

            // Fetch user's HL and SL subjects from Firebase
            database.ref('users/' + currentUserId).once('value', function(snapshot) {
                if (snapshot.exists()) {
                    var userData = snapshot.val();
                    console.log("User data:", userData); // Debugging line

                    var subjects = [userData.hl1, userData.hl2, userData.hl3, userData.sl1, userData.sl2, userData.sl3];

                    subjects.forEach(function(subject) {
                        if (subject) {
                            console.log("Adding subject:", subject); // Debugging line
                            var option = document.createElement('option');
                            option.value = subject;
                            option.text = subject; // Use subject name directly
                            subjectSelect.appendChild(option);
                        }
                    });

                    if (subjectSelect.options.length === 0) {
                        console.log("No subjects were added.");
                    }
                } else {
                    console.log("Snapshot does not exist for user.");
                }
            }).catch(function(error) {
                console.log("Error fetching user data:", error);
            });
        } else {
            console.log("No user is authenticated.");
        }
    });
}

// Function to load time options, load in hours instead
function loadTimeOptions() {
    var timeSelect = document.getElementById('time');
    for (let i = 1; i <= 15; i += 1) {
        var option = document.createElement('option');
        option.value = i;
        option.text = `${i} hours`;
        timeSelect.appendChild(option);
    }
}

// Add assignment to Firebase
document.getElementById('assignmentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var currentUserId = user.uid; // with userid

            var assignmentData = {
                subject: document.getElementById('subject').value,
                date: document.getElementById('date').value,
                name: document.getElementById('assignmentname').value, // Fixed to match the ID in the HTML
                description: document.getElementById('assignmentdescription').value, // Fixed to match the ID in the HTML
                time: document.getElementById('time').value 
            };

            var newAssignmentKey = database.ref().child('users/' + currentUserId + '/assignments').push().key;
            var updates = {};
            updates['/users/' + currentUserId + '/assignments/' + newAssignmentKey] = assignmentData;

            database.ref().update(updates, function(error) {
                if (error) {
                    alert('Error adding assignment: ' + error.message);
                } else {
                    alert('Assignment added successfully!');
                    // Optionally, you can redirect the user or clear the form here
                }
            });
        } else {
            console.log("No user is authenticated.");
        }
    });
});

// Initialize the page
window.onload = function() {
    loadTimeOptions(); // Load time options on page load
    loadSubjects(); // Load subjects on page load
};
