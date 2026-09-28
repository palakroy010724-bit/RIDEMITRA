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

// Default load
document.addEventListener("DOMContentLoaded", function () {
  showSection("myrides");
  loadDriverNotifications();
});

// Section Switch
function showSection(section) {
  const sections = [
    "rideSection",
    "profileSection",
    "myridesSection",
    "historySection",
    "notificationsSection"
  ];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  document.querySelectorAll(".sidebar button").forEach(btn => btn.classList.remove("active"));

  if (section === "ride") {
    const el = document.getElementById("rideSection");
    if (el) el.style.display = "block";
    setActiveButton(0);
  }

  if (section === "profile") {
    const el = document.getElementById("profileSection");
    if (el) el.style.display = "block";
    loadProfile();
    setActiveButton(1);
  }

  if (section === "myrides") {
    const el = document.getElementById("myridesSection");
    if (el) el.style.display = "block";
    loadMyRides();
    setActiveButton(2);
  }

  if (section === "history") {
    const el = document.getElementById("historySection");
    if (el) el.style.display = "block";
    loadHistory();
    setActiveButton(3);
  }

  if (section === "notifications") {
    const el = document.getElementById("notificationsSection");
    if (el) el.style.display = "block";
    loadDriverNotifications();
    setActiveButton(4);
  }
}

function setActiveButton(index) {
  const buttons = document.querySelectorAll(".sidebar button");
  if (buttons[index]) {
    buttons[index].classList.add("active");
  }
}

// Load Profile
function loadProfile() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  db.collection("drivers").doc(userId).get()
    .then(doc => {
      if (!doc.exists) return;

      const d = doc.data() || {};

      const nameInput = document.getElementById("name");
      const phoneInput = document.getElementById("phone");
      const vehicleNoInput = document.getElementById("vehicleNo");

      if (nameInput) nameInput.value = d.name || "";
      if (phoneInput) phoneInput.value = d.phone || "";
      if (vehicleNoInput) vehicleNoInput.value = d.vehicleNo || "";

      localStorage.setItem("name", d.name || "");
      localStorage.setItem("phone", d.phone || "");
      localStorage.setItem("vehicleNo", d.vehicleNo || "");
    })
    .catch(err => {
      console.error("Load profile error:", err);
    });
}

// Save Profile
function saveProfile() {
  const userId = localStorage.getItem("userId");
  const name = document.getElementById("name")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const vehicleNo = document.getElementById("vehicleNo")?.value.trim() || "";

  if (!userId) {
    alert("User not logged in!");
    return;
  }

  if (!name || !phone || !vehicleNo) {
    alert("Fill all fields");
    return;
  }

  db.collection("drivers").doc(userId).set(
    { name, phone, vehicleNo },
    { merge: true }
  )
  .then(() => {
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("vehicleNo", vehicleNo);
    alert("Profile Updated!");
  })
  .catch(err => {
    console.error("Save profile error:", err);
    alert("Error: " + err.message);
  });
}

// Post Ride
function postRide() {
  const pickup = document.getElementById("pickup")?.value.trim() || "";
  const destination = document.getElementById("destination")?.value.trim() || "";
  const rideDate = document.getElementById("rideDate")?.value || "";
  const time = document.getElementById("time")?.value || "";
  const seats = document.getElementById("seats")?.value || "";
  const fare = document.getElementById("fare")?.value || "";
  const vehicle = document.getElementById("vehicle")?.value || "";

  const userId = localStorage.getItem("userId");
  const driverName = localStorage.getItem("name") || "";
  const driverPhone = localStorage.getItem("phone") || "";
  const driverVehicleNo = localStorage.getItem("vehicleNo") || "";
  

  if (!userId) {
    alert("User not logged in!");
    return;
  }

  if (!pickup || !destination || !rideDate || !time || !seats || !fare || !vehicle) {
    alert("Fill all ride details");
    return;
  }

  if (!driverName || !driverPhone || !driverVehicleNo) {
    alert("Please complete your profile first");
    showSection("profile");
    return;
  }
  

  db.collection("rides").add({
    pickup,
    destination,
    rideDate,
    time,
    seats: Number(seats),
    fare: Number(fare),
    vehicle,
    driverId: userId,
    driverName,
    driverPhone,
    driverVehicleNo,
    passengers: [],
    status: "active",
    createdAt: new Date()
  })
  .then(() => {
    alert("Ride Posted!");

    document.getElementById("pickup").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("rideDate").value = "";
    document.getElementById("time").value = "";
    document.getElementById("seats").value = "";
    document.getElementById("fare").value = "";
    document.getElementById("vehicle").value = "bike";

    showSection("myrides");
  })
  .catch(err => {
    console.error("Post ride error:", err);
    alert("Error: " + err.message);
  });
  
}

// My Rides
function loadMyRides() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  db.collection("rides")
    .where("driverId", "==", userId)
    .where("status", "==", "active")
    .get()
    .then(snapshot => {
      let output = "";

      snapshot.forEach(doc => {
        const r = doc.data() || {};
        const rideTitle = `${r.pickup || "Not set"} → ${r.destination || "Not set"}`;
        const passengers = Array.isArray(r.passengers) ? r.passengers : [];

        let passengerHtml = `<p><strong>Passengers:</strong> No passengers yet</p>`;

        if (passengers.length > 0) {
          passengerHtml = `
            <div class="joined-passengers">
              <p><strong>Joined Passengers:</strong></p>
              ${passengers.map(p => {
                if (typeof p === "string") {
                  return `
                    <div class="passenger-item">
                      <p>👤 ${p}</p>
                    </div>
                  `;
                }

                return `
                  <div class="passenger-item">
                    <p>👤 ${p.name || "Unknown"}</p>
                    <p>📞 ${p.phone || "No phone"}</p>
                  </div>
                `;
              }).join("")}
            </div>
          `;
        }

        output += `
          <div class="ride-card">
            <h4>${rideTitle}</h4>
            <p><strong>Date:</strong> ${r.rideDate || "Not set"}</p>
            <p><strong>Time:</strong> ${r.time || "Not set"}</p>
            <p><strong>Seats:</strong> ${r.seats ?? 0}</p>
            <p><strong>Fare:</strong> ₹${r.fare ?? 0}</p>
            <p><strong>Vehicle:</strong> ${r.vehicle || "Not set"}</p>
            <p><strong>Driver:</strong> ${r.driverName || "Not set"}</p>
            <p><strong>Phone:</strong> ${r.driverPhone || "Not set"}</p>
            <p><strong>Vehicle No:</strong> ${r.driverVehicleNo || "Not set"}</p>
            ${passengerHtml}

            <div class="ride-actions">
              <button onclick="completeRide('${doc.id}')">Complete</button>
            </div>
          </div>
        `;
      });

      const myRidesEl = document.getElementById("myRides");
      if (myRidesEl) {
        myRidesEl.innerHTML = output || "<p>No active rides</p>";
      }
    })
    .catch(err => {
      console.error("Load my rides error:", err);
      const myRidesEl = document.getElementById("myRides");
      if (myRidesEl) {
        myRidesEl.innerHTML = "<p>Error loading rides</p>";
      }
    });
}

// Complete Ride
function completeRide(id) {
  db.collection("rides").doc(id).update({ status: "completed" })
    .then(() => {
      loadMyRides();
      loadHistory();
    })
    .catch(err => {
      console.error("Complete ride error:", err);
    });
}

// History
function loadHistory() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  db.collection("rides")
    .where("driverId", "==", userId)
    .where("status", "==", "completed")
    .get()
    .then(snapshot => {
      let output = "";

      snapshot.forEach(doc => {
        const r = doc.data() || {};

        output += `
          <div class="ride-card">
            <h4>${r.pickup || "Not set"} → ${r.destination || "Not set"}</h4>
            <p><strong>Date:</strong> ${r.rideDate || "Not set"}</p>
            <p><strong>Time:</strong> ${r.time || "Not set"}</p>
            <p><strong>Driver:</strong> ${r.driverName || "Not set"}</p>
            <p><strong>Phone:</strong> ${r.driverPhone || "Not set"}</p>
            <p><strong>Vehicle No:</strong> ${r.driverVehicleNo || "Not set"}</p>
            <p><strong>Status:</strong> Completed</p>
          </div>
        `;
      });

      const historyEl = document.getElementById("history");
      if (historyEl) {
        historyEl.innerHTML = output || "<p>No history</p>";
      }
    })
    .catch(err => {
      console.error("Load history error:", err);
      const historyEl = document.getElementById("history");
      if (historyEl) {
        historyEl.innerHTML = "<p>Error loading history</p>";
      }
    });
}

// Notifications
function loadDriverNotifications() {
  const driverId = localStorage.getItem("userId");
  if (!driverId) return;

  db.collection("notifications")
    .where("driverId", "==", driverId)
    .get()
    .then(snapshot => {
      let output = "";
      let unreadCount = 0;

      snapshot.forEach(doc => {
        const n = doc.data() || {};
        if (!n.read) unreadCount++;

        output += `
          <div class="notification-item">
            <p><strong>${n.passengerName || "Passenger"}</strong> joined your ride</p>
            <p>Phone: ${n.passengerPhone || "No phone"}</p>
            <button onclick="markNotificationRead('${doc.id}')">Mark as read</button>
          </div>
        `;
      });

      const notificationList = document.getElementById("notificationList");
      const notificationCount = document.getElementById("notificationCount");

      if (notificationList) {
        notificationList.innerHTML = output || "<p>No notifications yet</p>";
      }

      if (notificationCount) {
        notificationCount.textContent = unreadCount;
      }
    })
    .catch(err => {
      console.error("Notification load error:", err);
      const notificationList = document.getElementById("notificationList");
      if (notificationList) {
        notificationList.innerHTML = "<p>Error loading notifications</p>";
      }
    });
}

function markNotificationRead(notificationId) {
  db.collection("notifications").doc(notificationId).update({
    read: true
  })
  .then(() => {
    loadDriverNotifications();
  })
  .catch(err => {
    console.error("Mark read error:", err);
  });
}