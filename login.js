// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAuIT3vYOTxILrwX-ExHHIL2IRisMYrj8c",
  authDomain: "cs-ia-d28f4.firebaseapp.com",
  projectId: "cs-ia-d28f4",
  storageBucket: "cs-ia-d28f4.appspot.com",
  messagingSenderId: "715769462145",
  appId: "1:715769462145:web:70156048862e9c7d19fc80"
};
// Initiate Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// login function
function login () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // validating input fields
  if (!validate_email(email) || !validate_password(password)) {
    alert('Email or Password is Outta Line!!');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
  .then(function() {
    const user = auth.currentUser;

    // add user to database
    const database_ref = database.ref();

    // create user data
    const user_data = {
      last_login: Date.now()
    };

    // push to firebase
    database_ref.child('users/' + user.uid).update(user_data);

    alert('User Logged In!!');
    window.location.href = '/Homepage/homepage.html';

  })
  .catch(function(error) {
    alert(error.message);
  });
}

// validating functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6;
}
