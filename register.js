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
// Initiate Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const subjectNames = {
  'cs': 'Computer Science',
  'math-aa': 'Math AA',
  'physics': 'Physics',
  'econ': 'Economics',
  'chem': 'Chemistry',
  'bio': 'Biology',
  'bm': 'Business Management',
  'history': 'History',
  'pol-sci': 'Political Sciences',
  'psycho': 'Psychology',
  'engll': 'English Language & Literature',
  'engl': 'English Literature',
  'frb': 'French B',
  'fra': 'French A',
  'spb': 'Spanish B',
  'spa': 'Spanish A'
};

//register function
function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const full_name = document.getElementById('full_name').value;
  const hl1 = document.getElementById('hl1').value;
  const hl2 = document.getElementById('hl2').value;
  const hl3 = document.getElementById('hl3').value;
  const sl1 = document.getElementById('sl1').value;
  const sl2 = document.getElementById('sl2').value;
  const sl3 = document.getElementById('sl3').value;

  //validation
  if (!validate_email(email) || !validate_password(password)) {
      alert('Email or Password is Outta Line!!');
      return;
  }
  if (!validate_field(full_name) || !validate_field(hl1) || !validate_field(hl2) || !validate_field(hl3) || !validate_field(sl1) || !validate_field(sl2) || !validate_field(sl3)) {
      alert('One or More Extra Fields is Outta Line!!');
      return;
  }

  auth.createUserWithEmailAndPassword(email, password)
      .then(function () {
          console.log("User created successfully");
          const user = auth.currentUser;
          console.log("Current user:", user);

          const database_ref = database.ref();
          console.log("Database reference:", database_ref);

          const user_data = {
              email,
              full_name,
              last_login: Date.now(),
              hl1: subjectNames[hl1],
              hl2: subjectNames[hl2],
              hl3: subjectNames[hl3],
              sl1: subjectNames[sl1],
              sl2: subjectNames[sl2],
              sl3: subjectNames[sl3]
          };

          console.log("User data to be written:", user_data);

          database_ref.child('users/' + user.uid).set(user_data, function (error) {
              if (error) {
                  console.error("Error writing user data:", error);
              } else {
                  console.log("User data written successfully");
                  alert('User Created!!');
                  window.location.href = '/Homepage/homepage.html';
              }
          });
              //add subjects to database
              var subjects = [hl1, hl2, hl3, sl1, sl2, sl3];
              subjects.forEach(function(subject) {
              database_ref.child('subjects/' + subject).set(true);
          });
      })
      .catch(function (error) {
          console.error("Error creating user:", error);
          alert(error.message);
      });
}

// Validate Functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6;
}

function validate_field(field) {
  return field != null && field.length > 0;
}
