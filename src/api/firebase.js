import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCJzqXBaaquTLlQONWiCnwFK_tGvg6BEfc",
  authDomain: "smartgarden-web-react-iot.firebaseapp.com",
  databaseURL: "https://smartgarden-web-react-iot-default-rtdb.firebaseio.com",
  projectId: "smartgarden-web-react-iot",
  storageBucket: "smartgarden-web-react-iot.firebasestorage.app",
  messagingSenderId: "353587000824",
  appId: "1:353587000824:web:30a966b9de204c8c43920d"
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export { ref, onValue, set };
