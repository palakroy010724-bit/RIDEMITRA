// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBf8LPoKbLHwlANY9kSwnhh-Tu6PyDfCtE",
  authDomain: "ridesync-2840a.firebaseapp.com",
  projectId: "ridesync-2840a",
  storageBucket: "ridesync-2840a.firebasestorage.app",
  messagingSenderId: "731344070188",
  appId: "1:731344070188:web:04e09a7fa178d5d9b25389"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Role select
let selectedRole = "";

function selectRole(role) {
  selectedRole = role;

  const driverBtn = document.getElementById("driverBtn");
  const passengerBtn = document.getElementById("passengerBtn");

  if (driverBtn) driverBtn.classList.remove("selected");
  if (passengerBtn) passengerBtn.classList.remove("selected");

  const selectedBtn = document.getElementById(role + "Btn");
  if (selectedBtn) selectedBtn.classList.add("selected");
}

// LOGIN
function login() {
  const email = document.getElementById("loginEmail")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value || "";

  if (!selectedRole) {
    alert("Select Driver or Passenger");
    return;
  }

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userId = user.uid;
      const userEmail = user.email || email;

      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("selectedRole", selectedRole);

      if (selectedRole === "driver") {
        db.collection("drivers").doc(userId).get()
          .then((doc) => {
            if (doc.exists) {
              window.location.href = "driverdashboard.html";
            } else {
              window.location.href = "driverprofile.html";
            }
          })
          .catch((error) => {
            console.error("Driver profile check error:", error);
            alert("Error checking driver profile");
          });
      } else {
        db.collection("passengers").doc(userId).get()
          .then((doc) => {
            if (doc.exists) {
              const data = doc.data() || {};
              localStorage.setItem("passengerId", userId);
              localStorage.setItem("p_name", data.name || "");
              localStorage.setItem("p_phone", data.phone || "");
              window.location.href = "seeker-dashboard.html";
            } else {
              window.location.href = "seeker-profile.html";
            }
          })
          .catch((error) => {
            console.error("Passenger profile check error:", error);
            alert("Error checking passenger profile");
          });
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

// SIGNUP
function signup() {
  const email = document.getElementById("signupEmail")?.value.trim() || "";
  const password = document.getElementById("signupPassword")?.value || "";

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signup successful!");
      showLogin();
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Toggle forms
function showLogin() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) loginForm.style.display = "block";
  if (signupForm) signupForm.style.display = "none";
}

function showSignup() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) loginForm.style.display = "none";
  if (signupForm) signupForm.style.display = "block";
}