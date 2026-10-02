const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

/**
 * Firebase Admin Initialization
 * Connects to Firebase Cloud Messaging (FCM) using a service account credentials file.
 * If credentials are not provided or the file does not exist, it runs in simulated mode
 * so the server never crashes.
 */
let firebaseApp = null;
let isInitialized = false;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
        ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : path.join(__dirname, "serviceAccountKey.json");

    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isInitialized = true;
        console.log("Firebase Admin SDK initialized successfully");
    } else {
        console.log("Firebase service account credentials not found. Firebase notifications will run in SIMULATION mode.");
    }
} catch (error) {
    console.warn("Firebase initialization warning (running in fallback mode):", error.message);
    isInitialized = false;
}

module.exports = {
    admin,
    firebaseApp,
    isInitialized: () => isInitialized
};


// Firebase Admin SDK → allows the backend to use Firebase services.
// FCM → Firebase Cloud Messaging, used for push notifications.
// fs → reads/checks the credentials file.
// path → handles file paths.
// Service account → authenticates the backend with Firebase.
// try/catch → prevents Firebase errors from crashing the server.
// Simulation mode → allows the application to work even without Firebase credentials.
// isInitialized → tells other files whether Firebase is ready.

// firebase.js initializes Firebase Admin for backend notifications using service-account credentials, while using fallback mode if the credentials are unavailable.