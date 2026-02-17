import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db, messaging } from "../Firebase";

const vapidKey =  import.meta.env.VITE_FIREBASE_APP_ID

export const registerForPush = async (userId) => {
  const token = await getToken(messaging, {
    vapidKey: vapidKey,
  });

  if (token) {
    await setDoc(
      doc(db, "users", userId),
      { fcmToken: token },
      { merge: true }
    );
  }
};
