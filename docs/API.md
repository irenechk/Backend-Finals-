# GigHub — API Documentation

This document provides complete reference information for all REST API endpoints and WebSocket events in the **GigHub Freelance Marketplace Backend**.

Interactive Swagger UI is also available at:
```
http://localhost:5000/api-docs
```

---

## Base URL
```
http://localhost:5000/api
```

## Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error summary",
  "error": "Detailed error explanation"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@client.com",
  "password": "Password123",
  "role": "client", // "client" | "freelancer"
  "bio": "Founder at TechCo",
  "skills": ["Management", "Product"]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "651...",
      "name": "Jane Doe",
      "email": "jane@client.com",
      "role": "client"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Access:** Public
- **Body:**
```json
{
  "email": "jane@client.com",
  "password": "Password123",
  "fcmToken": "optional-firebase-token"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "651...",
      "name": "Jane Doe",
      "email": "jane@client.com",
      "role": "client"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### Get Current User Profile
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Access:** Private (`Bearer <token>`)

### Update FCM Push Token
- **Method:** `PUT`
- **URL:** `/api/auth/fcm-token`
- **Access:** Private
- **Body:** `{ "fcmToken": "token-string" }`

---

## 2. Gig Endpoints (`/api/gigs`)

### Browse Gigs
- **Method:** `GET`
- **URL:** `/api/gigs`
- **Access:** Public
- **Query Parameters:**
  - `search`: Keyword in title or description
  - `category`: Category name (e.g. `Web Development`)
  - `status`: `open` | `in_progress` | `completed` | `all`
  - `minBudget`: Minimum budget
  - `maxBudget`: Maximum budget

### Get Gig by ID
- **Method:** `GET`
- **URL:** `/api/gigs/:id`
- **Access:** Public

### Create Gig
- **Method:** `POST`
- **URL:** `/api/gigs`
- **Access:** Private (`client` role required)
- **Body:**
```json
{
  "title": "Design and Build MERN Freelance Platform",
  "description": "Full-stack project with Socket.io chat and escrow.",
  "budget": 1500,
  "category": "Web Development",
  "skills": ["React", "Node.js", "MongoDB", "Socket.io"],
  "deadline": "2026-12-31"
}
```

### Update Gig
- **Method:** `PUT`
- **URL:** `/api/gigs/:id`
- **Access:** Private (Gig owner client or admin)

### Delete Gig
- **Method:** `DELETE`
- **URL:** `/api/gigs/:id`
- **Access:** Private (Gig owner client or admin)

---

## 3. Bid Endpoints (`/api/bids`)

### Submit Bid
- **Method:** `POST`
- **URL:** `/api/bids`
- **Access:** Private (`freelancer` role required)
- **Body:**
```json
{
  "gig": "651...",
  "amount": 1400,
  "proposal": "I have experience with full-stack Node.js and Socket.io systems.",
  "deliveryTime": 14
}
```
*(Enforces unique bid per freelancer per gig)*

### Get Bids
- **Method:** `GET`
- **URL:** `/api/bids?gig=:gigId`
- **Access:** Private

### Get Bid by ID
- **Method:** `GET`
- **URL:** `/api/bids/:id`
- **Access:** Private (Gig owner or submitting freelancer)

### Update / Accept / Reject Bid
- **Method:** `PUT`
- **URL:** `/api/bids/:id`
- **Access:** Private
- **For Client:** Accept or reject:
```json
{ "status": "accepted" } // or "rejected"
```
*(When a bid is accepted, the gig status automatically transitions to `in_progress` and other pending bids are rejected).*
- **For Freelancer:** Edit bid terms while pending or withdraw:
```json
{ "status": "withdrawn" }
```

---

## 4. Milestone Endpoints (`/api/milestones`)

### Create Milestone
- **Method:** `POST`
- **URL:** `/api/milestones`
- **Access:** Private (`client` role required)
- **Body:**
```json
{
  "gig": "651...",
  "freelancer": "651...",
  "title": "Milestone 1 — Authentication & Database",
  "description": "Implement User model, JWT auth, and role verification.",
  "amount": 500,
  "dueDate": "2026-10-15"
}
```

### Get Milestones
- **Method:** `GET`
- **URL:** `/api/milestones?gig=:gigId`
- **Access:** Private

### Update Milestone
- **Method:** `PUT`
- **URL:** `/api/milestones/:id`
- **Access:** Private
- **For Freelancer:** Submit deliverable:
```json
{
  "status": "submitted",
  "submissionNotes": "PR submitted and backend tests passing."
}
```
- **For Client:** Approve and release escrow:
```json
{
  "status": "approved",
  "escrowStatus": "released"
}
```

---

## 5. Escrow Endpoints (`/api/escrow`)

*(Simulated Third-Party Escrow Payment Gateway)*

### Fund Escrow
- **Method:** `POST`
- **URL:** `/api/escrow/fund/:milestoneId`
- **Access:** Private (`client` role)
- Locks project funds in escrow.

### Release Escrow
- **Method:** `POST`
- **URL:** `/api/escrow/release/:milestoneId`
- **Access:** Private (`client` role)
- Payouts escrow funds to freelancer upon completion.

### Refund Escrow
- **Method:** `POST`
- **URL:** `/api/escrow/refund/:milestoneId`
- **Access:** Private (`client` or `admin` role)
- Returns funds to client in case of dispute resolution.

### Get Escrow Status
- **Method:** `GET`
- **URL:** `/api/escrow/status/:milestoneId`
- **Access:** Private

---

## 6. Real-Time Chat Endpoints (`/api/chats`)

### Start or Get Chat
- **Method:** `POST`
- **URL:** `/api/chats`
- **Access:** Private
- **Body:**
```json
{
  "recipientId": "651...",
  "gigId": "651...",
  "initialMessage": "Hello, let's discuss the project requirements."
}
```

### List My Chats
- **Method:** `GET`
- **URL:** `/api/chats`
- **Access:** Private

### Get Chat by ID (Message History)
- **Method:** `GET`
- **URL:** `/api/chats/:id`
- **Access:** Private (Participants only)

### Send Message (REST Fallback)
- **Method:** `POST`
- **URL:** `/api/chats/:id/messages`
- **Access:** Private (Participants only)
- **Body:**
```json
{
  "content": "Work is progressing well, on track for Friday deliverable."
}
```

---

## 7. Socket.io Real-Time Protocol

### Connection
- **URL:** `ws://localhost:5000`
- **Auth (Optional):** `{ auth: { token: "<jwt_token>" } }`

### Client-to-Server Events
| Event Name | Payload | Description |
|---|---|---|
| `join_user` | `userId` | Subscribes to private notification room (`user_<userId>`) |
| `join_chat` | `chatId` | Joins a conversation room (`chat_<chatId>`) |
| `leave_chat` | `chatId` | Leaves a conversation room |
| `join_freelancers` | none | Joins open gig broadcast room |
| `send_message` | `{ chatId, senderId, content }` | Sends a message; persists to DB and broadcasts |
| `typing` | `{ chatId, userName }` | Emits typing state to conversation participants |
| `stop_typing` | `{ chatId, userName }` | Clears typing indicator |

### Server-to-Client Events
| Event Name | Payload | Description |
|---|---|---|
| `new_message` | `{ chatId, message: { _id, sender, content, timestamp } }` | Live message delivered to chat room |
| `user_typing` | `{ chatId, userName }` | Peer typing notification |
| `user_stop_typing`| `{ chatId, userName }` | Peer stopped typing |
| `notification` | `{ title, body, type, payload, createdAt }` | In-app notification for bids, escrow, milestones, etc. |

---

## 8. Dispute Endpoints (`/api/disputes`)

### Raise Dispute
- **Method:** `POST`
- **URL:** `/api/disputes`
- **Access:** Private
- **Body:**
```json
{
  "gig": "651...",
  "against": "651...",
  "reason": "Scope mismatch",
  "description": "Features delivered differ from project specification."
}
```

### Get Disputes
- **Method:** `GET`
- **URL:** `/api/disputes`
- **Access:** Private

### Update Dispute Status / Resolution
- **Method:** `PUT`
- **URL:** `/api/disputes/:id`
- **Access:** Private (Dispute participants or Admin)
- **Body:**
```json
{
  "status": "resolved", // "open" | "under_review" | "resolved" | "rejected"
  "resolution": "Parties agreed on 50% escrow payout."
}
```

---

## 9. Portfolio Endpoints (`/api/portfolio`)

### View Public Freelancer Portfolio
- **Method:** `GET`
- **URL:** `/api/portfolio/:freelancerId`
- **Access:** Public

### Update Portfolio Profile
- **Method:** `PUT`
- **URL:** `/api/portfolio`
- **Access:** Private (`freelancer` role)
- **Body:**
```json
{
  "bio": "Senior Backend Architect specializing in Node.js and MongoDB",
  "skills": ["Node.js", "Express", "MongoDB", "Socket.io", "Docker"]
}
```
