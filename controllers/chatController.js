const Chat = require("../models/Chat");
const User = require("../models/User");
const { sendNotification } = require("../utils/notifications");

/**
 * @desc    Start or retrieve an existing chat between current user and recipient
 * @route   POST /api/chats
 * @access  Private
 */
const createOrGetChat = async (req, res, next) => {
    try {
        const { recipientId, gigId, initialMessage } = req.body;

        if (!recipientId) {
            return res.status(400).json({
                success: false,
                message: "recipientId is required"
            });
        }

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot start a chat with yourself"
            });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient user not found"
            });
        }

        // Check if chat already exists between these two participants
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, recipientId] },
            ...(gigId ? { gig: gigId } : {})
        })
            .populate("participants", "name email role")
            .populate("gig", "title");

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, recipientId],
                gig: gigId || null,
                messages: initialMessage
                    ? [
                          {
                              sender: req.user._id,
                              content: initialMessage,
                              timestamp: new Date()
                          }
                      ]
                    : [],
                lastMessage: initialMessage
                    ? {
                          content: initialMessage,
                          sender: req.user._id,
                          timestamp: new Date()
                      }
                    : {}
            });

            await chat.populate([
                { path: "participants", select: "name email role" },
                { path: "gig", select: "title" }
            ]);

            // Notify recipient if initial message provided
            if (initialMessage) {
                await sendNotification({
                    userId: recipientId,
                    fcmToken: recipient.fcmToken,
                    title: `New message from ${req.user.name}`,
                    body: initialMessage,
                    type: "NEW_MESSAGE",
                    payload: { chatId: chat._id.toString() }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Chat retrieved or initialized successfully",
            data: { chat }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all chat conversations for current user
 * @route   GET /api/chats
 * @access  Private
 */
const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id
        })
            .populate("participants", "name email role")
            .populate("gig", "title status")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: chats.length,
            message: "Chats retrieved successfully",
            data: { chats }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single chat with full message history
 * @route   GET /api/chats/:id
 * @access  Private
 */
const getChatById = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate("participants", "name email role")
            .populate("gig", "title")
            .populate("messages.sender", "name email");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Authorization check: requester must be a participant or admin
        const isParticipant = chat.participants.some(
            (p) => p._id.toString() === req.user._id.toString()
        );

        if (!isParticipant && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to view this chat conversation"
            });
        }

        res.status(200).json({
            success: true,
            message: "Chat messages retrieved successfully",
            data: { chat }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send a message via REST API
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty"
            });
        }

        const chat = await Chat.findById(req.params.id).populate("participants");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const isParticipant = chat.participants.some(
            (p) => p._id.toString() === req.user._id.toString()
        );

        if (!isParticipant && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not a participant in this conversation"
            });
        }

        const newMessage = {
            sender: req.user._id,
            content: content.trim(),
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            content: content.trim(),
            sender: req.user._id,
            timestamp: new Date()
        };

        await chat.save();

        // Identify counterparty for notification
        const recipient = chat.participants.find(
            (p) => p._id.toString() !== req.user._id.toString()
        );

        if (recipient) {
            await sendNotification({
                userId: recipient._id.toString(),
                fcmToken: recipient.fcmToken,
                title: `Message from ${req.user.name}`,
                body: content.trim(),
                type: "NEW_MESSAGE",
                payload: { chatId: chat._id.toString() }
            });
        }

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: { message: newMessage }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrGetChat,
    getChats,
    getChatById,
    sendMessage
};

// Chat	MongoDB chat model
// participants	Users involved in chat
// $all	Checks that multiple values exist
// populate()	Gets related document information
// req.params	Gets ID from URL
// req.body	Gets data sent by frontend
// req.user	Logged-in user
// .push()	Adds message to array
// .save()	Saves changes to MongoDB
// 403	User isn't authorized
// 404	Chat/user doesn't exist
// FCM	Sends notification to recipient
// 🎯 One-line viva answer

// chatController.js manages user conversations by creating chats, retrieving chats and messages, sending messages, checking participant authorization, saving messages in MongoDB, and notifying the recipient through Firebase.