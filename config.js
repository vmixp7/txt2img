import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC4KNhzUBgTdjICbZY4U7Ni3gkL7Jm4oVs",
  authDomain: "txt2img-c11dc.firebaseapp.com",
  projectId: "txt2img-c11dc",
  storageBucket: "txt2img-c11dc.appspot.com",
  messagingSenderId: "871308186906",
  appId: "1:871308186906:web:bbc726123522060766c8a3",
  measurementId: "G-4939Y3NK3S"
};

export default function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}