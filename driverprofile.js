const firebaseConfig = {
  apiKey: "AIzaSyBf8LPoKbLHwlANY9kSwnhh-Tu6PyDfCtE",
  authDomain: "ridesync-2840a.firebaseapp.com",
  projectId: "ridesync-2840a",
  storageBucket: "ridesync-2840a.firebasestorage.app",
  messagingSenderId: "731344070188",
  appId: "1:731344070188:web:04e09a7fa178d5d9b25389"
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