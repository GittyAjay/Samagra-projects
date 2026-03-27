export function getOpenApiDocument(baseUrl = "http://localhost:3000") {
  return {
    openapi: "3.0.3",
    info: {
      title: "Solar Sales Management API",
      version: "1.0.0",
      description: "Nitro backend APIs for client, staff, and admin solar sales workflows."
    },
    servers: [
      {
        url: baseUrl
      }
    ],
    tags: [
      { name: "System" },
      { name: "Auth" },
      { name: "Products" },
      { name: "Leads" },
      { name: "Quotations" },
      { name: "Orders" },
      { name: "Dashboard" },
      { name: "Reports" },
      { name: "Notifications" },
      { name: "Uploads" }
    ],
    components: {
      securitySchemes: {
        UserRoleHeader: {
          type: "apiKey",
          in: "header",
          name: "x-user-role"
        },
        UserIdHeader: {
          type: "apiKey",
          in: "header",
          name: "x-user-id"
        }
      },
      schemas: {
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@solar.local" },
            password: { type: "string", example: "Admin@123" }
          }
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                fullName: { type: "string" },
                role: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" }
              }
            }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["fullName", "email", "phone", "password"],
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            password: { type: "string" }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            capacityKw: { type: "number" },
            estimatedPrice: { type: "number" },
            warrantyYears: { type: "number" },
            compatibility: {
              type: "array",
              items: { type: "string" }
            },
            imageUrls: {
              type: "array",
              items: { type: "string" }
            },
            specifications: {
              type: "object",
              additionalProperties: true
            },
            active: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Lead: {
          type: "object",
          properties: {
            id: { type: "string" },
            clientId: { type: "string" },
            monthlyElectricityBill: { type: "number" },
            requiredLoadKw: { type: "number" },
            roofType: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            status: { type: "string" },
            assignedStaffId: { type: "string" },
            internalNotes: {
              type: "array",
              items: { type: "string" }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Quotation: {
          type: "object",
          properties: {
            id: { type: "string" },
            leadId: { type: "string" },
            clientId: { type: "string" },
            staffId: { type: "string" },
            systemSizeKw: { type: "number" },
            subsidyAmount: { type: "number" },
            subtotal: { type: "number" },
            finalPrice: { type: "number" },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string" },
            leadId: { type: "string" },
            quotationId: { type: "string" },
            clientId: { type: "string" },
            staffId: { type: "string" },
            status: { type: "string" },
            installationDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    },
    paths: {
      "/": {
        get: {
          tags: ["System"],
          summary: "API welcome route",
          responses: {
            "200": {
              description: "Welcome response"
            }
          }
        }
      },
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Server is healthy"
            }
          }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a client user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            "200": { description: "User registered" }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Logged in",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" }
                }
              }
            }
          }
        }
      },
      "/api/auth/forgot-password/request": {
        post: {
          tags: ["Auth"],
          summary: "Request OTP for password reset",
          responses: {
            "200": { description: "OTP generated" }
          }
        }
      },
      "/api/auth/forgot-password/verify": {
        post: {
          tags: ["Auth"],
          summary: "Verify OTP for password reset",
          responses: {
            "200": { description: "OTP verification response" }
          }
        }
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products",
          parameters: [
            {
              in: "query",
              name: "category",
              schema: { type: "string" }
            },
            {
              in: "query",
              name: "search",
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Products list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Product" }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Products"],
          summary: "Create product",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Product created" }
          }
        }
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by id",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Product details" }
          }
        },
        patch: {
          tags: ["Products"],
          summary: "Update product",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Updated product" }
          }
        },
        delete: {
          tags: ["Products"],
          summary: "Delete product",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Delete confirmation" }
          }
        }
      },
      "/api/inquiries": {
        post: {
          tags: ["Leads"],
          summary: "Create inquiry",
          responses: {
            "200": { description: "Inquiry created" }
          }
        }
      },
      "/api/leads": {
        get: {
          tags: ["Leads"],
          summary: "List leads",
          responses: {
            "200": {
              description: "Leads list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Lead" }
                  }
                }
              }
            }
          }
        }
      },
      "/api/leads/{id}": {
        get: {
          tags: ["Leads"],
          summary: "Get lead",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Lead details" }
          }
        },
        patch: {
          tags: ["Leads"],
          summary: "Update lead",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Updated lead" }
          }
        }
      },
      "/api/leads/{id}/assign": {
        post: {
          tags: ["Leads"],
          summary: "Assign lead to staff",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Assigned lead" }
          }
        }
      },
      "/api/leads/{id}/survey": {
        post: {
          tags: ["Leads"],
          summary: "Schedule site survey",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Survey scheduled" }
          }
        }
      },
      "/api/quotations": {
        get: {
          tags: ["Quotations"],
          summary: "List quotations",
          responses: {
            "200": {
              description: "Quotation list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Quotation" }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Quotations"],
          summary: "Create quotation",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Quotation created" }
          }
        }
      },
      "/api/quotations/{id}": {
        get: {
          tags: ["Quotations"],
          summary: "Get quotation",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Quotation details" }
          }
        }
      },
      "/api/quotations/{id}/approve": {
        post: {
          tags: ["Quotations"],
          summary: "Approve quotation",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Approved quotation" }
          }
        }
      },
      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "List orders",
          responses: {
            "200": {
              description: "Orders list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Orders"],
          summary: "Create order",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Order created" }
          }
        }
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get order",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Order details" }
          }
        }
      },
      "/api/orders/{id}/status": {
        patch: {
          tags: ["Orders"],
          summary: "Update order status",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Updated order" }
          }
        }
      },
      "/api/orders/{id}/payments": {
        post: {
          tags: ["Orders"],
          summary: "Mark payment milestone as paid",
          security: [{ UserRoleHeader: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Updated payment milestones" }
          }
        }
      },
      "/api/orders/{id}/invoice": {
        get: {
          tags: ["Orders"],
          summary: "Get invoice payload",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Invoice payload" }
          }
        }
      },
      "/api/dashboard/client/{clientId}": {
        get: {
          tags: ["Dashboard"],
          summary: "Get client dashboard",
          parameters: [
            {
              in: "path",
              name: "clientId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Client dashboard" }
          }
        }
      },
      "/api/dashboard/staff/{staffId}": {
        get: {
          tags: ["Dashboard"],
          summary: "Get staff dashboard",
          parameters: [
            {
              in: "path",
              name: "staffId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Staff dashboard" }
          }
        }
      },
      "/api/dashboard/admin": {
        get: {
          tags: ["Dashboard"],
          summary: "Get admin dashboard",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Admin dashboard" }
          }
        }
      },
      "/api/reports/summary": {
        get: {
          tags: ["Reports"],
          summary: "Get report summary",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Summary report" }
          }
        }
      },
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List notifications",
          responses: {
            "200": { description: "Notifications list" }
          }
        },
        post: {
          tags: ["Notifications"],
          summary: "Create notification",
          security: [{ UserRoleHeader: [] }],
          responses: {
            "200": { description: "Notification created" }
          }
        }
      },
      "/api/push-tokens/register": {
        post: {
          tags: ["Notifications"],
          summary: "Register a mobile push token",
          security: [{ UserRoleHeader: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token", "platform"],
                  properties: {
                    token: { type: "string", example: "fcm_device_token" },
                    platform: { type: "string", enum: ["android", "ios"] }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Push token registered" }
          }
        }
      },
      "/api/uploads": {
        post: {
          tags: ["Uploads"],
          summary: "Mock upload endpoint",
          responses: {
            "200": { description: "Upload response payload" }
          }
        }
      }
    }
  };
}
