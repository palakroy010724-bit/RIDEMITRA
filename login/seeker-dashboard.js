// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAIxexbTcl1_6NmiHrCnIiaCvPNgb1glJ0",
  authDomain: "ridesync-e0cd1.firebaseapp.com",
  projectId: "ridesync-e0cd1",
  storageBucket: "ridesync-e0cd1.firebasestorage.app",
  messagingSenderId: "176513864864",
  appId: "1:176513864864:web:d808c85cc92533641725c5"
};

// Init Firebase safely
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Helpers
function getLoggedInUserId() {
  return localStorage.getItem("userId") || "";
}

function getPassengerProfileFromStorage() {
  return {
    passengerId: localStorage.getItem("passengerId") || "",
    name: localStorage.getItem("p_name") || "",
    phone: localStorage.getItem("p_phone") || ""
  };
}

function setPassengerProfileToStorage(userId, name, phone) {
  localStorage.setItem("passengerId", userId);
  localStorage.setItem("p_name", name || "");
  localStorage.setItem("p_phone", phone || "");
}

// Default load
document.addEventListener("DOMContentLoaded", function () {
  const userId = getLoggedInUserId();

  if (!userId) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  db.collection("passengers").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data() || {};
        setPassengerProfileToStorage(userId, data.name || "", data.phone || "");
        loadProfile();
        showSection("search");

        // IMPORTANT FIX:
        // page load pe searchRide() nahi chalega
        const ridesList = document.getElementById("ridesList");
        if (ridesList) {
          ridesList.innerHTML = "<p>Search karo, tab rides yahan dikhenge.</p>";
        }
      } else {
        window.location.href = "seeker-profile.html";
      }
    })
    .catch((error) => {
      console.error("Passenger profile load error:", error);
      alert("Error loading profile");
      window.location.href = "seeker-profile.html";
    });
});

// Section switch
function showSection(sec) {
  const searchSection = document.getElementById("searchSection");
  const profileSection = document.getElementById("profileSection");
  const joinedSection = document.getElementById("joinedSection");

  if (searchSection) searchSection.style.display = "none";
  if (profileSection) profileSection.style.display = "none";
  if (joinedSection) joinedSection.style.display = "none";

  document.querySelectorAll(".sidebar button").forEach(btn => btn.classList.remove("active"));

  if (sec === "search") {
    if (searchSection) searchSection.style.display = "block";
    setActiveButton(0);

    const ridesList = document.getElementById("ridesList");
    if (ridesList && !ridesList.innerHTML.trim()) {
      ridesList.innerHTML = "<p>Search karo, tab rides yahan dikhenge.</p>";
    }
  }

  if (sec === "profile") {
    if (profileSection) profileSection.style.display = "block";
    loadProfile();
    setActiveButton(1);
  }

  if (sec === "joined") {
    if (joinedSection) joinedSection.style.display = "block";
    loadJoined();
    setActiveButton(2);
  }
}

function setActiveButton(index) {
  const buttons = document.querySelectorAll(".sidebar button");
  if (buttons[index]) {
    buttons[index].classList.add("active");
  }
}

// Load profile
function loadProfile() {
  const { name, phone } = getPassengerProfileFromStorage();

  const nameInput = document.getElementById("p_name");
  const phoneInput = document.getElementById("p_phone");

  if (nameInput) nameInput.value = name;
  if (phoneInput) phoneInput.value = phone;
}

// Save profile from dashboard profile section
function saveProfile() {
  const name = document.getElementById("p_name")?.value.trim() || "";
  const phone = document.getElementById("p_phone")?.value.trim() || "";
  const userId = getLoggedInUserId();
  const userEmail = localStorage.getItem("userEmail") || "";

  if (!userId) {
    alert("User not logged in");
    return;
  }

  if (!name || !phone) {
    alert("Please fill all fields");
    return;
  }

  setPassengerProfileToStorage(userId, name, phone);

  db.collection("passengers").doc(userId).set(
    {
      userId: userId,
      email: userEmail,
      name: name,
      phone: phone,
      updatedAt: new Date()
    },
    { merge: true }
  )
  .then(() => {
    alert("Profile Updated!");
    showSection("search");

    const ridesList = document.getElementById("ridesList");
    if (ridesList) {
      ridesList.innerHTML = "<p>Profile update ho gaya. Ab search karo.</p>";
    }
  })
  .catch((error) => {
    console.error("Profile save error:", error);
    alert("Error: " + error.message);
  });
}

// Search rides by date
function searchRide() {
  const pickupSearch = document.getElementById("searchPickup")?.value.toLowerCase().trim() || "";
  const destinationSearch = document.getElementById("searchDestination")?.value.toLowerCase().trim() || "";
  const dateSearch = document.getElementById("searchDate")?.value || "";

  const profile = getPassengerProfileFromStorage();
  const passengerId = profile.passengerId || getLoggedInUserId();
  const passengerName = profile.name || "";

  db.collection("rides")
    .where("status", "==", "active")
    .get()
    .then(snapshot => {
      let out = "";

      snapshot.forEach(doc => {
        const r = doc.data() || {};

        const pickup = (r.pickup || "").toLowerCase();
        const destination = (r.destination || "").toLowerCase();
        const rideDate = r.rideDate || "";

        const passengers = Array.isArray(r.passengers) ? r.passengers : [];

        // Already joined check
        const alreadyJoined = passengers.some(p => {
          if (typeof p === "string") return p === passengerName;
          return p && p.passengerId === passengerId;
        });

        const joinedCount = passengers.length;
        const totalSeats = Number(r.seats || 0);
        const seatsLeft = Math.max(totalSeats - joinedCount, 0);

        const pickupMatch = !pickupSearch || pickup.includes(pickupSearch);
        const destinationMatch = !destinationSearch || destination.includes(destinationSearch);
        const dateMatch = !dateSearch || rideDate === dateSearch;

        // IMPORTANT FIX:
        // already joined ride search results me nahi dikhegi
        if (pickupMatch && destinationMatch && dateMatch && !alreadyJoined && seatsLeft > 0) {
          out += `
            <div class="ride-card">
              <h4>${r.pickup || "Not set"} → ${r.destination || "Not set"}</h4>
              <p><strong>Date:</strong> ${r.rideDate || "Not set"}</p>
              <p><strong>Time:</strong> ${r.time || "Not set"}</p>
              <p><strong>Fare:</strong> ₹${r.fare || 0}</p>
              <p><strong>Seats Left:</strong> ${seatsLeft}</p>
              <p><strong>Vehicle:</strong> ${r.vehicle || "Not set"}</p>
              <hr>
              <p><strong>Driver:</strong> ${r.driverName || "Not set"}</p>
              <p><strong>Phone:</strong> ${r.driverPhone || "Not set"}</p>
              <p><strong>Vehicle No:</strong> ${r.driverVehicleNo || "Not set"}</p>

              <div class="ride-actions">
                <a href="tel:${r.driverPhone || ""}">
                  <button type="button">📞 Call Now</button>
                </a>
                <button type="button" onclick="joinRide('${doc.id}')">Join Ride</button>
              </div>
            </div>
          `;
        }
      });

      const ridesList = document.getElementById("ridesList");
      if (ridesList) {
        ridesList.innerHTML = out || "<p>No rides found</p>";
      }
    })
    .catch(error => {
      console.error("Search ride error:", error);
      alert("Error loading rides");
    });
}

// Join ride
async function joinRide(id) {
  try {
    const profile = getPassengerProfileFromStorage();
    const passengerId = profile.passengerId || getLoggedInUserId();
    const passengerName = profile.name || "";
    const passengerPhone = profile.phone || "";

    if (!passengerId || !passengerName || !passengerPhone) {
      alert("Please complete profile first");
      showSection("profile");
      return;
    }

    const rideRef = db.collection("rides").doc(id);
    const rideDoc = await rideRef.get();

    if (!rideDoc.exists) {
      alert("Ride not found");
      return;
    }

    const rideData = rideDoc.data() || {};
    const passengers = Array.isArray(rideData.passengers) ? rideData.passengers : [];

    const alreadyJoined = passengers.some(p => {
      if (typeof p === "string") return p === passengerName;
      return p && p.passengerId === passengerId;
    });

    if (alreadyJoined) {
      alert("You already joined this ride");
      return;
    }

    const totalSeats = Number(rideData.seats || 0);
    if (passengers.length >= totalSeats) {
      alert("No seats available");
      return;
    }

    const passengerObj = {
      passengerId: passengerId,
      name: passengerName,
      phone: passengerPhone
    };

    await rideRef.update({
      passengers: firebase.firestore.FieldValue.arrayUnion(passengerObj)
    });

    if (rideData.driverId) {
      await db.collection("notifications").add({
        driverId: rideData.driverId,
        rideId: id,
        passengerId: passengerId,
        passengerName: passengerName,
        passengerPhone: passengerPhone,
        message: `${passengerName} joined your ride`,
        read: false,
        createdAt: new Date()
      });
    }

    alert("Ride Joined Successfully!");

    // IMPORTANT FIX:
    // join ke baad joined page open hoga
    loadJoined();
    showSection("joined");

    // search list refresh ho jayegi, taaki joined ride hat jaye
    const ridesList = document.getElementById("ridesList");
    if (ridesList) {
      ridesList.innerHTML = "<p>Ride join ho gayi. Search page par wapas jaake dobara search karoge to yeh ride nahi dikhegi.</p>";
    }

  } catch (error) {
    console.error("Join ride error:", error);
    alert("Error joining ride");
  }
}

// Joined rides
function loadJoined() {
  const profile = getPassengerProfileFromStorage();
  const passengerId = profile.passengerId || "";
  const passengerName = profile.name || "";

  db.collection("rides")
    .where("status", "==", "active")
    .get()
    .then(snapshot => {
      let out = "";

      snapshot.forEach(doc => {
        const r = doc.data() || {};
        const passengers = Array.isArray(r.passengers) ? r.passengers : [];

        const joined = passengers.some(p => {
          if (typeof p === "string") return p === passengerName;
          return p && p.passengerId === passengerId;
        });

        if (joined) {
          out += `
            <div class="ride-card">
              <h4>${r.pickup || "Not set"} → ${r.destination || "Not set"}</h4>
              <p><strong>Date:</strong> ${r.rideDate || "Not set"}</p>
              <p><strong>Time:</strong> ${r.time || "Not set"}</p>
              <p><strong>Fare:</strong> ₹${r.fare || 0}</p>
              <p><strong>Vehicle:</strong> ${r.vehicle || "Not set"}</p>
              <p><strong>Driver:</strong> ${r.driverName || "Not set"}</p>
              <p><strong>Phone:</strong> ${r.driverPhone || "Not set"}</p>
              <p><strong>Vehicle No:</strong> ${r.driverVehicleNo || "Not set"}</p>

              <div class="ride-actions">
                <a href="tel:${r.driverPhone || ""}">
                  <button type="button">📞 Call Now</button>
                </a>
              </div>
            </div>
          `;
        }
      });

      const joinedRides = document.getElementById("joinedRides");
      if (joinedRides) {
        joinedRides.innerHTML = out || "<p>No joined rides</p>";
      }
    })
    .catch(error => {
      console.error("Load joined rides error:", error);
      const joinedRides = document.getElementById("joinedRides");
      if (joinedRides) {
        joinedRides.innerHTML = "<p>Error loading joined rides</p>";
      }
    });
}function logout() {
    firebase.auth().signOut()
        .then(() => {
            localStorage.clear();
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);
        });
}