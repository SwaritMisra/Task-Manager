// firebase config
var firebaseConfig = {
    apiKey: "AIzaSyAuIT3vYOTxILrwX-ExHHIL2IRisMYrj8c",
    authDomain: "cs-ia-d28f4.firebaseapp.com",
    projectId: "cs-ia-d28f4",
    storageBucket: "cs-ia-d28f4.appspot.com",
    messagingSenderId: "715769462145",
    appId: "1:715769462145:web:70156048862e9c7d19fc80"
};

// initiate firebase
firebase.initializeApp(firebaseConfig);

// initiate firebase variables
const auth = firebase.auth();
const database = firebase.database();

const WEEKDAY_HOURS = 4;
const WEEKEND_HOURS = 6;
let assignments = {}; // Store fetched assignments here
let dailyStudyPlan = {}; // Store the daily study plan

// Get user details and display greeting
auth.onAuthStateChanged(function(user) {
    if (user) {
        var userId = user.uid;
        var database_ref = database.ref('users/' + userId);

        // display name
        database_ref.once('value').then(function(snapshot) {
            var fullName = snapshot.val().full_name;
            document.getElementById('greeting').textContent = 'Hello, ' + fullName;
        });

        loadAssignmentsAndPrepareTimeline(userId);
    } else {
        // redirect to login
        window.location.href = '/Authentication/login.html';
    }
});

function loadAssignmentsAndPrepareTimeline(userId) {
    console.log("loadAssignmentsAndPrepareTimeline called with userId:", userId);
    const today = new Date();

    database.ref('users/' + userId + '/assignments').once('value', function(snapshot) {
        console.log("Assignments snapshot:", snapshot.val());
        const upcomingAssignments = [];
        assignments = {}; //reset the assignments object

        snapshot.forEach(function(childSnapshot) {
            var assignment = childSnapshot.val();
            console.log("Processing assignment:", assignment);
            var date = new Date(assignment.date);

            //remove assignments that are past their due date
            if (date < today) {
                console.log("Removing past due assignment:", assignment);
                childSnapshot.ref.remove();
            } else {
                const assignmentDate = assignment.date;

                if (!assignments[assignmentDate]) {
                    assignments[assignmentDate] = [];
                }

                assignments[assignmentDate].push({
                    id: childSnapshot.key,
                    name: assignment.name,
                    subject: assignment.subject,
                    description: assignment.description,
                    time: assignment.time,
                    completed: assignment.time === '0'
                });

                //days left for assignment calculation
                const daysLeft = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
                upcomingAssignments.push({
                    id: childSnapshot.key,
                    ...assignment,
                    daysLeft: daysLeft
                });
            }
        });

        console.log("Final assignments object:", assignments);
        console.log("Upcoming assignments:", upcomingAssignments);

        renderCalendar(); //re-render calendar with assignments
        distributeStudyTime(upcomingAssignments); //distribute time to complete
    }).catch(error => {
        console.error("Error loading assignments:", error);
    });
}

// Function to distribute study time across days leading to assignment deadlines
function distributeStudyTime(assignments) {
    dailyStudyPlan = {};  //reset the daily study plan
    const today = new Date();

    assignments.forEach(assignment => {
        let remainingTime = parseInt(assignment.time); //time left
        const dueDate = new Date(assignment.date);

        for (let i = 0; i < assignment.daysLeft; i++) {
            if (remainingTime <= 0) break;  //stop once time=0

            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];

            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const maxHours = isWeekend ? WEEKEND_HOURS : WEEKDAY_HOURS;

            if (!dailyStudyPlan[dateKey]) {
                dailyStudyPlan[dateKey] = {
                    allocatedTime: 0,
                    assignments: []
                };
            }

            //turn the name and subject to a string
            const assignmentDisplay = `${assignment.name} - ${assignment.subject}`;

            //allot maximum time to current day
            const availableTime = Math.min(remainingTime, maxHours - dailyStudyPlan[dateKey].allocatedTime);
            dailyStudyPlan[dateKey].allocatedTime += availableTime;
            remainingTime -= availableTime;

            //push the comibned assignment name and subject string
            for (let j = 0; j < availableTime; j++) {
                dailyStudyPlan[dateKey].assignments.push({
                    id: assignment.id,
                    display: assignmentDisplay
                });
            }
        }
    });

    console.log("Daily study plan:", dailyStudyPlan);
    renderTimeline(dailyStudyPlan);
}

// Function to render the timeline based on the daily study plan
function renderTimeline(dailyStudyPlan) {
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';  //clears previous timeline

    Object.keys(dailyStudyPlan).forEach(date => {
        const { allocatedTime, assignments } = dailyStudyPlan[date];
        const maxHours = new Date(date).getDay() === 0 || new Date(date).getDay() === 6 ? WEEKEND_HOURS : WEEKDAY_HOURS;

        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        const dateLabel = document.createElement('span');
        dateLabel.className = 'timeline-date';

        //change format of date
        const dateObj = new Date(date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dayOfWeek = dateObj.toLocaleDateString('default', { weekday: 'long' });

        dateLabel.innerHTML = `${day}-${month}-${year}<br>${dayOfWeek}`;

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'slots-container';

        //create slots
        for (let i = 0; i < maxHours; i++) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';

            //fill slots
            if (i < allocatedTime) {
                slot.classList.add('filled-slot'); 

                //check if task is completed
                if (assignments[i].completed) {
                    slot.classList.add('completed-slot');
                    slot.textContent = 'Good Job'; 
                } else {
                    //display name of the assignment
                    slot.textContent = assignments[i].display;

                    //done button-
                    const doneButton = document.createElement('button');
                    doneButton.className = 'done-button';
                    doneButton.textContent = 'Done';
                    doneButton.onclick = () => markHourAsDone(date, i, assignments[i].id, slot);
                    slot.appendChild(doneButton);
                }
            }

            slotsContainer.appendChild(slot);
        }

        timelineItem.appendChild(dateLabel);
        timelineItem.appendChild(slotsContainer);
        timelineContainer.appendChild(timelineItem);
    });
}


// Function to mark an hour as done
function markHourAsDone(date, slotIndex, assignmentId, slotElement) {
    console.log("markHourAsDone called with:", date, slotIndex, assignmentId);
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("No user logged in");
        return;
    }
    const userId = user.uid;
    const assignmentRef = database.ref('users/' + userId + '/assignments/' + assignmentId);
    assignmentRef.once('value', snapshot => {
        console.log("Assignment data:", snapshot.val());
        if (snapshot.exists()) {
            const assignment = snapshot.val();
            //update the time in firebase (subtract 1 hour from the total time)
            const newTime = Math.max(0, parseInt(assignment.time) - 1);
            console.log("Updating time from", assignment.time, "to", newTime);
            //only update the time if it's not already 0
            if (newTime >= 0) {
                assignmentRef.update({
                    time: newTime.toString()
                })
                .then(() => {
                    console.log("Assignment hour updated successfully");
                    slotElement.classList.add('completed-slot'); 
                    slotElement.innerHTML = 'Good Job';           //display good job
                    const doneButton = slotElement.querySelector('.done-button');
                    if (doneButton) {
                        doneButton.disabled = true;
                    }

                })
                .catch(error => {
                    console.error("Error updating assignment: ", error);
                });
            }
        } else {
            console.log("No matching assignment found");
        }
    }).catch(error => {
        console.error("Error querying assignment:", error);
    });
}


// Calendar functionality
document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();

    window.renderCalendar = function() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        calendarBody.innerHTML = '';

        // Fill in the blanks before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const blankCell = document.createElement('div');
            calendarBody.appendChild(blankCell);
        }

        // Add the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Check if there are any assignments for this day
            if (assignments[dateKey]) {
                const indicator = document.createElement('span');
                indicator.classList.add('assignment-indicator');
                dayCell.appendChild(indicator);

                dayCell.addEventListener('click', function() {
                    showAssignments(dateKey);
                });
            }

            if (isCurrentMonth && day === today.getDate()) {
                dayCell.classList.add('current-date');
            }

            calendarBody.appendChild(dayCell);
        }
    }

    function showAssignments(date) {
        window.location.href = `/Temp_Assign_Page/assign_dis.html?date=${date}`;
    }
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar(); // Initial render of the calendar
});