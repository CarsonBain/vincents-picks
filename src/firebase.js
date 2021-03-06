import { firebase } from '@firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// firebase init - add your own config here
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FB_API_KEY,
  authDomain: process.env.VUE_APP_FB_AUTHDOMAIN,
  projectId: process.env.VUE_APP_FB_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FB_APP_ID,
};
firebase.initializeApp(firebaseConfig);

// utils
const db = firebase.firestore();
const auth = firebase.auth();

// collection references
const usersCollection = db.collection('users');
const moviesCollection = db.collection('movies');
const watchListsCollection = db.collection('watchlists');
const seenListsCollection = db.collection('seenlists');
const reviewsCollection = db.collection('reviews');

// export utils/refs
export { db, auth, usersCollection, moviesCollection, watchListsCollection, seenListsCollection, reviewsCollection, firebase };
