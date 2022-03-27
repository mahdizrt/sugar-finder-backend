import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigProd = {
  apiKey: "AIzaSyA2i00HbaBCtoh9aipAXg1bRZbjKM7zAzc",
  authDomain: "shoger-yab.firebaseapp.com",
  projectId: "shoger-yab",
  storageBucket: "shoger-yab.appspot.com",
  messagingSenderId: "482099327447",
  appId: "1:482099327447:web:45b9127b9a4d49db5d1b92",
};

const firebaseConfigDev = {
  apiKey: "AIzaSyAZHtWcXt2DtJljg1k3AwSD4wfvUm9mEFs",
  authDomain: "sugar-yab-staging.firebaseapp.com",
  projectId: "sugar-yab-staging",
  storageBucket: "sugar-yab-staging.appspot.com",
  messagingSenderId: "828471723544",
  appId: "1:828471723544:web:61506f8643414f6f15656d",
};

const Dev = process.env.NODE_ENV === "development";
const firebaseConfig = Dev ? firebaseConfigDev : firebaseConfigProd;

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { firebaseApp, db };
