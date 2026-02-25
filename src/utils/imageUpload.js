import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../Firebase";

export async function uploadFileToFirebase(file, path) {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err) {
    console.error("Firebase upload error:", err);
    throw new Error("Failed to upload to Firebase");
  }
}