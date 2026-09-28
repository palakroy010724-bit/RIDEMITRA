const firebaseConfig = {
  apiKey: "AIzaSyAIxexbTcl1_6NmiHrCnIiaCvPNgb1glJ0",
  authDomain: "ridesync-e0cd1.firebaseapp.com",
  projectId: "ridesync-e0cd1",
  storageBucket: "ridesync-e0cd1.firebasestorage.app",
  messagingSenderId: "176513864864",
  appId: "1:176513864864:web:d808c85cc92533641725c5"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {

  if (!user) {
    alert("User is not logged in!");
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  db.collection("drivers").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const d = doc.data();

        document.getElementById("name").value = d.name || "";
        document.getElementById("phone").value = d.phone || "";
        document.getElementById("vehicleNo").value = d.vehicleNo || "";
      }
    })
    .catch((error) => {
      console.error("Profile load error:", error);
      alert("Error: " + error.message);
    });
});

function saveProfile() {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const vehicleNo = document.getElementById("vehicleNo").value.trim();
  const btn = document.querySelector(".save-btn");

  const user = auth.currentUser;

  if (!user) {
    alert("User is not logged in!");
    return;
  }

  if (!name || !phone || !vehicleNo) {
    alert("Please fill all fields");
    return;
  }

  if (btn) {
    btn.innerText = "Saving...";
    btn.disabled = true;
  }

  db.collection("drivers").doc(user.uid).set({
    name: name,
    phone: phone,
    vehicleNo: vehicleNo
  }, { merge: true })

  .then(() => {

    localStorage.setItem("userId", user.uid);
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("vehicleNo", vehicleNo);

    alert("Profile Saved Successfully!");

    window.location.href = "driverdashboard.html";
  })

  .catch((error) => {

    console.error("Profile save error:", error);
    alert("Error: " + error.message);

    if (btn) {
      btn.innerText = "Save Profile";
      btn.disabled = false;
    }
  });
}