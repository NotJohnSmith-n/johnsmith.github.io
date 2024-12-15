import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBPs8XJx3bWlLAaprFyni_eptXCei3D0Z8",
  authDomain: "knfctf.firebaseapp.com",
  projectId: "knfctf",
  storageBucket: "knfctf.firebasestorage.app",
  messagingSenderId: "867816662069",
  appId: "1:867816662069:web:b52d6fd936aa7159f57d7c",
  measurementId: "G-01ZH8EDKBD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const userInfo = document.getElementById("user-info");
const userEmail = document.getElementById("user-email");
const questionsSection = document.getElementById("questions");
const submitAnswersBtn = document.getElementById("submit-answers-btn");
const leaderboardSection = document.getElementById("leaderboard-section");
const leaderboardList = document.getElementById("leaderboard");

// Event listener for signing in
signInBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Display user info
    userEmail.textContent = user.email;
    userInfo.style.display = "block";
    signInBtn.style.display = "none";
    signOutBtn.style.display = "inline-block";
    questionsSection.style.display = "block";
    submitAnswersBtn.style.display = "inline-block";

    // Save user to Firestore if new
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        registeredAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Sign-in error:", error);
  }
});

// Event listener for signing out
signOutBtn.addEventListener("click", async () => {
  await signOut(auth);
  userInfo.style.display = "none";
  signInBtn.style.display = "inline-block";
  signOutBtn.style.display = "none";
  questionsSection.style.display = "none";
  submitAnswersBtn.style.display = "none";
  leaderboardSection.style.display = "none";
});

const answers = {
  q1: "1",
  q2: "1",
  q3: "1",
  q4: "1",
  q5: "1",
  q6: "1",
  q7: "1",
  q8: "1",
  q9: "1",
  q10: "1",
};

function checkIndividualAnswer(inputId, resultId) {
  const input = document.getElementById(inputId).value.trim();
  const result = document.getElementById(resultId);
  if (input.toLowerCase() === answers[inputId].toLowerCase()) {
    result.textContent = "Correct!";
    result.style.color = "#00ff00";
  } else {
    result.textContent = "Incorrect!";
    result.style.color = "red";
  }
}

async function checkAnswers() {
  let score = 0;
  for (const [id, answer] of Object.entries(answers)) {
    const input = document.getElementById(id).value.trim();
    if (input.toLowerCase() === answer.toLowerCase()) {
      score++;
    }
  }
  const result = document.getElementById("result");
  result.textContent = `You scored ${score} out of ${Object.keys(answers).length}.`;

  if (score === Object.keys(answers).length) {
    leaderboardSection.style.display = "block";

    const user = auth.currentUser;
    const userName = user.displayName;
    const userEmail = user.email;

    await updateLeaderboard(userName, userEmail);
  }
}

async function updateLeaderboard(userName, userEmail) {
  await addDoc(collection(db, "leaderboard"), {
    name: userName,
    email: userEmail,
    timestamp: new Date(),
  });

  displayLeaderboard();
}

async function displayLeaderboard() {
  leaderboardList.innerHTML = "";

  const leaderboardQuery = query(
    collection(db, "leaderboard"),
    orderBy("timestamp", "desc")
  );
  const querySnapshot = await getDocs(leaderboardQuery);

  querySnapshot.forEach((doc) => {
    const entry = doc.data();
    const listItem = document.createElement("li");
    listItem.textContent = `${entry.name} (${entry.email})`;
    leaderboardList.appendChild(listItem);
  });
}
