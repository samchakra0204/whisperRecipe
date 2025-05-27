import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyBe95t7dM7P9ISh3gca2UsgKmC5NyrfMXU",
  authDomain: "recipe-68bf6.firebaseapp.com",
  projectId: "recipe-68bf6",
  storageBucket: "recipe-68bf6.appspot.com",
  messagingSenderId: "259943453914",
  appId: "1:259943453914:web:7ed5226737d2136b7081e3",
  measurementId: "G-ELF3TT6404"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storage

export { analytics, db, storage };
