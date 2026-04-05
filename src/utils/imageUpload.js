import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { auth, storage } from "../Firebase";

async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (err) {
    console.error("Firebase auth error:", err);
    const rawMessage = String(err?.message || "");
    const rawCode = String(err?.code || "");
    const isInvalidApiKey =
      rawCode.includes("auth/api-key-not-valid") ||
      rawMessage.toLowerCase().includes("api key not valid") ||
      rawMessage.toLowerCase().includes("api_key_invalid");

    if (isInvalidApiKey) {
      throw new Error(
        "Firebase API key is invalid. Update `VITE_FIREBASE_API_KEY` (and other Firebase envs) in `.env` with the real values from Firebase Console → Project settings → Your apps, then restart the Vite dev server.",
      );
    }
    throw new Error(
      "Firebase upload requires authentication. Enable Anonymous sign-in in Firebase Auth or update Storage rules.",
    );
  }
}

export async function uploadFileToFirebase(file, path) {
  try {
    await ensureSignedIn();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err) {
    console.error("Firebase upload error:", err);
    throw new Error("Failed to upload to Firebase");
  }
}
