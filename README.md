# GigHub — Freelance Marketplace Backend

> **Case Study 27: Backend Development — Freelance Marketplace**  
> A full-featured, secure, and production-ready RESTful and WebSocket backend built with **Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.io, and Firebase**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [MongoDB Setup (Local)](#mongodb-setup-local)
8. [Firebase Setup & Fallback Mode](#firebase-setup--fallback-mode)
9. [Running the Server](#running-the-server)
10. [API Documentation & Swagger UI](#api-documentation--swagger-ui)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Role-Based Authorization Matrix](#role-based-authorization-matrix)
13. [Socket.io Real-Time Protocol](#socketio-real-time-protocol)
14. [Simulated Escrow Payment Workflow](#simulated-escrow-payment-workflow)
15. [Step-by-Step API Flow](#step-by-step-api-flow)
16. [Automated Testing](#automated-testing)
17. [Viva & Interview Preparation Guide](#viva--interview-preparation-guide)
18. [Future Enhancements](#future-enhancements)

---

## Project Overview

**GigHub** is a backend system designed for modern freelance marketplaces (similar to Upwork or Fiverr). It connects **Clients** seeking digital work with skilled **Freelancers**.

The backend manages the complete freelance project lifecycle:
- User registration and login with secure **JWT authentication** and **bcrypt** password hashing.
- Role-based permissions preventing unauthorized actions between Clients and Freelancers.
- Gig postings with categorization, budget filtering, and text search.
- Competitive bidding with duplicate bid prevention.
- Milestone tracking with **simulated Escrow payment protection**.
- Live messaging and typing indicators using **Socket.io**.
- In-app push notification system backed by **Firebase Cloud Messaging (FCM)** with automatic fallback.
- Dispute escalation and resolution workflow.

---

## Core Features

- **JWT Authentication & Authorization**: Stateless Bearer tokens with role enforcement (`client`, `freelancer`, `admin`).
- **Gig Management**: Full CRUD for gigs, search by keyword, filter by category/budget, status tracking (`open`, `in_progress`, `completed`, `cancelled`).
- **Bid System**: Freelancers submit proposals with price and delivery time; clients accept or reject bids; duplicate bids are prevented using compound database indexes.
- **Milestone & Escrow System**: Project phases tracked with deliverables; simulated Escrow locks funds upon initiation and releases payment upon client approval.
- **Real-Time Communication**: Bi-directional chat rooms via Socket.io with typing indicators and persistent MongoDB message storage.
- **Dispute Resolution**: Clients or freelancers can raise formal disputes on milestones/projects, review claims, and record negotiated resolutions.
- **Interactive Swagger Documentation**: OpenAPI 3.0 specification available at `/api-docs`.
- **Postman Collection**: Exportable collection in `docs/GigHub.postman_collection.json`.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js (v22+)** | JavaScript asynchronous runtime environment |
| **Express.js (v5)** | Web framework for routing and RESTful middleware |
| **MongoDB (v8+)** | Local document-oriented NoSQL database |
| **Mongoose (v9)** | ODM (Object Data Modeling) for schema validation and relational references |
| **JSON Web Tokens (JWT)** | Secure stateless session authentication |
| **bcryptjs** | One-way cryptographic password hashing (salt rounds: 10) |
| **Socket.io (v4)** | Real-time WebSocket server for bi-directional chat and events |
| **Firebase Admin SDK** | Backend push notifications via Firebase Cloud Messaging |
| **Swagger UI Express** | Interactive OpenAPI 3.0 API documentation |
| **CORS & dotenv** | Cross-Origin Resource Sharing and environment configuration |

---

## Project Structure

```
GigHub/
├── config/
│   ├── db.js                     # Local MongoDB connection logic
│   └── firebase.js               # Firebase Admin SDK init with graceful fallback
│
├── controllers/
│   ├── authController.js         # Register, Login, Profile, FCM token
│   ├── gigController.js          # Gig CRUD, search, and category filters
│   ├── bidController.js          # Bid proposals, acceptance, and transitions
│   ├── milestoneController.js    # Milestones & deliverable submissions
│   ├── chatController.js         # REST endpoints for chats and messages
│   ├── disputeController.js      # Conflict creation, review, and resolution
│   ├── escrowController.js       # Simulated Escrow deposit, release, and refund
│   └── portfolioController.js    # Public freelancer portfolio and statistics
│
├── middleware/
│   ├── authMiddleware.js         # JWT Bearer token verification
│   ├── roleMiddleware.js         # Role-based route guard ('client'/'freelancer')
│   ├── validationMiddleware.js   # Request body, email, and ObjectId validator
│   └── errorMiddleware.js        # 404 handler & centralized error formatting
│
├── models/
│   ├── User.js                   # Client and Freelancer accounts
│   ├── Gig.js                    # Freelance project listings
│   ├── Bid.js                    # Freelancer proposals (compound unique index)
│   ├── Milestone.js              # Deliverable milestones & escrow status
│   ├── Chat.js                   # Conversation threads and message subdocuments
│   └── Dispute.js                # Conflict tracking and resolution
│
├── routes/
│   ├── authRoutes.js             # /api/auth
│   ├── gigRoutes.js              # /api/gigs
│   ├── bidRoutes.js              # /api/bids
│   ├── milestoneRoutes.js        # /api/milestones
│   ├── chatRoutes.js             # /api/chats
│   ├── disputeRoutes.js          # /api/disputes
│   ├── escrowRoutes.js           # /api/escrow
│   └── portfolioRoutes.js        # /api/portfolio
│
├── sockets/
│   └── chatSocket.js             # Socket.io connection, rooms, and messaging
│
├── utils/
│   ├── generateToken.js          # JWT generator helper
│   └── notifications.js          # Unified Socket.io + Firebase push dispatcher
│
├── docs/
│   ├── API.md                    # Human-readable API specification
│   ├── swagger.js                # OpenAPI 3.0 interactive specification
│   └── GigHub.postman_collection.json # Ready-to-import Postman collection
│
├── test_suite.js                 # 29-point automated end-to-end test suite
├── server.js                     # Express bootstrap, HTTP server, & Socket.io mount
├── .env                          # Local environment secrets (ignored by Git)
├── .env.example                  # Template configuration file
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Comprehensive project documentation
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js (v18+ or v22+)
- MongoDB installed locally and running on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
Open terminal inside the `GigHub` directory:
```bash
cd /Users/irenek/Backend/GigHub
npm install --ignore-scripts
```

---

## Environment Variables

The project uses `.env` for configuration. An example template is provided in `.env.example`:

```env
# Server Port
PORT=5000

# Local MongoDB URI
MONGO_URI=mongodb://127.0.0.1:27017/GigHub

# JWT Secret Key
JWT_SECRET=gighub_jwt_secret_key_2026_secure_college_project

# Firebase Admin Service Account Key (Optional)
# FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

---

## MongoDB Setup (Local)

GigHub connects directly to your local MongoDB service:
```
mongodb://127.0.0.1:27017/GigHub
```

Verify that your local MongoDB daemon is active:
```bash
# Check MongoDB status
mongosh "mongodb://127.0.0.1:27017"
```

No Atlas or cloud configuration is needed. The database and collections are created automatically on first run.

---

## Firebase Setup & Fallback Mode

GigHub includes integration with the **Firebase Admin SDK** for push notifications:
- When a service account file is placed at `config/serviceAccountKey.json` (or specified via `FIREBASE_SERVICE_ACCOUNT_PATH`), real Firebase Cloud Messaging push notifications are dispatched to registered user device tokens (`fcmToken`).
- **Graceful Fallback**: If no Firebase credentials are configured, the system **automatically switches to simulation mode**. All notifications are logged to the console and broadcast over Socket.io in real-time without crashing the server.

---

## Running the Server

### Production / Standard Mode:
```bash
node server.js
```

### Development Mode (with automatic reload):
```bash
node node_modules/nodemon/bin/nodemon.js server.js
```
*(Or `./node_modules/.bin/nodemon server.js`)*

> **Note on macOS Port 5000**: Modern macOS uses port 5000 for the AirPlay Receiver service. `server.js` includes an intelligent auto-fallback: if port 5000 is occupied, it automatically shifts to port 5001.

Server endpoints:
- API Base: `http://localhost:5000/api` (or `5001`)
- Swagger UI: `http://localhost:5000/api-docs`
- Socket.io: `ws://localhost:5000`

---

## API Documentation & Swagger UI

Interactive Swagger UI documentation is available directly in the browser at:
```
http://localhost:5000/api-docs
```

You can test every endpoint directly through Swagger UI by clicking **Authorize** and supplying `Bearer <your_token>`.

Additionally:
- Detailed markdown API spec: [API.md](docs/API.md)
- Postman Collection: [GigHub.postman_collection.json](docs/GigHub.postman_collection.json)

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register client or freelancer |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Private | Get currently authenticated profile |
| `PUT` | `/api/auth/fcm-token` | Private | Update Firebase device token |

### Gigs (`/api/gigs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/gigs` | Public | Browse gigs (filter by category, budget, status, search) |
| `GET` | `/api/gigs/:id` | Public | View single gig details |
| `POST` | `/api/gigs` | Private (Client) | Create new freelance gig posting |
| `PUT` | `/api/gigs/:id` | Private (Owner/Admin) | Update gig details |
| `DELETE` | `/api/gigs/:id` | Private (Owner/Admin) | Remove gig |

### Bids (`/api/bids`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bids` | Private (Freelancer) | Submit proposal (one per gig per freelancer) |
| `GET` | `/api/bids` | Private | View bids for user or specific gig |
| `GET` | `/api/bids/:id` | Private | View bid details |
| `PUT` | `/api/bids/:id` | Private | Accept/Reject (Client) or Edit/Withdraw (Freelancer) |

### Milestones (`/api/milestones`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/milestones` | Private (Client) | Create milestone deliverable |
| `GET` | `/api/milestones` | Private | List project milestones |
| `PUT` | `/api/milestones/:id` | Private | Submit deliverable (Freelancer) or Approve (Client) |

### Simulated Escrow (`/api/escrow`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/escrow/fund/:milestoneId` | Private (Client) | Lock funds in escrow (`not_funded` -> `funded`) |
| `POST` | `/api/escrow/release/:milestoneId`| Private (Client) | Payout funds to freelancer (`funded` -> `released`) |
| `POST` | `/api/escrow/refund/:milestoneId` | Private (Client/Admin)| Refund escrow upon dispute (`funded` -> `refunded`) |
| `GET` | `/api/escrow/status/:milestoneId` | Private | View current escrow status & balance |

### Chat & Messaging (`/api/chats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/chats` | Private | Start or get conversation between 2 users |
| `GET` | `/api/chats` | Private | List all user chat threads |
| `GET` | `/api/chats/:id` | Private (Participants)| Retrieve full chat message history |
| `POST` | `/api/chats/:id/messages` | Private (Participants)| Send message via REST API |

### Disputes (`/api/disputes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/disputes` | Private | Raise dispute against client or freelancer |
| `GET` | `/api/disputes` | Private | View disputes for current user |
| `PUT` | `/api/disputes/:id` | Private | Update status or submit resolution notes |

### Portfolio (`/api/portfolio`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/portfolio/:freelancerId`| Public | View freelancer public stats & completed gigs |
| `PUT` | `/api/portfolio` | Private (Freelancer) | Update bio and skills |

---

## Role-Based Authorization Matrix

| Action | Client | Freelancer | Admin |
|---|:---:|:---:|:---:|
| Post Gig | Yes | No (403) | Yes |
| Edit/Delete Own Gig | Yes | No (403) | Yes |
| Submit Bid | No (403) | Yes | Yes |
| Accept/Reject Bid | Yes | No (403) | Yes |
| Create Milestone | Yes | No (403) | Yes |
| Fund Escrow | Yes | No (403) | Yes |
| Submit Milestone Work | No | Yes | Yes |
| Release Escrow Payout | Yes | No (403) | Yes |
| Join Chat Room | Yes | Yes | Yes |
| Raise Dispute | Yes | Yes | Yes |

---

## Socket.io Real-Time Protocol

Socket.io runs alongside the Express HTTP server on the same port.

```javascript
const socket = io("http://localhost:5000", {
    auth: { token: "your_jwt_bearer_token" }
});
```

### Supported Events:
1. `join_user`: Client joins their personal notification channel (`user_<userId>`).
2. `join_chat`: Participants subscribe to a specific conversation room (`chat_<chatId>`).
3. `send_message`: Emits `{ chatId, senderId, content }`. Persists to MongoDB and broadcasts `new_message` to room members.
4. `typing` / `stop_typing`: Broadcasts `user_typing` indicator to other participants.
5. `notification`: Receives instant real-time alerts when bids are placed, bids are accepted, escrow is funded, or disputes are raised.

---

## Simulated Escrow Payment Workflow

In real-world platforms, an escrow account holds funds securely so that:
1. Freelancers know funds are guaranteed before doing the work.
2. Clients are protected until deliverables are reviewed.

### Escrow State Machine:
```
[not_funded] ──(Client Funds Escrow)──> [funded]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
(Client Approves Work & Releases Payment)      (Dispute Resolution / Refund)
                        │                                     │
                        ▼                                     ▼
                   [released]                            [refunded]
```

---

## Step-by-Step API Flow

```
1. Register Client (POST /api/auth/register)
   ↓
2. Register Freelancer (POST /api/auth/register)
   ↓
3. Login & Obtain JWT (POST /api/auth/login)
   ↓
4. Client Creates Gig (POST /api/gigs)
   ↓ (Broadcasts 'NEW_GIG' event to freelancers)
5. Freelancer Submits Bid (POST /api/bids)
   ↓ (Sends 'NEW_BID' notification to Client)
6. Client Accepts Bid (PUT /api/bids/:id with { "status": "accepted" })
   ↓ (Gig status becomes 'in_progress')
7. Client Creates Milestone (POST /api/milestones)
   ↓
8. Client Funds Escrow (POST /api/escrow/fund/:milestoneId)
   ↓ (Escrow status becomes 'funded')
9. Client & Freelancer Chat in Real-Time (Socket.io room chat_<chatId>)
   ↓
10. Freelancer Submits Deliverable (PUT /api/milestones/:id with status 'submitted')
   ↓
11. Client Approves Work & Releases Escrow (POST /api/escrow/release/:milestoneId)
   ↓ (Escrow status becomes 'released', Milestone status becomes 'completed')
12. (Optional) If conflict occurs: Raise Dispute (POST /api/disputes) and Resolve (PUT /api/disputes/:id)
```

---

## Automated Testing

A comprehensive automated test suite is provided in `test_suite.js`. It validates **29 distinct assertions** across authentication, authorization, gigs, bids, milestones, escrow, chat, Socket.io real-time message exchange, disputes, and validation.

### Run the Test Suite:
```bash
node test_suite.js
```

### Test Suite Output:
```
==================================================
   GIGHUB BACKEND COMPREHENSIVE TEST SUITE
==================================================

[PASS] 1. Server starts & root health endpoint responds 200 OK
[PASS] 2. Interactive Swagger UI endpoint is accessible at /api-docs
[PASS] 3. Client registration creates user and returns JWT token
[PASS] 4. Freelancer registration creates user and returns JWT token
[PASS] 5. Registration blocks duplicate email with 409 Conflict
[PASS] 6. Login verifies credentials and returns token + user profile
[PASS] 7. Login rejects invalid password with 401 Unauthorized
[PASS] 8. Private route rejects requests without Bearer token (401)
[PASS] 9. GET /api/auth/me returns authenticated user details
[PASS] 10. Role middleware forbids Freelancer from creating gigs (403 Forbidden)
[PASS] 11. Client creates a gig successfully (201 Created)
[PASS] 12. GET /api/gigs returns gigs matching query filters
[PASS] 13. Input validation rejects invalid fields with 400 Bad Request
[PASS] 14. Route handles malformed MongoDB ObjectId gracefully (400 Bad Request)
[PASS] 15. Client is prevented from bidding on gigs
[PASS] 16. Freelancer submits bid successfully (201 Created)
[PASS] 17. Duplicate bid by same freelancer is rejected with 409 Conflict
[PASS] 18. Client accepts bid and Gig transitions to in_progress
[PASS] 19. Milestone created with pending status and not_funded escrow
[PASS] 20. Escrow funds locked successfully (Simulated Escrow)
[PASS] 21. Freelancer submits work for review
[PASS] 22. Escrow funds released to freelancer on approval
[PASS] 23. GET /api/escrow/status returns verified escrow state
[PASS] 24. REST Chat created/retrieved between Client and Freelancer
[PASS] 25. Message appended to chat via REST API
[PASS] 26. Socket.io connects, joins chat room, and broadcasts new_message event in real-time
[PASS] 27. Dispute raised successfully with open status
[PASS] 28. Dispute updated to resolved with recorded resolution
[PASS] 29. GET /api/portfolio/:freelancerId returns public stats & completed gigs

==================================================
TOTAL TESTS: 29 | PASSED: 29 | FAILED: 0
==================================================
```

---

## Viva & Interview Preparation Guide

Here is a quick cheat sheet for explaining the architecture during a college viva:

1. **Why Express.js?**  
   Express provides a minimalist, unopinionated routing and middleware engine for Node.js. It simplifies parsing HTTP request bodies, managing routing hierarchies, and handling asynchronous errors cleanly.

2. **Why MongoDB and Mongoose?**  
   MongoDB is a document-oriented NoSQL database that stores data as JSON-like documents (BSON). It accommodates flexible, hierarchical structures (such as arrays of messages inside chats or dynamic skills lists). Mongoose acts as the Object Data Modeling (ODM) layer, providing schema enforcement, type validation, middleware hooks, and cross-document population (`ObjectId` references).

3. **What is Middleware?**  
   Functions that execute during the HTTP request-response cycle before reaching the controller. In GigHub:
   - `authMiddleware`: verifies JWT token and attaches `req.user`.
   - `roleMiddleware`: guards endpoints so only authorized roles (`client`, `freelancer`) can perform sensitive operations.
   - `validationMiddleware`: rejects malformed input before touching the database.
   - `errorMiddleware`: standardizes error formats across the entire application.

4. **How does JWT Authentication work?**  
   Stateless authentication. When a user logs in with valid credentials, the server signs a token using a server-side secret (`JWT_SECRET`) containing the payload (`userId`, `role`). The client sends this token in the `Authorization: Bearer <token>` header for subsequent requests. The server verifies the cryptographic signature without querying a session table.

5. **Why bcrypt?**  
   Passwords must never be stored in plain text. `bcryptjs` uses a slow, adaptive hashing algorithm with salt generation (10 rounds in GigHub) to resist brute-force and rainbow table attacks.

6. **How does Socket.io work?**  
   Socket.io upgrades standard HTTP requests to persistent, bi-directional WebSocket connections. It enables low-latency events such as real-time chat messages, typing status, and instant notification pushes without polling.

7. **How does the Escrow Simulation work?**  
   It simulates a trusted third-party financial intermediary. When a milestone is created, it starts as `not_funded`. The client funds the milestone (`funded`), which signals to the freelancer that payment is guaranteed. Once the freelancer submits work and the client approves, the client releases the payment (`released`).

8. **How are MongoDB relationships represented?**  
   Through `mongoose.Schema.Types.ObjectId` with `ref` attributes (e.g., `client: { type: ObjectId, ref: 'User' }`). Mongoose's `.populate()` method performs dynamic server-side lookups to join referenced documents into the query results.

---

## Future Enhancements

- Integration with real payment gateways (Stripe or PayPal Webhooks).
- File upload support for deliverables (AWS S3 or Cloudinary).
- Two-factor authentication (2FA).
- Freelancer review and rating star system after project completion.

---

**Developed for Backend Development — College Final Project**
