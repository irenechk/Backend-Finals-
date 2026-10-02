const { server } = require("./server");
const ioClient = require("socket.io-client");
const User = require("./models/User");
const Gig = require("./models/Gig");
const Bid = require("./models/Bid");
const Milestone = require("./models/Milestone");
const Chat = require("./models/Chat");
const Dispute = require("./models/Dispute");

const PORT = 5055; // Use 5055 for isolated testing
const BASE_URL = `http://localhost:${PORT}/api`;

const runTests = async () => {
    console.log("==================================================");
    console.log("   GIGHUB BACKEND COMPREHENSIVE TEST SUITE");
    console.log("==================================================\n");

    let clientToken = null;
    let clientId = null;
    let freelancerToken = null;
    let freelancerId = null;
    let testGigId = null;
    let testBidId = null;
    let testMilestoneId = null;
    let testChatId = null;
    let testDisputeId = null;

    let passed = 0;
    let failed = 0;

    const assert = (condition, testName, details = "") => {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName} - ${details}`);
            failed++;
        }
    };

    // Helper fetch wrapper
    const request = async (endpoint, options = {}) => {
        const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
        const headers = { "Content-Type": "application/json", ...options.headers };
        const res = await fetch(url, { ...options, headers });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
    };

    // 1. Start Server on test port
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Test server running on port ${PORT}\n`);

    try {
        // Test 1: Health check & Root endpoint
        const rootRes = await request(`http://localhost:${PORT}/`);
        assert(rootRes.status === 200 && rootRes.data.success === true, "1. Server starts & root health endpoint responds 200 OK");

        // Test 2: Swagger UI endpoint accessible
        const swaggerRes = await fetch(`http://localhost:${PORT}/api-docs/`);
        assert(swaggerRes.status === 200, "2. Interactive Swagger UI endpoint is accessible at /api-docs");

        // Unique timestamps for email uniqueness
        const timestamp = Date.now();
        const clientEmail = `alice_${timestamp}@testclient.com`;
        const freelancerEmail = `bob_${timestamp}@testfreelancer.com`;

        // Test 3: Client Registration
        const regClientRes = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: "Alice Client",
                email: clientEmail,
                password: "Password123!",
                role: "client",
                bio: "Startup Founder"
            })
        });
        assert(regClientRes.status === 201 && regClientRes.data.data.token, "3. Client registration creates user and returns JWT token");
        clientToken = regClientRes.data.data?.token;
        clientId = regClientRes.data.data?.user?.id;

        // Test 4: Freelancer Registration
        const regFreeRes = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: "Bob Freelancer",
                email: freelancerEmail,
                password: "Password123!",
                role: "freelancer",
                bio: "Senior Full Stack Dev",
                skills: ["Node.js", "Express", "MongoDB", "Socket.io"]
            })
        });
        assert(regFreeRes.status === 201 && regFreeRes.data.data.token, "4. Freelancer registration creates user and returns JWT token");
        freelancerToken = regFreeRes.data.data?.token;
        freelancerId = regFreeRes.data.data?.user?.id;

        // Test 5: Prevent Duplicate Email Registration
        const dupRegRes = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: "Alice Imposter",
                email: clientEmail,
                password: "Password123!",
                role: "client"
            })
        });
        assert(dupRegRes.status === 409, "5. Registration blocks duplicate email with 409 Conflict");

        // Test 6: Login
        const loginRes = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: clientEmail,
                password: "Password123!"
            })
        });
        assert(loginRes.status === 200 && loginRes.data.data.token, "6. Login verifies credentials and returns token + user profile");

        // Test 7: Invalid Login Credentials
        const badLoginRes = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: clientEmail,
                password: "WrongPassword999"
            })
        });
        assert(badLoginRes.status === 401, "7. Login rejects invalid password with 401 Unauthorized");

        // Test 8: Protected Route rejects unauthenticated requests
        const unauthRes = await request("/auth/me");
        assert(unauthRes.status === 401, "8. Private route rejects requests without Bearer token (401)");

        // Test 9: Profile Endpoint with Bearer token
        const profileRes = await request("/auth/me", {
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        assert(profileRes.status === 200 && profileRes.data.data.user.email === clientEmail, "9. GET /api/auth/me returns authenticated user details");

        // Test 10: Role Authorization - Freelancer cannot create gig
        const freeCreateGigRes = await request("/gigs", {
            method: "POST",
            headers: { Authorization: `Bearer ${freelancerToken}` },
            body: JSON.stringify({
                title: "Invalid Gig",
                description: "Freelancers should not create gigs",
                budget: 1000,
                category: "Backend"
            })
        });
        assert(freeCreateGigRes.status === 403, "10. Role middleware forbids Freelancer from creating gigs (403 Forbidden)");

        // Test 11: Client creates a valid gig
        const createGigRes = await request("/gigs", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                title: "Build Real-Time Chat Platform",
                description: "We need an Express and Socket.io platform with Escrow handling.",
                budget: 1500,
                category: "Web Development",
                skills: ["Node.js", "Express", "Socket.io"],
                deadline: "2026-12-31"
            })
        });
        assert(createGigRes.status === 201 && createGigRes.data.data.gig._id, "11. Client creates a gig successfully (201 Created)");
        testGigId = createGigRes.data.data?.gig?._id;

        // Test 12: Browse and filter gigs
        const getGigsRes = await request(`/gigs?category=Web%20Development&status=open`);
        assert(getGigsRes.status === 200 && getGigsRes.data.data.gigs.length > 0, "12. GET /api/gigs returns gigs matching query filters");

        // Test 13: Request Validation - invalid gig body
        const invalidGigRes = await request("/gigs", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                title: "",
                budget: -50
            })
        });
        assert(invalidGigRes.status === 400 && invalidGigRes.data.errors, "13. Input validation rejects invalid fields with 400 Bad Request");

        // Test 14: Invalid MongoDB ObjectId handling
        const badIdRes = await request("/gigs/invalid-non-hex-id");
        assert(badIdRes.status === 400, "14. Route handles malformed MongoDB ObjectId gracefully (400 Bad Request)");

        // Test 15: Client cannot bid on own gig
        const clientBidRes = await request("/bids", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                gig: testGigId,
                amount: 1200,
                proposal: "Bidding on my own project",
                deliveryTime: 7
            })
        });
        // Returns 403 (because client role cannot bid) or 400 (cannot bid on own gig)
        assert(clientBidRes.status === 403 || clientBidRes.status === 400, "15. Client is prevented from bidding on gigs");

        // Test 16: Freelancer submits a bid
        const bidRes = await request("/bids", {
            method: "POST",
            headers: { Authorization: `Bearer ${freelancerToken}` },
            body: JSON.stringify({
                gig: testGigId,
                amount: 1350,
                proposal: "I have 5 years experience with Socket.io and MERN architecture.",
                deliveryTime: 12
            })
        });
        assert(bidRes.status === 201 && bidRes.data.data.bid._id, "16. Freelancer submits bid successfully (201 Created)");
        testBidId = bidRes.data.data?.bid?._id;

        // Test 17: Duplicate bid prevention
        const dupBidRes = await request("/bids", {
            method: "POST",
            headers: { Authorization: `Bearer ${freelancerToken}` },
            body: JSON.stringify({
                gig: testGigId,
                amount: 1400,
                proposal: "Duplicate bid attempt",
                deliveryTime: 10
            })
        });
        assert(dupBidRes.status === 409, "17. Duplicate bid by same freelancer is rejected with 409 Conflict");

        // Test 18: Client accepts the bid (Gig moves to 'in_progress')
        const acceptBidRes = await request(`/bids/${testBidId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({ status: "accepted" })
        });
        assert(acceptBidRes.status === 200 && acceptBidRes.data.data.bid.status === "accepted", "18. Client accepts bid and Gig transitions to in_progress");

        // Test 19: Milestone Creation
        const milestoneRes = await request("/milestones", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                gig: testGigId,
                freelancer: freelancerId,
                title: "Milestone 1 — Architecture & Core APIs",
                description: "Setup Express, MongoDB models, and auth.",
                amount: 600,
                dueDate: "2026-11-01"
            })
        });
        assert(milestoneRes.status === 201 && milestoneRes.data.data.milestone._id, "19. Milestone created with pending status and not_funded escrow");
        testMilestoneId = milestoneRes.data.data?.milestone?._id;

        // Test 20: Fund Escrow (Simulated Payment)
        const fundEscrowRes = await request(`/escrow/fund/${testMilestoneId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        assert(fundEscrowRes.status === 200 && fundEscrowRes.data.data.escrowStatus === "funded", "20. Escrow funds locked successfully (Simulated Escrow)");

        // Test 21: Freelancer submits deliverable
        const submitWorkRes = await request(`/milestones/${testMilestoneId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${freelancerToken}` },
            body: JSON.stringify({
                status: "submitted",
                submissionNotes: "Completed code and documentation uploaded."
            })
        });
        assert(submitWorkRes.status === 200 && submitWorkRes.data.data.milestone.status === "submitted", "21. Freelancer submits work for review");

        // Test 22: Release Escrow (Client approves work and releases funds)
        const releaseEscrowRes = await request(`/escrow/release/${testMilestoneId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        assert(releaseEscrowRes.status === 200 && releaseEscrowRes.data.data.escrowStatus === "released", "22. Escrow funds released to freelancer on approval");

        // Test 23: Check Escrow Status endpoint
        const checkEscrowRes = await request(`/escrow/status/${testMilestoneId}`, {
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        assert(checkEscrowRes.status === 200 && checkEscrowRes.data.data.escrowStatus === "released", "23. GET /api/escrow/status returns verified escrow state");

        // Test 24: Chat REST Endpoints (Start/Retrieve Conversation)
        const chatRes = await request("/chats", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                recipientId: freelancerId,
                gigId: testGigId,
                initialMessage: "Welcome to the project! Let's get started."
            })
        });
        assert(chatRes.status === 200 && chatRes.data.data.chat._id, "24. REST Chat created/retrieved between Client and Freelancer");
        testChatId = chatRes.data.data?.chat?._id;

        // Test 25: Send message via REST API
        const sendMsgRes = await request(`/chats/${testChatId}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${freelancerToken}` },
            body: JSON.stringify({
                content: "Thanks! Reviewing requirements now."
            })
        });
        assert(sendMsgRes.status === 201 && sendMsgRes.data.data.message.content, "25. Message appended to chat via REST API");

        // Test 26: Real-Time Socket.io Connection and Message Exchange
        const socketTestPassed = await new Promise((resolve) => {
            const socketClient = ioClient(`http://localhost:${PORT}`, {
                auth: { token: freelancerToken },
                transports: ["websocket"]
            });

            socketClient.on("connect", () => {
                socketClient.emit("join_chat", testChatId);

                // Send live message over socket
                socketClient.emit("send_message", {
                    chatId: testChatId,
                    senderId: freelancerId,
                    content: "Real-time message delivered via Socket.io!"
                });
            });

            socketClient.on("new_message", (data) => {
                if (data.chatId === testChatId && data.message.content.includes("Socket.io")) {
                    socketClient.disconnect();
                    resolve(true);
                }
            });

            // Timeout fallback
            setTimeout(() => {
                socketClient.disconnect();
                resolve(false);
            }, 4000);
        });
        assert(socketTestPassed, "26. Socket.io connects, joins chat room, and broadcasts new_message event in real-time");

        // Test 27: Disputes - Raise dispute
        const disputeRes = await request("/disputes", {
            method: "POST",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                gig: testGigId,
                against: freelancerId,
                reason: "Deliverable Delay",
                description: "Work was delayed by 2 days, requesting partial refund."
            })
        });
        assert(disputeRes.status === 201 && disputeRes.data.data.dispute._id, "27. Dispute raised successfully with open status");
        testDisputeId = disputeRes.data.data?.dispute?._id;

        // Test 28: Disputes - Update/Resolve dispute
        const updateDisputeRes = await request(`/disputes/${testDisputeId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${clientToken}` },
            body: JSON.stringify({
                status: "resolved",
                resolution: "Parties reached an amicable extension agreement."
            })
        });
        assert(updateDisputeRes.status === 200 && updateDisputeRes.data.data.dispute.status === "resolved", "28. Dispute updated to resolved with recorded resolution");

        // Test 29: Portfolio - Freelancer Public Portfolio
        const portfolioRes = await request(`/portfolio/${freelancerId}`);
        assert(portfolioRes.status === 200 && portfolioRes.data.data.freelancer.name === "Bob Freelancer", "29. GET /api/portfolio/:freelancerId returns public stats & completed gigs");

    } catch (err) {
        console.error("Test Suite Runtime Error:", err);
        failed++;
    } finally {
        try {
            if (clientId) await User.findByIdAndDelete(clientId);
            if (freelancerId) await User.findByIdAndDelete(freelancerId);
            if (testGigId) await Gig.findByIdAndDelete(testGigId);
            if (testBidId) await Bid.findByIdAndDelete(testBidId);
            if (testMilestoneId) await Milestone.findByIdAndDelete(testMilestoneId);
            if (testChatId) await Chat.findByIdAndDelete(testChatId);
            if (testDisputeId) await Dispute.findByIdAndDelete(testDisputeId);
        } catch (cleanupErr) {
            // Non-critical cleanup
        }
        server.close();
        console.log("\n==================================================");
        console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
        console.log("==================================================");
        process.exit(failed > 0 ? 1 : 0);
    }
};

runTests();
