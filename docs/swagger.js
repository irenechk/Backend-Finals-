/**
 * Swagger / OpenAPI 3.0 Specification for GigHub Freelance Marketplace Backend
 */
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "GigHub API — Freelance Marketplace Backend",
    version: "1.0.0",
    description: "Complete RESTful API and WebSocket backend for Case Study 27 (GigHub Freelance Marketplace). Features JWT Authentication, Role-based Access Control, Gig Postings, Bidding, Milestones, Simulated Escrow, Real-time Chat via Socket.io, Disputes, and Firebase Cloud Messaging integration.",
    contact: {
      name: "GigHub Engineering",
      email: "support@gighub.local"
    }
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>"
      }
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          error: { type: "string", example: "Description of the error" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d1e" },
          name: { type: "string", example: "Alice Johnson" },
          email: { type: "string", format: "email", example: "alice@client.com" },
          role: { type: "string", enum: ["client", "freelancer", "admin"], example: "client" },
          bio: { type: "string", example: "Tech entrepreneur and startup founder" },
          skills: { type: "array", items: { type: "string" }, example: ["React", "Node.js"] }
        }
      },
      Gig: {
        type: "object",
        properties: {
          _id: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d2a" },
          title: { type: "string", example: "Build a Full-Stack MERN Dashboard" },
          description: { type: "string", example: "Looking for an experienced developer to create an analytics dashboard with chart visualization." },
          budget: { type: "number", example: 1200 },
          category: { type: "string", example: "Web Development" },
          skills: { type: "array", items: { type: "string" }, example: ["MongoDB", "Express", "React", "Node.js"] },
          status: { type: "string", enum: ["open", "in_progress", "completed", "cancelled"], example: "open" },
          client: { $ref: "#/components/schemas/User" },
          deadline: { type: "string", format: "date-time" }
        }
      },
      Bid: {
        type: "object",
        properties: {
          _id: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d3b" },
          gig: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d2a" },
          freelancer: { $ref: "#/components/schemas/User" },
          amount: { type: "number", example: 1100 },
          proposal: { type: "string", example: "I have 4 years of experience building scalable dashboards with MERN stack." },
          deliveryTime: { type: "number", example: 14, description: "Delivery time in days" },
          status: { type: "string", enum: ["pending", "accepted", "rejected", "withdrawn"], example: "pending" }
        }
      },
      Milestone: {
        type: "object",
        properties: {
          _id: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d4c" },
          gig: { type: "string" },
          client: { type: "string" },
          freelancer: { type: "string" },
          title: { type: "string", example: "Backend APIs & Database Schema" },
          description: { type: "string", example: "Setup Express server, Mongoose models, and auth routes." },
          amount: { type: "number", example: 500 },
          status: { type: "string", enum: ["pending", "in_progress", "submitted", "approved", "completed", "disputed"], example: "pending" },
          escrowStatus: { type: "string", enum: ["not_funded", "funded", "released", "refunded"], example: "not_funded" }
        }
      },
      Chat: {
        type: "object",
        properties: {
          _id: { type: "string" },
          gig: { type: "string" },
          participants: { type: "array", items: { $ref: "#/components/schemas/User" } },
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sender: { type: "string" },
                content: { type: "string" },
                timestamp: { type: "string", format: "date-time" }
              }
            }
          }
        }
      },
      Dispute: {
        type: "object",
        properties: {
          _id: { type: "string" },
          gig: { type: "string" },
          raisedBy: { type: "string" },
          against: { type: "string" },
          reason: { type: "string", example: "Deadline missed without communication" },
          description: { type: "string", example: "Freelancer stopped responding for 5 days past milestone deadline." },
          status: { type: "string", enum: ["open", "under_review", "resolved", "rejected"], example: "open" },
          resolution: { type: "string" }
        }
      }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user (Client or Freelancer)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Bob Smith" },
                  email: { type: "string", format: "email", example: "bob@freelance.local" },
                  password: { type: "string", minLength: 6, example: "Password123!" },
                  role: { type: "string", enum: ["client", "freelancer"], example: "freelancer" },
                  bio: { type: "string", example: "Full-Stack Node.js and React Developer" },
                  skills: { type: "array", items: { type: "string" }, example: ["Node.js", "Express", "MongoDB"] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already registered" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login and obtain JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "bob@freelance.local" },
                  password: { type: "string", example: "Password123!" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful with token" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Current user profile" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/gigs": {
      get: {
        tags: ["Gigs"],
        summary: "Browse and filter gigs",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "minBudget", in: "query", schema: { type: "number" } },
          { name: "maxBudget", in: "query", schema: { type: "number" } }
        ],
        responses: { 200: { description: "List of gigs" } }
      },
      post: {
        tags: ["Gigs"],
        summary: "Create a new gig (Client role only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "budget", "category"],
                properties: {
                  title: { type: "string", example: "Build E-Commerce Backend" },
                  description: { type: "string", example: "Need a robust Node.js backend with cart and orders." },
                  budget: { type: "number", example: 1500 },
                  category: { type: "string", example: "Backend" },
                  skills: { type: "array", items: { type: "string" }, example: ["Express", "MongoDB"] },
                  deadline: { type: "string", format: "date-time" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Gig created" },
          403: { description: "Forbidden - Client role required" }
        }
      }
    },
    "/api/gigs/{id}": {
      get: {
        tags: ["Gigs"],
        summary: "Get gig details by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Gig details" }, 404: { description: "Not found" } }
      },
      put: {
        tags: ["Gigs"],
        summary: "Update gig (Gig owner or Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Gig updated" }, 403: { description: "Forbidden" } }
      },
      delete: {
        tags: ["Gigs"],
        summary: "Delete gig (Gig owner or Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Gig deleted" }, 403: { description: "Forbidden" } }
      }
    },
    "/api/bids": {
      post: {
        tags: ["Bids"],
        summary: "Submit a bid on a gig (Freelancer role only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["gig", "amount", "proposal", "deliveryTime"],
                properties: {
                  gig: { type: "string", example: "651a2b3c4d5e6f7a8b9c0d2a" },
                  amount: { type: "number", example: 1200 },
                  proposal: { type: "string", example: "I have built similar platforms and can deliver within schedule." },
                  deliveryTime: { type: "number", example: 10 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Bid submitted" },
          400: { description: "Cannot bid on own gig or gig closed" },
          409: { description: "Duplicate bid from freelancer" }
        }
      },
      get: {
        tags: ["Bids"],
        summary: "Get bids (filtered by gig or current user)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "gig", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "List of bids" } }
      }
    },
    "/api/bids/{id}": {
      get: {
        tags: ["Bids"],
        summary: "Get bid by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Bid details" } }
      },
      put: {
        tags: ["Bids"],
        summary: "Accept/Reject bid (Client) or Edit/Withdraw bid (Freelancer)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["accepted", "rejected", "withdrawn"] },
                  amount: { type: "number" },
                  proposal: { type: "string" },
                  deliveryTime: { type: "number" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Bid status updated" } }
      }
    },
    "/api/milestones": {
      post: {
        tags: ["Milestones"],
        summary: "Create a milestone for an assigned project (Client only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["gig", "freelancer", "title", "amount"],
                properties: {
                  gig: { type: "string" },
                  freelancer: { type: "string" },
                  title: { type: "string", example: "Milestone 1 - API Implementation" },
                  description: { type: "string" },
                  amount: { type: "number", example: 400 },
                  dueDate: { type: "string", format: "date-time" }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Milestone created" } }
      },
      get: {
        tags: ["Milestones"],
        summary: "Get milestones for user's projects",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "gig", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "List of milestones" } }
      }
    },
    "/api/milestones/{id}": {
      put: {
        tags: ["Milestones"],
        summary: "Update milestone status (Freelancer submits work, Client approves)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Milestone updated" } }
      }
    },
    "/api/escrow/fund/{milestoneId}": {
      post: {
        tags: ["Escrow"],
        summary: "Deposit / Lock funds into simulated Escrow (Client only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "milestoneId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Escrow funded" } }
      }
    },
    "/api/escrow/release/{milestoneId}": {
      post: {
        tags: ["Escrow"],
        summary: "Release Escrow funds to Freelancer (Client only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "milestoneId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Escrow funds released" } }
      }
    },
    "/api/escrow/refund/{milestoneId}": {
      post: {
        tags: ["Escrow"],
        summary: "Refund Escrow funds back to Client upon dispute (Client or Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "milestoneId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Escrow refunded" } }
      }
    },
    "/api/escrow/status/{milestoneId}": {
      get: {
        tags: ["Escrow"],
        summary: "Check current Escrow status of a milestone",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "milestoneId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Escrow status details" } }
      }
    },
    "/api/chats": {
      post: {
        tags: ["Chats"],
        summary: "Start or get existing conversation with a user",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["recipientId"],
                properties: {
                  recipientId: { type: "string" },
                  gigId: { type: "string" },
                  initialMessage: { type: "string", example: "Hi! Excited to work on this gig." }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Chat initiated/retrieved" } }
      },
      get: {
        tags: ["Chats"],
        summary: "List all chat conversations for current user",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of conversations" } }
      }
    },
    "/api/chats/{id}": {
      get: {
        tags: ["Chats"],
        summary: "Get chat conversation and message history",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Messages list" } }
      }
    },
    "/api/chats/{id}/messages": {
      post: {
        tags: ["Chats"],
        summary: "Send a message via REST API",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: { type: "string", example: "I have updated the latest milestone." }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Message sent" } }
      }
    },
    "/api/disputes": {
      post: {
        tags: ["Disputes"],
        summary: "Raise a project dispute",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["gig", "against", "reason", "description"],
                properties: {
                  gig: { type: "string" },
                  against: { type: "string" },
                  reason: { type: "string", example: "Scope divergence" },
                  description: { type: "string", example: "The submitted code did not meet the agreed requirements." }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Dispute raised" } }
      },
      get: {
        tags: ["Disputes"],
        summary: "Get user's disputes",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of disputes" } }
      }
    },
    "/api/disputes/{id}": {
      put: {
        tags: ["Disputes"],
        summary: "Update dispute status and add resolution",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["open", "under_review", "resolved", "rejected"] },
                  resolution: { type: "string", example: "Partial escrow refund agreed by both parties." }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Dispute updated" } }
      }
    },
    "/api/portfolio/{freelancerId}": {
      get: {
        tags: ["Portfolio"],
        summary: "View public freelancer portfolio & work stats",
        parameters: [{ name: "freelancerId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Freelancer portfolio details" } }
      }
    },
    "/api/portfolio": {
      put: {
        tags: ["Portfolio"],
        summary: "Update freelancer bio and skills",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  bio: { type: "string" },
                  skills: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Portfolio updated" } }
      }
    }
  }
};

module.exports = swaggerDocument;
