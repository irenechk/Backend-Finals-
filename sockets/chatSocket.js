const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const User = require("../models/User");

/**
 * Socket.io Real-time Chat Handler
 * Manages live communication, room subscriptions, typing indicators, and message broadcasting.
 * 
 * @param {import("socket.io").Server} io 
 */
const initChatSocket = (io) => {
    // Optional socket authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (token) {
            try {
                const secret = process.env.JWT_SECRET || "gighub_jwt_fallback_secret_college_project";
                const decoded = jwt.verify(token, secret);
                socket.userId = decoded.userId;
            } catch (err) {
                console.warn("[Socket Auth] Token verification failed:", err.message);
            }
        }
        next();
    });

    io.on("connection", (socket) => {
        console.log(`[Socket Connected] Socket ID: ${socket.id}${socket.userId ? ` (User: ${socket.userId})` : ""}`);

        // Automatically join user's private notification channel if authenticated
        if (socket.userId) {
            socket.join(`user_${socket.userId}`);
        }

        /**
         * Client explicitly joins their private notification room
         */
        socket.on("join_user", (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`[Socket] User ${userId} joined room 'user_${userId}'`);
            }
        });

        /**
         * Freelancers join the general 'freelancers' broadcast room for new gig alerts
         */
        socket.on("join_freelancers", () => {
            socket.join("freelancers");
            console.log(`[Socket ${socket.id}] Joined 'freelancers' notification room`);
        });

        /**
         * User joins a specific conversation chat room
         */
        socket.on("join_chat", async (chatId) => {
            if (!chatId) return;
            socket.join(`chat_${chatId}`);
            console.log(`[Socket ${socket.id}] Joined chat room 'chat_${chatId}'`);
        });

        /**
         * User leaves a specific conversation chat room
         */
        socket.on("leave_chat", (chatId) => {
            if (!chatId) return;
            socket.leave(`chat_${chatId}`);
            console.log(`[Socket ${socket.id}] Left chat room 'chat_${chatId}'`);
        });

        /**
         * Real-time message exchange
         */
        socket.on("send_message", async (data) => {
            try {
                const { chatId, senderId, content } = data;

                if (!chatId || !content || !content.trim()) {
                    return socket.emit("error", { message: "chatId and non-empty content are required" });
                }

                const actualSender = senderId || socket.userId;
                if (!actualSender) {
                    return socket.emit("error", { message: "Sender ID is required" });
                }

                const chat = await Chat.findById(chatId).populate("participants", "name email fcmToken");
                if (!chat) {
                    return socket.emit("error", { message: "Chat conversation not found" });
                }

                // Verify sender is participant
                const isParticipant = chat.participants.some(
                    (p) => p._id.toString() === actualSender.toString()
                );
                if (!isParticipant) {
                    return socket.emit("error", { message: "Unauthorized to send messages in this chat" });
                }

                const messageObj = {
                    sender: actualSender,
                    content: content.trim(),
                    timestamp: new Date()
                };

                chat.messages.push(messageObj);
                chat.lastMessage = {
                    content: content.trim(),
                    sender: actualSender,
                    timestamp: new Date()
                };

                await chat.save();

                // Fetch sender name for display
                const senderUser = chat.participants.find((p) => p._id.toString() === actualSender.toString());
                const recipientUser = chat.participants.find((p) => p._id.toString() !== actualSender.toString());

                const broadcastPayload = {
                    chatId,
                    message: {
                        _id: chat.messages[chat.messages.length - 1]._id,
                        sender: {
                            _id: actualSender,
                            name: senderUser?.name || "User"
                        },
                        content: content.trim(),
                        timestamp: messageObj.timestamp
                    }
                };

                // Broadcast to everyone currently active in the chat room
                io.to(`chat_${chatId}`).emit("new_message", broadcastPayload);

                // Also notify recipient if they are listening to their user notification channel
                if (recipientUser) {
                    io.to(`user_${recipientUser._id}`).emit("notification", {
                        title: `Message from ${senderUser?.name || "User"}`,
                        body: content.trim(),
                        type: "NEW_MESSAGE",
                        payload: { chatId }
                    });
                }
            } catch (err) {
                console.error("[Socket Message Error]:", err.message);
                socket.emit("error", { message: "Failed to persist and send message", details: err.message });
            }
        });

        /**
         * Typing indicator
         */
        socket.on("typing", ({ chatId, userName }) => {
            if (chatId) {
                socket.to(`chat_${chatId}`).emit("user_typing", { chatId, userName });
            }
        });

        /**
         * Stop typing indicator
         */
        socket.on("stop_typing", ({ chatId, userName }) => {
            if (chatId) {
                socket.to(`chat_${chatId}`).emit("user_stop_typing", { chatId, userName });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[Socket Disconnected] Socket ID: ${socket.id}`);
        });
    });
};

module.exports = initChatSocket;
