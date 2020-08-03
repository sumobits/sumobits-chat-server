/**
 * @format
 */
import dotenv from 'dotenv';
import firebase from 'firebase/app';
import 'firebase/auth';

dotenv.config();

const config = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

class FirebaseUtil {

    constructor () {
        firebase.initializeApp(config);
    }

    createUser = async (email, passowrd) => {
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, passowrd);
            console.debug(`registered new user -> ${email}`);
            return firebase.auth().currentUser;
        } catch (err) {
            console.error(`error registering user<${email}> -> ${err}`);
            throw err;
        }
    }

    login = async (email, passowrd) => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, passowrd);
            console.debug(`user -> ${email} signed in`);
            return firebase.auth().currentUser;
        } catch (err) {
            console.error(`error signing in user<${email}> -> ${err}`);
            throw err;
        }
    }

    logout = async () => {
        try {
            await firebase.auth().signOut();
            console.debug('user signed out');
        } catch (err) {
            console.error(`error signing user out -> ${err}`);
            throw err;
        }
    }
};

export default new FirebaseUtil();
