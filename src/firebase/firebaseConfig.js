import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyDvyi8YmG15o7dzsIsctHII_ylEHp2S96M',
  authDomain: 'blogapp-72427.firebaseapp.com',
  projectId: 'blogapp-72427',
  storageBucket: 'blogapp-72427.firebasestorage.app',
  messagingSenderId: '287509966840',
  appId: '1:287509966840:web:d66e6b28032ca17be6700d',
  measurementId: 'G-SD0120RJ4W',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };