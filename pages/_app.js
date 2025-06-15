import "../styles/globals.css";
import { Analytics } from '@vercel/analytics/react';

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { useEffect, useState } from "react";
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const firebaseConfig = publicRuntimeConfig.firebase

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });



const signIn = () => auth.signInWithRedirect(provider);
const signOut = () => auth.signOut();



function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      setUser(user);
    });
  }, []);


  return (
    <>
      <Component
      {...pageProps}
      user={user}
      signIn={signIn}
      signOut={signOut}
      />
      <Analytics />
    </>
  );
}

export default MyApp;
