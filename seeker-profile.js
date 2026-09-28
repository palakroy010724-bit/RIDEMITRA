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

  db.collection("passengers").doc(userId).get()
    .then((doc) => {

      if (doc.exists) {
        const data = doc.data();

        document.getElementById("p_name").value = data.name || "";
        document.getElementById("p_phone").value = data.phone || "";

        localStorage.setItem("passengerId", userId);
        localStorage.setItem("p_name", data.name || "");
        localStorage.setItem("p_phone", data.phone || "");
      }

    })
    .catch((error) => {
      console.error("Profile load error:", error);
      alert("Error: " + error.message);
    });
});

function saveProfile() {

  const name = document.getElementById("p_name").value.trim();
  const phone = document.getElementById("p_phone").value.trim();

  const user = auth.currentUser;

  if (!user) {
    alert("User is not logged in!");
    return;
  }

  if (!name || !phone) {
    alert("Please fill all fields");
    return;
  }

  const userId = user.uid;

  db.collection("passengers").doc(userId).set({
    userId: userId,
    email: user.email || "",
    name: name,
    phone: phone,
    updatedAt: new Date()
  }, { merge: true })

  .then(() => {

    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", user.email || "");
    localStorage.setItem("passengerId", userId);
    localStorage.setItem("p_name", name);
    localStorage.setItem("p_phone", phone);

    alert("Profile Saved Successfully!");

    window.location.href = "seeker-dashboard.html";
  })

  .catch((error) => {
    console.error("Profile save error:", error);
    alert("Error: " + error.message);
  });
}