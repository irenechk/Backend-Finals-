const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Models
const User = require("../models/User");
const Gig = require("../models/Gig");
const Bid = require("../models/Bid");
const Milestone = require("../models/Milestone");
const Chat = require("../models/Chat");
const Dispute = require("../models/Dispute");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/GigHub";

const seedDatabase = async () => {
    try {
        console.log("==================================================");
        console.log("   GIGHUB DATABASE SEEDING PROCESS");
        console.log("==================================================");
        console.log(`Target MongoDB URI: ${MONGO_URI}`);

        await mongoose.connect(MONGO_URI);
        const dbName = mongoose.connection.name;
        console.log(`Connected successfully to database: [${dbName}]`);

        // Safety verification: Ensure we only touch the GigHub database
        if (dbName.toLowerCase() !== "gighub") {
            throw new Error(`Safety abort: Expected database 'GigHub' but connected to '${dbName}'.`);
        }

        console.log("\n[1/6] Clearing existing development records in GigHub...");
        await Promise.all([
            User.deleteMany({}),
            Gig.deleteMany({}),
            Bid.deleteMany({}),
            Milestone.deleteMany({}),
            Chat.deleteMany({}),
            Dispute.deleteMany({})
        ]);
        console.log("✓ Existing GigHub collections cleared cleanly.");

        console.log("\n[2/6] Hashing default development passwords...");
        const defaultPasswordHash = await bcrypt.hash("password123", 10);

        console.log("\n[3/6] Seeding diverse Clients and Freelancers...");
        const usersData = [
            // Clients
            {
                name: "Alex Vance",
                email: "alex.client@gighub.com",
                password: defaultPasswordHash,
                role: "client",
                bio: "Founder & CEO at NovaTech Labs. Building high-impact fintech and AI solutions.",
                skills: ["Product Strategy", "Fintech", "Agile Management"]
            },
            {
                name: "Sophia Sterling",
                email: "sophia.client@gighub.com",
                password: defaultPasswordHash,
                role: "client",
                bio: "VP of Product at Horizon Health. Dedicated to making digital health accessible and intuitive.",
                skills: ["Product Management", "Digital Health", "UX Research"]
            },
            {
                name: "Marcus Drake",
                email: "marcus.client@gighub.com",
                password: defaultPasswordHash,
                role: "client",
                bio: "Creative Director at Drake & Partners Media. Sourcing elite talent for modern web & mobile experiences.",
                skills: ["Brand Strategy", "Media Production", "Creative Direction"]
            },
            {
                name: "Irene Koner",
                email: "irene@gmail.com",
                password: defaultPasswordHash,
                role: "client",
                bio: "Technology Director commissioning full-stack cloud and real-time collaborative applications.",
                skills: ["Engineering Management", "Full-Stack", "Cloud Architecture"]
            },
            {
                name: "Demo User",
                email: "demo@gighub.com",
                password: defaultPasswordHash,
                role: "client",
                bio: "General client demo account for rapid project testing and review.",
                skills: ["Marketplace Testing"]
            },

            // Freelancers
            {
                name: "Elena Rostova",
                email: "elena.ai@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Senior AI & Machine Learning Engineer",
                category: "Data & AI",
                experience: "6+ years",
                location: "Berlin, Germany (Remote)",
                hourlyRate: 95,
                rating: 4.98,
                reviewsCount: 24,
                completedProjects: 18,
                bio: "Specialist in generative AI, PyTorch, LLM fine-tuning, RAG pipelines, and high-throughput model inference. Built production systems for European fintech and healthcare unicorns.",
                skills: ["Python", "PyTorch", "TensorFlow", "LLMs", "LangChain", "FastAPI", "Docker", "AWS"]
            },
            {
                name: "Liam Chen",
                email: "liam.dev@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Lead Full-Stack React & Node Architect",
                category: "Development & IT",
                experience: "7+ years",
                location: "Vancouver, Canada (Remote)",
                hourlyRate: 85,
                rating: 4.95,
                reviewsCount: 32,
                completedProjects: 26,
                bio: "Full-stack software architect specializing in scalable microservices, Next.js, Node.js, and real-time distributed backends with MongoDB and WebSockets.",
                skills: ["React", "Node.js", "TypeScript", "Next.js", "Express", "MongoDB", "GraphQL", "Tailwind CSS", "Socket.io"]
            },
            {
                name: "Maya Patel",
                email: "maya.design@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Principal UI/UX & Design Systems Lead",
                category: "Design & Creative",
                experience: "5+ years",
                location: "London, UK (Remote)",
                hourlyRate: 75,
                rating: 4.92,
                reviewsCount: 19,
                completedProjects: 21,
                bio: "Senior product designer crafting conversion-focused, accessible SaaS interfaces and comprehensive Figma design systems from zero to launch.",
                skills: ["Figma", "UI/UX Design", "Design Systems", "User Research", "Wireframing", "Prototyping", "Design Tokens"]
            },
            {
                name: "Lucas Morales",
                email: "lucas.mobile@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Senior iOS & React Native Engineer",
                category: "Development & IT",
                experience: "5+ years",
                location: "Austin, TX (Remote)",
                hourlyRate: 80,
                rating: 4.90,
                reviewsCount: 15,
                completedProjects: 14,
                bio: "Mobile specialist building buttery-smooth cross-platform apps with React Native, Swift, offline-first sync, and push notification infrastructure.",
                skills: ["React Native", "Swift", "iOS", "Android", "TypeScript", "Redux", "Firebase", "REST APIs"]
            },
            {
                name: "Sarah Jenkins",
                email: "sarah.writer@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Technical Documentation & API Content Lead",
                category: "Writing & Translation",
                experience: "4+ years",
                location: "Dublin, Ireland (Remote)",
                hourlyRate: 55,
                rating: 4.88,
                reviewsCount: 12,
                completedProjects: 17,
                bio: "Technical writer and product storyteller. Translating complex software, SDKs, and developer architectures into crisp documentation and guides.",
                skills: ["Technical Writing", "API Documentation", "Developer Guides", "Markdown", "SEO", "OpenAPI", "Git"]
            },
            {
                name: "David Kim",
                email: "david.devops@gighub.com",
                password: defaultPasswordHash,
                role: "freelancer",
                title: "Cloud DevOps & Site Reliability Engineer",
                category: "Development & IT",
                experience: "6+ years",
                location: "Seattle, WA (Remote)",
                hourlyRate: 90,
                rating: 4.94,
                reviewsCount: 22,
                completedProjects: 20,
                bio: "DevOps and cloud infrastructure engineer focusing on Kubernetes, automated GitOps CI/CD pipelines, Terraform IaC, and observability on AWS.",
                skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "GitHub Actions", "Prometheus", "Linux"]
            }
        ];

        const createdUsers = await User.insertMany(usersData);
        console.log(`✓ Inserted ${createdUsers.length} users with hashed credentials.`);

        // Map helper
        const userMap = {};
        createdUsers.forEach((u) => {
            userMap[u.email] = u;
        });

        console.log("\n[4/6] Seeding diverse real-world Gigs...");
        const now = new Date();
        const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const gigsData = [
            {
                title: "Enterprise AI Knowledge Assistant & Search",
                description: "Looking for an experienced AI engineer to design and implement an internal knowledge search assistant using RAG (Retrieval-Augmented Generation), vector databases, and secure LLM inference APIs.",
                budget: 4500,
                category: "Data & AI",
                skills: ["Python", "PyTorch", "LLMs", "FastAPI", "MongoDB"],
                client: userMap["alex.client@gighub.com"]._id,
                status: "in_progress",
                deadline: futureDate(30)
            },
            {
                title: "Telehealth Patient Portal UI/UX Redesign",
                description: "Comprehensive end-to-end redesign of our patient scheduling, video consultation flow, and digital prescription review screens. Deliverables include a complete Figma design system and interactive prototype.",
                budget: 2800,
                category: "Design & Creative",
                skills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping"],
                client: userMap["sophia.client@gighub.com"]._id,
                status: "in_progress",
                deadline: futureDate(20)
            },
            {
                title: "High-Performance E-Commerce Microservices Backend",
                description: "Architect and develop modular, event-driven Node.js and TypeScript microservices for catalog management, shopping cart persistence, and order processing with MongoDB.",
                budget: 5200,
                category: "Development & IT",
                skills: ["Node.js", "Express", "TypeScript", "MongoDB", "Docker"],
                client: userMap["alex.client@gighub.com"]._id,
                status: "open",
                deadline: futureDate(45)
            },
            {
                title: "Cross-Platform Fitness Tracking Mobile App",
                description: "Build an MVP cross-platform mobile application using React Native. Features include workout logging, streak tracker, audio cues, and offline data sync.",
                budget: 3600,
                category: "Development & IT",
                skills: ["React Native", "TypeScript", "Firebase", "Redux"],
                client: userMap["marcus.client@gighub.com"]._id,
                status: "open",
                deadline: futureDate(35)
            },
            {
                title: "Interactive Developer API Documentation & SDK Guides",
                description: "Write clear, thorough developer-facing documentation for our public REST API. Includes quickstart tutorials, code samples in cURL and Node.js, and interactive Swagger/OpenAPI specifications.",
                budget: 1400,
                category: "Writing & Translation",
                skills: ["Technical Writing", "API Documentation", "Markdown", "Developer Guides"],
                client: userMap["sophia.client@gighub.com"]._id,
                status: "open",
                deadline: futureDate(15)
            },
            {
                title: "Real-Time Collaborative Whiteboard & Chat Engine",
                description: "Full-stack project to implement collaborative canvas state synchronization, cursor sharing, and live text chat using Express, Socket.io, and React frontend.",
                budget: 3000,
                category: "Development & IT",
                skills: ["React", "Node.js", "Socket.io", "Express", "MongoDB"],
                client: userMap["irene@gmail.com"]._id,
                status: "completed",
                deadline: pastDate(5)
            }
        ];

        const createdGigs = await Gig.insertMany(gigsData);
        console.log(`✓ Inserted ${createdGigs.length} gigs across diverse domains.`);

        const gigMap = {};
        createdGigs.forEach((g) => {
            gigMap[g.title] = g;
        });

        console.log("\n[5/6] Seeding connected Bids & Milestones...");
        const bidsData = [
            {
                gig: gigMap["Enterprise AI Knowledge Assistant & Search"]._id,
                freelancer: userMap["elena.ai@gighub.com"]._id,
                amount: 4200,
                deliveryTime: 25,
                proposal: "I have built multiple production RAG and semantic vector search pipelines. I can deliver a clean FastAPI service with full embedding indexing, reranking, and secure role-based document access.",
                status: "accepted"
            },
            {
                gig: gigMap["Telehealth Patient Portal UI/UX Redesign"]._id,
                freelancer: userMap["maya.design@gighub.com"]._id,
                amount: 2700,
                deliveryTime: 18,
                proposal: "I specialize in healthcare SaaS interfaces where clarity, HIPAA compliance cues, and accessible typography are essential. Looking forward to structuring the Figma component library.",
                status: "accepted"
            },
            {
                gig: gigMap["High-Performance E-Commerce Microservices Backend"]._id,
                freelancer: userMap["liam.dev@gighub.com"]._id,
                amount: 4900,
                deliveryTime: 35,
                proposal: "Full-stack architect with extensive experience in scalable Node.js/MongoDB architectures. Can structure clean service boundaries with automated Docker setups.",
                status: "pending"
            },
            {
                gig: gigMap["High-Performance E-Commerce Microservices Backend"]._id,
                freelancer: userMap["david.devops@gighub.com"]._id,
                amount: 5100,
                deliveryTime: 40,
                proposal: "Can deliver both the backend services and production-grade Kubernetes manifests with CI/CD deployment pipelines on AWS.",
                status: "pending"
            },
            {
                gig: gigMap["Cross-Platform Fitness Tracking Mobile App"]._id,
                freelancer: userMap["lucas.mobile@gighub.com"]._id,
                amount: 3500,
                deliveryTime: 30,
                proposal: "I have published 8+ production React Native apps on both App Store and Google Play. I will build an offline-first SQLite/Redux cache architecture.",
                status: "pending"
            },
            {
                gig: gigMap["Interactive Developer API Documentation & SDK Guides"]._id,
                freelancer: userMap["sarah.writer@gighub.com"]._id,
                amount: 1350,
                deliveryTime: 12,
                proposal: "I love making APIs enjoyable to use. I will deliver comprehensive documentation with interactive code snippets and clear edge-case explanations.",
                status: "pending"
            },
            {
                gig: gigMap["Real-Time Collaborative Whiteboard & Chat Engine"]._id,
                freelancer: userMap["liam.dev@gighub.com"]._id,
                amount: 2900,
                deliveryTime: 20,
                proposal: "Implemented multi-tenant WebSocket engines and operational transform sync. Excited to build this project with Socket.io rooms.",
                status: "accepted"
            }
        ];

        const createdBids = await Bid.insertMany(bidsData);
        console.log(`✓ Inserted ${createdBids.length} bids with realistic proposals.`);

        const milestonesData = [
            // Gig 1 Milestones (AI)
            {
                gig: gigMap["Enterprise AI Knowledge Assistant & Search"]._id,
                client: userMap["alex.client@gighub.com"]._id,
                freelancer: userMap["elena.ai@gighub.com"]._id,
                title: "Milestone 1 — Vector Database & Embeddings Pipeline",
                description: "Setup vector store, document chunking algorithm, and embedding generation workers.",
                amount: 2000,
                status: "completed",
                escrowStatus: "released",
                submissionNotes: "Vector pipeline deployed and tested with 5,000 PDF documents with 98% accuracy."
            },
            {
                gig: gigMap["Enterprise AI Knowledge Assistant & Search"]._id,
                client: userMap["alex.client@gighub.com"]._id,
                freelancer: userMap["elena.ai@gighub.com"]._id,
                title: "Milestone 2 — Query Reranking & FastAPI Inference Server",
                description: "REST endpoints with streaming token responses, authentication, and conversation history buffer.",
                amount: 2200,
                status: "in_progress",
                escrowStatus: "funded"
            },

            // Gig 2 Milestones (Design)
            {
                gig: gigMap["Telehealth Patient Portal UI/UX Redesign"]._id,
                client: userMap["sophia.client@gighub.com"]._id,
                freelancer: userMap["maya.design@gighub.com"]._id,
                title: "Milestone 1 — Patient Flow Wireframes & UX Architecture",
                description: "Low-fidelity wireframes for scheduling, intake form, and video consultation interface.",
                amount: 1300,
                status: "completed",
                escrowStatus: "released",
                submissionNotes: "Delivered interactive wireframes and reviewed usability findings with product team."
            },
            {
                gig: gigMap["Telehealth Patient Portal UI/UX Redesign"]._id,
                client: userMap["sophia.client@gighub.com"]._id,
                freelancer: userMap["maya.design@gighub.com"]._id,
                title: "Milestone 2 — High-Fidelity UI & Figma Component System",
                description: "Complete design library with color tokens, typography scale, responsive desktop/mobile variants.",
                amount: 1400,
                status: "in_progress",
                escrowStatus: "funded"
            },

            // Gig 6 Milestones (Completed Project for Irene)
            {
                gig: gigMap["Real-Time Collaborative Whiteboard & Chat Engine"]._id,
                client: userMap["irene@gmail.com"]._id,
                freelancer: userMap["liam.dev@gighub.com"]._id,
                title: "Milestone 1 — Socket.io Room State Manager & Protocol",
                description: "Backend room multiplexer, heartbeat monitoring, and message serialization.",
                amount: 1500,
                status: "completed",
                escrowStatus: "released",
                submissionNotes: "Core socket handlers completed and stress tested up to 1,000 concurrent room participants."
            },
            {
                gig: gigMap["Real-Time Collaborative Whiteboard & Chat Engine"]._id,
                client: userMap["irene@gmail.com"]._id,
                freelancer: userMap["liam.dev@gighub.com"]._id,
                title: "Milestone 2 — Frontend Integration, Canvas Sync & Final Delivery",
                description: "Integrated React canvas layer with undo/redo history and multi-user presence indicators.",
                amount: 1400,
                status: "completed",
                escrowStatus: "released",
                submissionNotes: "Final application delivered, tested, and approved."
            }
        ];

        const createdMilestones = await Milestone.insertMany(milestonesData);
        console.log(`✓ Inserted ${createdMilestones.length} milestones with verified escrow states.`);

        console.log("\n[6/6] Seeding Chats & Disputes...");
        const chatsData = [
            {
                gig: gigMap["Enterprise AI Knowledge Assistant & Search"]._id,
                participants: [userMap["alex.client@gighub.com"]._id, userMap["elena.ai@gighub.com"]._id],
                messages: [
                    {
                        sender: userMap["alex.client@gighub.com"]._id,
                        content: "Hi Elena! Excited to start Milestone 1. What embedding models do you recommend?",
                        timestamp: pastDate(10)
                    },
                    {
                        sender: userMap["elena.ai@gighub.com"]._id,
                        content: "Hi Alex! I recommend combining BGE-large with a cross-encoder reranker for best retrieval precision.",
                        timestamp: pastDate(9)
                    },
                    {
                        sender: userMap["alex.client@gighub.com"]._id,
                        content: "Sounds great! Milestone 1 escrow deposit is confirmed. Let's build.",
                        timestamp: pastDate(8)
                    }
                ],
                lastMessage: {
                    content: "Sounds great! Milestone 1 escrow deposit is confirmed. Let's build.",
                    sender: userMap["alex.client@gighub.com"]._id,
                    timestamp: pastDate(8)
                }
            },
            {
                gig: gigMap["Telehealth Patient Portal UI/UX Redesign"]._id,
                participants: [userMap["sophia.client@gighub.com"]._id, userMap["maya.design@gighub.com"]._id],
                messages: [
                    {
                        sender: userMap["sophia.client@gighub.com"]._id,
                        content: "Maya, the wireframes look incredible. The appointment booking flow is so clean.",
                        timestamp: pastDate(6)
                    },
                    {
                        sender: userMap["maya.design@gighub.com"]._id,
                        content: "Thank you Sophia! Working on the high-fidelity component system now.",
                        timestamp: pastDate(4)
                    }
                ],
                lastMessage: {
                    content: "Thank you Sophia! Working on the high-fidelity component system now.",
                    sender: userMap["maya.design@gighub.com"]._id,
                    timestamp: pastDate(4)
                }
            },
            {
                gig: gigMap["Real-Time Collaborative Whiteboard & Chat Engine"]._id,
                participants: [userMap["irene@gmail.com"]._id, userMap["liam.dev@gighub.com"]._id],
                messages: [
                    {
                        sender: userMap["irene@gmail.com"]._id,
                        content: "Liam, the whiteboard synchronization works smoothly on desktop and mobile!",
                        timestamp: pastDate(3)
                    },
                    {
                        sender: userMap["liam.dev@gighub.com"]._id,
                        content: "Glad to hear! All milestone deliverables have been finalized and pushed to the repo.",
                        timestamp: pastDate(2)
                    },
                    {
                        sender: userMap["irene@gmail.com"]._id,
                        content: "Approved and released the final escrow funds. Thank you for the excellent work!",
                        timestamp: pastDate(1)
                    }
                ],
                lastMessage: {
                    content: "Approved and released the final escrow funds. Thank you for the excellent work!",
                    sender: userMap["irene@gmail.com"]._id,
                    timestamp: pastDate(1)
                }
            }
        ];

        const createdChats = await Chat.insertMany(chatsData);
        console.log(`✓ Inserted ${createdChats.length} real-time conversation threads.`);

        const disputesData = [
            {
                gig: gigMap["Enterprise AI Knowledge Assistant & Search"]._id,
                raisedBy: userMap["alex.client@gighub.com"]._id,
                against: userMap["elena.ai@gighub.com"]._id,
                reason: "Timeline adjustment for custom connector",
                description: "Client requested an additional custom Confluence document connector not in original brief. Parties agreed to add 5 days to deadline.",
                status: "resolved",
                resolution: "Amicably resolved: Timeline adjusted by 5 business days without milestone penalty.",
                resolvedBy: userMap["alex.client@gighub.com"]._id
            }
        ];

        const createdDisputes = await Dispute.insertMany(disputesData);
        console.log(`✓ Inserted ${createdDisputes.length} realistic dispute record.`);

        console.log("\n==================================================");
        console.log("   GIGHUB DATABASE SEEDING COMPLETED SUCCESSFULLY!");
        console.log("==================================================");

        // Verification of final counts
        const finalCounts = {
            users: await User.countDocuments(),
            gigs: await Gig.countDocuments(),
            bids: await Bid.countDocuments(),
            milestones: await Milestone.countDocuments(),
            chats: await Chat.countDocuments(),
            disputes: await Dispute.countDocuments()
        };

        console.log("\nFinal MongoDB Collection Counts:");
        console.table(finalCounts);

        await mongoose.disconnect();
        console.log("Database connection closed gracefully.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Seeding failed with error:", error);
        process.exit(1);
    }
};

seedDatabase();
