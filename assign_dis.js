// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAuIT3vYOTxILrwX-ExHHIL2IRisMYrj8c",
    authDomain: "cs-ia-d28f4.firebaseapp.com",
    databaseURL: "https://cs-ia-d28f4-default-rtdb.firebaseio.com/",
    projectId: "cs-ia-d28f4",
    storageBucket: "cs-ia-d28f4.appspot.com",
    messagingSenderId: "715769462145",
    appId: "1:715769462145:web:70156048862e9c7d19fc80"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Function to get query parameter (for the date)
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Reformat the date from yyyy-mm-dd to dd-mm-yyyy
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

// Populate the page with assignments
auth.onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        const selectedDate = getQueryParam('date');
        const formattedDate = formatDate(selectedDate); // Format date
        document.getElementById('selected-date').textContent = formattedDate;

        const assignmentsRef = database.ref('users/' + userId + '/assignments');
        assignmentsRef.orderByChild('date').equalTo(selectedDate).once('value', function(snapshot) {
            const assignmentsList = document.getElementById('assignments-list');
            assignmentsList.innerHTML = ''; // Clear previous assignments

            if (!snapshot.exists()) {
                assignmentsList.innerHTML = '<p>No assignments found for this date.</p>';
            }

            snapshot.forEach(function(childSnapshot) {
                const assignment = childSnapshot.val();
                const assignmentDiv = document.createElement('div');
                assignmentDiv.className = 'assignment';

                // Create HTML for each assignment
                assignmentDiv.innerHTML = `
                    <h3>${assignment.subject}: ${assignment.name}</h3>
                    <p>${assignment.description}</p>
                    <p><strong>Time to complete:</strong> ${assignment.time} hours</p>
                    <p><strong>Support Links:</strong> ${getSupportLinks(assignment.subject)}</p>
                `;

                assignmentsList.appendChild(assignmentDiv);
            });
        });
    } else {
        // Redirect to login page if not authenticated
        window.location.href = '/Authentication/login.html';
    }
});

// Function to get placeholder support links for subjects
function getSupportLinks(subject) {
    const links = {
        'Math AA': '<a href="https://quester.io/c/PyF3MKlzASI?labels=PyF3MKlzASI_maths_aa" target="_blank">Quester Maths</a>, <a href="https://www.revisionvillage.com/ib-math/" target="_blank">Revision Village</a>',
        'English': '<a href="https://quester.io/c/PyF3MKlzASI?labels=PyF3MKlzASI_english_ll" target="_blank">Quester</a>, <a href="https://www.sparknotes.com/" target="_blank">SparkNotes</a>',
        'Physics': '<a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=81297&brKey=1774526800">EBSCO Search</a>, <a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=81295&brKey=804199785" target="_blank">Statista</a>, <a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=80916&brKey=1269309754" target="_blank">Britannica</a>, <a href="https://quester.io/c/PyF3MKlzASI?labels=PyF3MKlzASI_physics" target="_blank">Quester Physics</a>',
        'Chemistry': '<a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=80916&brKey=1269309754" target="_blank">Britannica</a>, <a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=81295&brKey=804199785" target="_blank">Statista</a>,  <a href=https://quester.io/c/PyF3MKlzASI?labels=PyF3MKlzASI_chemistry target="_blank">Quester</a>',
        'Biology': '<a href="#">Khan Academy</a>, <a href="https://uk.accessit.online/thn04/?serviceId=ExternalEvent&brSn=80916&brKey=1269309754" target="_blank">Britannica</a>',
        'Computer Science': '<a href="https://quester.io/c/PyF3MKlzASI?labels=PyF3MKlzASI_computer_science" target="_blank">Quester for Computer Science</a>, <a href="https://sites.google.com/ishthehague.nl/ish-dp-computer-science/home" target="_blank">ISH Computer Science Website </a>'
    };

    return links[subject] || links['Other'];
}
