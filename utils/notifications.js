const { admin, isInitialized } = require("../config/firebase");

// Reference to Socket.io instance (will be set during server bootstrap)
let ioInstance = null;

/**
 * Set the Socket.io server instance for real-time notifications
 * @param {object} io - Socket.io Server instance
 */
const setSocketIO = (io) => {
    ioInstance = io;
};

/**
 * Send notification to a specific user (via Socket.io and Firebase FCM)
 * @param {object} options
 * @param {string} options.userId - Target recipient user ID
 * @param {string} [options.fcmToken] - Target recipient device token
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification description/body
 * @param {string} options.type - Event type (e.g. 'NEW_BID', 'BID_ACCEPTED', 'MILESTONE_UPDATED', 'NEW_MESSAGE', 'DISPUTE_RAISED')
 * @param {object} [options.payload] - Additional metadata
 */
const sendNotification = async ({ userId, fcmToken, title, body, type, payload = {} }) => {
    const notificationData = {
        title,
        body,
        type,
        payload,
        createdAt: new Date().toISOString()
    };

    // 1. Send via Socket.io to the user's private notification room
    if (ioInstance && userId) {
        ioInstance.to(`user_${userId}`).emit("notification", notificationData);
        console.log(`[Socket Notification] Sent to room 'user_${userId}': [${type}] ${title}`);
    }

    // 2. Send via Firebase Cloud Messaging if initialized and token exists
    if (isInitialized() && fcmToken) {
        try {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title,
                    body
                },
                data: {
                    type,
                    payload: JSON.stringify(payload)
                }
            });
            console.log(`[Firebase FCM] Successfully sent to token ${fcmToken.slice(0, 10)}...: ${title}`);
        } catch (error) {
            console.error(`[Firebase FCM Error] Failed to send push notification:`, error.message);
        }
    } else {
        // Fallback / simulated notification log
        console.log(`[Notification Simulated] Recipient: ${userId || "broadcast"} | Type: ${type} | ${title}: ${body}`);
    }

    return notificationData;
};

/**
 * Broadcast notification to a general channel (e.g. all freelancers for a new open gig)
 * @param {object} options
 * @param {string} options.room - Room name (e.g., 'freelancers' or 'gigs')
 * @param {string} options.title - Title
 * @param {string} options.body - Body
 * @param {string} options.type - Event type
 * @param {object} [options.payload] - Metadata
 */
const broadcastNotification = ({ room, title, body, type, payload = {} }) => {
    const notificationData = {
        title,
        body,
        type,
        payload,
        createdAt: new Date().toISOString()
    };

    if (ioInstance) {
        if (room) {
            ioInstance.to(room).emit("notification", notificationData);
        } else {
            ioInstance.emit("notification", notificationData);
        }
        console.log(`[Socket Broadcast] Sent to '${room || "all"}': [${type}] ${title}`);
    } else {
        console.log(`[Broadcast Simulated] Room: ${room} | Type: ${type} | ${title}: ${body}`);
    }

    return notificationData;
};

module.exports = {
    setSocketIO,
    sendNotification,
    broadcastNotification
};
