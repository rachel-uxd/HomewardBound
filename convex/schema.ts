import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const staffRoleValidator = v.union(
  v.literal("volunteer"),
  v.literal("case_manager"),
  v.literal("director")
);

const showerQueueValidator = v.union(
  v.literal("women"),
  v.literal("men")
);

const mailStatusValidator = v.union(
  v.literal("held"),
  v.literal("released"),
  v.literal("returned")
);

const mailTypeValidator = v.union(
  v.literal("Letter"),
  v.literal("Package"),
  v.literal("Gov/Legal"),
  v.literal("Medical"),
  v.literal("Other")
);

const flagTypeValidator = v.union(
  v.literal("safety_concern"),
  v.literal("behavioral"),
  v.literal("medical_alert")
);

const actionPriorityValidator = v.union(
  v.literal("urgent"),
  v.literal("high"),
  v.literal("normal")
);

const actionStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("done")
);

export default defineSchema({
  staff: defineTable({
    name: v.string(),
    initials: v.string(),
    pin: v.string(),
    role: staffRoleValidator,
  })
    .index("by_pin", ["pin"])
    .index("by_role", ["role"]),

  clients: defineTable({
    name: v.string(),
    alias: v.optional(v.string()),
    yob: v.optional(v.number()),
    pronouns: v.optional(v.string()),
    ahopeNumber: v.string(),
    hasMailAgreement: v.optional(v.boolean()),
    engagementPlan: v.optional(v.string()),
    engagementPlanMeta: v.optional(v.string()),
  })
    .index("by_ahopeNumber", ["ahopeNumber"])
    .searchIndex("search_name", { searchField: "name" }),

  checkins: defineTable({
    clientId: v.id("clients"),
    staffId: v.id("staff"),
    checkinTime: v.number(),
    checkoutTime: v.optional(v.number()),
    date: v.string(),
  })
    .index("by_client", ["clientId"])
    .index("by_date", ["date"])
    .index("by_client_date", ["clientId", "date"]),

  showerQueue: defineTable({
    clientId: v.id("clients"),
    queue: showerQueueValidator,
    position: v.number(),
    addedAt: v.number(),
    completedAt: v.optional(v.number()),
    removedAt: v.optional(v.number()),
    date: v.string(),
  })
    .index("by_date_queue", ["date", "queue"])
    .index("by_client_date", ["clientId", "date"]),

  mail: defineTable({
    clientId: v.optional(v.id("clients")),
    clientName: v.optional(v.string()),
    type: mailTypeValidator,
    from: v.string(),
    status: mailStatusValidator,
    receivedDate: v.string(),
    loggedBy: v.string(),
    releasedAt: v.optional(v.number()),
    releasedBy: v.optional(v.string()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  lockers: defineTable({
    clientId: v.id("clients"),
    lockerNumber: v.number(),
    assignedAt: v.number(),
    releasedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_lockerNumber", ["lockerNumber"]),

  lockerWaitlist: defineTable({
    clientId: v.id("clients"),
    requestedAt: v.number(),
    assignedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"]),

  notes: defineTable({
    clientId: v.id("clients"),
    text: v.string(),
    staffId: v.id("staff"),
    staffName: v.string(),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"]),

  glimmers: defineTable({
    clientId: v.id("clients"),
    clientName: v.optional(v.string()),
    text: v.string(),
    staffId: v.id("staff"),
    staffName: v.string(),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"]),

  flags: defineTable({
    clientId: v.id("clients"),
    type: flagTypeValidator,
    reason: v.string(),
    staffId: v.id("staff"),
    staffName: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"]),

  actionItems: defineTable({
    clientId: v.id("clients"),
    task: v.string(),
    priority: actionPriorityValidator,
    status: actionStatusValidator,
    staffId: v.id("staff"),
    staffName: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_client", ["clientId"])
    .index("by_priority_status", ["priority", "status"]),
});
