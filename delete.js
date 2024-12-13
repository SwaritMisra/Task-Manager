// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAuIT3vYOTxILrwX-ExHHIL2IRisMYrj8c",
    authDomain: "cs-ia-d28f4.firebaseapp.com",
    projectId: "cs-ia-d28f4",
    storageBucket: "cs-ia-d28f4.appspot.com",
    messagingSenderId: "715769462145",
    appId: "1:715769462145:web:70156048862e9c7d19fc80"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// When the page loads, fetch the assignments and populate the dropdown
auth.onAuthStateChanged(function(user) {
    if (user) {
        var userId = user.uid;
        var database_ref = database.ref('users/' + userId + '/assignments');

        database_ref.once('value').then(function(snapshot) {
            var assignmentSelect = document.getElementById('assignment-select');

            snapshot.forEach(function(childSnapshot) {
                var assignment = childSnapshot.val();
                var option = document.createElement('option');
                option.value = childSnapshot.key;
                option.text = `${assignment.name} - ${assignment.subject}`;
                assignmentSelect.appendChild(option);
            });
        }).catch(function(error) {
            console.error("Error fetching assignments: ", error);
        });
    } else {
        // No user signed in, redirect to login page
        window.location.href = '/Authentication/login.html';
    }
});

// Handle delete button click
document.getElementById('delete-button').addEventListener('click', function() {
    var assignmentSelect = document.getElementById('assignment-select');
    var selectedAssignmentId = assignmentSelect.value;

    if (selectedAssignmentId) {
        var user = firebase.auth().currentUser;
        if (user) {
            var userId = user.uid;
            var assignmentRef = database.ref('users/' + userId + '/assignments/' + selectedAssignmentId);

            // Delete the selected assignment
            assignmentRef.remove()
                .then(function() {
                    document.getElementById('status-message').textContent = 'Assignment deleted successfully!';
                    // Remove the deleted assignment from the dropdown
                    var selectedOption = assignmentSelect.querySelector(`option[value="${selectedAssignmentId}"]`);
                    selectedOption.remove();
                })
                .catch(function(error) {
                    document.getElementById('status-message').textContent = 'Error deleting assignment: ' + error.message;
                    console.error("Error deleting assignment: ", error);
                });
        } else {
            window.location.href = '/Authentication/login.html';
        }
    } else {
        document.getElementById('status-message').textContent = 'Please select an assignment to delete.';
    }
});
