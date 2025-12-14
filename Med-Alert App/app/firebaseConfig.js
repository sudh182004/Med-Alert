// app/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ✅ Your Firebase config
const firebaseConfig = {
// Ad your config files
};

// ✅ Initialize Firebase once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
