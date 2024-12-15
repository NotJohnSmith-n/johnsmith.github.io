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

// Firebase configuration
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

document.addEventListener("DOMContentLoaded", () => {
  const signInBtn = document.getElementById("sign-in-btn");
  const signOutBtn = document.getElementById("sign-out-btn");
  const userInfo = document.getElementById("user-info");
  const userEmail = document.getElementById("user-email");
  const questionsSection = document.getElementById("questions");
  const submitAnswersBtn = document.getElementById("submit-answers-btn");
  const leaderboardSection = document.getElementById("leaderboard-section");

  // Initialize UI based on auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
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
    } else {
      // User is signed out
      userInfo.style.display = "none";
      signInBtn.style.display = "inline-block";
      signOutBtn.style.display = "none";
      questionsSection.style.display = "none";
      submitAnswersBtn.style.display = "none";
      leaderboardSection.style.display = "none";
    }
  });

  // Sign in with Google
  signInBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  });

  // Sign out
  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  });

  // Answer checking logic
  async function checkAnswers() {
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
    let score = 0;
    for (const [id, answer] of Object.entries(answers)) {
      const input = document.getElementById(id)?.value.trim();
      if (input?.toLowerCase() === answer.toLowerCase()) {
        score++;
      }
    }
    const result = document.getElementById("result");
    result.textContent = `You scored ${score} out of ${Object.keys(answers).length}.`;

    if (score === Object.keys(answers).length) {
      leaderboardSection.style.display = "block";

      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "leaderboard"), {
          name: user.displayName,
          email: user.email,
          timestamp: new Date(),
        });
      }
    }
  }

  submitAnswersBtn.addEventListener("click", checkAnswers);
});
