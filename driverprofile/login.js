// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAIxexbTcl1_6NmiHrCnIiaCvPNgb1glJ0",
  authDomain: "ridesync-e0cd1.firebaseapp.com",
  projectId: "ridesync-e0cd1",
  storageBucket: "ridesync-e0cd1.firebasestorage.app",
  messagingSenderId: "176513864864",
  appId: "1:176513864864:web:d808c85cc92533641725c5"
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