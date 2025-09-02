import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  date,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("personnel"), // personnel, admin, hr, manager, super_admin
  // Security enhancements
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"), // TOTP secret
  phoneNumber: varchar("phone_number"), // For SMS 2FA
  lastLoginAt: timestamp("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  managerId: varchar("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  managerId: varchar("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personnel table
export const personnel = pgTable("personnel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone"),
  tcNo: varchar("tc_no").unique(),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  departmentId: varchar("department_id").references(() => departments.id),
  branchId: varchar("branch_id").references(() => branches.id),
  position: varchar("position"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  hireDate: date("hire_date"),
  terminationDate: date("termination_date"),
  status: varchar("status").default("active"), // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave types table
export const leaveTypes = pgTable("leave_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  maxDays: decimal("max_days", { precision: 5, scale: 2 }),
  maxDaysPerYear: decimal("max_days_per_year", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave requests table
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id),
  leaveTypeId: varchar("leave_type_id").references(() => leaveTypes.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: decimal("days", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shifts table
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: varchar("description"),
  startTime: varchar("start_time").notNull(), // "08:00"
  endTime: varchar("end_time").notNull(), // "16:00"
  workingHours: varchar("working_hours"),
  color: varchar("color").default("#3B82F6"), // Color code for display
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift assignments table
export const shiftAssignments = pgTable("shift_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id),
  shiftId: varchar("shift_id").references(() => shifts.id),
  date: date("date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  workHours: decimal("work_hours", { precision: 5, scale: 2 }),
  status: varchar("status"), // present, absent, late, early_leave
  notes: text("notes"),
  qrCodeUsed: boolean("qr_code_used").default(false),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Education records table
export const educationRecords = pgTable("education_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id).notNull(),
  type: varchar("type").notNull(), // degree, certification, course
  institutionName: varchar("institution_name").notNull(),
  fieldOfStudy: varchar("field_of_study"),
  degree: varchar("degree"), // Bachelor, Master, PhD, etc.
  startDate: date("start_date"),
  endDate: date("end_date"),
  graduationYear: varchar("graduation_year"),
  grade: varchar("grade"),
  description: text("description"),
  certificateNumber: varchar("certificate_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health records table
export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id).notNull(),
  type: varchar("type").notNull(), // periodic_checkup, work_accident, occupational_disease, special_condition
  recordDate: date("record_date").notNull(),
  description: text("description"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  doctorName: varchar("doctor_name"),
  hospitalName: varchar("hospital_name"),
  isConfidential: boolean("is_confidential").default(true),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document management table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id),
  category: varchar("category").notNull(), // contract, certificate, medical, legal, personal
  documentName: varchar("document_name").notNull(),
  documentType: varchar("document_type"), // pdf, doc, image, etc.
  filePath: varchar("file_path"),
  fileSize: decimal("file_size", { precision: 10, scale: 2 }),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  issuingAuthority: varchar("issuing_authority"),
  documentNumber: varchar("document_number"),
  status: varchar("status").default("active"), // active, expired, renewed, archived
  isDigitallySigned: boolean("is_digitally_signed").default(false),
  reminderDays: decimal("reminder_days", { precision: 3, scale: 0 }).default("30"), // Days before expiry to send reminder
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance evaluations table
export const performanceEvaluations = pgTable("performance_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").references(() => personnel.id).notNull(),
  evaluatorId: varchar("evaluator_id").references(() => users.id).notNull(),
  evaluationPeriod: varchar("evaluation_period").notNull(), // Q1-2024, 2024-Annual
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }), // 1.0 to 5.0
  goals: text("goals"),
  achievements: text("achievements"),
  areasOfImprovement: text("areas_of_improvement"),
  feedback: text("feedback"),
  recommendedActions: text("recommended_actions"),
  status: varchar("status").default("draft"), // draft, completed, approved
  isPromotionRecommended: boolean("is_promotion_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QR Codes table for entry/exit
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codeValue: varchar("code_value").unique().notNull(),
  branchId: varchar("branch_id").references(() => branches.id),
  location: varchar("location"),
  pinCode: varchar("pin_code"),
  securityHash: varchar("security_hash"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar events and holidays table
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  startTime: varchar("start_time"),
  endTime: varchar("end_time"),
  type: varchar("type").notNull(), // holiday, corporate_event, meeting, training
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: varchar("recurrence_pattern"), // daily, weekly, monthly, yearly
  location: varchar("location"),
  organizerId: varchar("organizer_id").references(() => users.id),
  attendees: text("attendees"), // JSON array of personnel IDs
  color: varchar("color").default("#3B82F6"),
  isPublic: boolean("is_public").default(true),
  reminderMinutes: decimal("reminder_minutes", { precision: 5, scale: 0 }).default("30"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Turkish holidays table
export const holidays = pgTable("holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  type: varchar("type").notNull(), // national, religious, local
  isOfficial: boolean("is_official").default(true),
  description: text("description"),
  year: varchar("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // sms, email, push, system
  status: varchar("status").default("pending"), // pending, sent, delivered, failed
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  relatedEntity: varchar("related_entity"), // leave_request, shift_assignment, etc.
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mobile device management table
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceId: varchar("device_id").unique().notNull(),
  deviceName: varchar("device_name"),
  platform: varchar("platform"), // ios, android
  appVersion: varchar("app_version"),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  fcmToken: varchar("fcm_token"), // For push notifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  description: text("description"),
  category: varchar("category").default("general"), // general, security, notification, mobile
  dataType: varchar("data_type").default("string"), // string, number, boolean, json
  isEditable: boolean("is_editable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift templates table
export const shiftTemplates = pgTable("shift_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateData: jsonb("template_data").notNull(), // JSON with shift patterns
  createdBy: varchar("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift change requests table
export const shiftChangeRequests = pgTable("shift_change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => personnel.id).notNull(),
  originalShiftId: varchar("original_shift_id").references(() => shiftAssignments.id).notNull(),
  proposedShiftId: varchar("proposed_shift_id").references(() => shiftAssignments.id),
  targetPersonnelId: varchar("target_personnel_id").references(() => personnel.id), // For shift swaps
  reason: text("reason"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  personnel: one(personnel, {
    fields: [users.id],
    references: [personnel.userId],
  }),
  managedDepartments: many(departments),
  managedBranches: many(branches),
  approvedLeaves: many(leaveRequests),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  manager: one(users, {
    fields: [departments.managerId],
    references: [users.id],
  }),
  personnel: many(personnel),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  manager: one(users, {
    fields: [branches.managerId],
    references: [users.id],
  }),
  personnel: many(personnel),
}));

export const personnelRelations = relations(personnel, ({ one, many }) => ({
  user: one(users, {
    fields: [personnel.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [personnel.departmentId],
    references: [departments.id],
  }),
  branch: one(branches, {
    fields: [personnel.branchId],
    references: [branches.id],
  }),
  leaveRequests: many(leaveRequests),
  shiftAssignments: many(shiftAssignments),
  attendanceRecords: many(attendanceRecords),
  educationRecords: many(educationRecords),
  healthRecords: many(healthRecords),
  documents: many(documents),
  performanceEvaluations: many(performanceEvaluations),
  shiftChangeRequests: many(shiftChangeRequests),
}));

export const leaveTypesRelations = relations(leaveTypes, ({ many }) => ({
  leaveRequests: many(leaveRequests),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  personnel: one(personnel, {
    fields: [leaveRequests.personnelId],
    references: [personnel.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveRequests.leaveTypeId],
    references: [leaveTypes.id],
  }),
  approver: one(users, {
    fields: [leaveRequests.approvedBy],
    references: [users.id],
  }),
}));

export const shiftsRelations = relations(shifts, ({ many }) => ({
  assignments: many(shiftAssignments),
}));

export const shiftAssignmentsRelations = relations(shiftAssignments, ({ one }) => ({
  personnel: one(personnel, {
    fields: [shiftAssignments.personnelId],
    references: [personnel.id],
  }),
  shift: one(shifts, {
    fields: [shiftAssignments.shiftId],
    references: [shifts.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  personnel: one(personnel, {
    fields: [attendanceRecords.personnelId],
    references: [personnel.id],
  }),
}));

// New table relations
export const educationRecordsRelations = relations(educationRecords, ({ one }) => ({
  personnel: one(personnel, {
    fields: [educationRecords.personnelId],
    references: [personnel.id],
  }),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  personnel: one(personnel, {
    fields: [healthRecords.personnelId],
    references: [personnel.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  personnel: one(personnel, {
    fields: [documents.personnelId],
    references: [personnel.id],
  }),
}));

export const performanceEvaluationsRelations = relations(performanceEvaluations, ({ one }) => ({
  personnel: one(personnel, {
    fields: [performanceEvaluations.personnelId],
    references: [personnel.id],
  }),
  evaluator: one(users, {
    fields: [performanceEvaluations.evaluatorId],
    references: [users.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  branch: one(branches, {
    fields: [qrCodes.branchId],
    references: [branches.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  organizer: one(users, {
    fields: [calendarEvents.organizerId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
}));

export const mobileDevicesRelations = relations(mobileDevices, ({ one }) => ({
  user: one(users, {
    fields: [mobileDevices.userId],
    references: [users.id],
  }),
}));

export const shiftTemplatesRelations = relations(shiftTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [shiftTemplates.createdBy],
    references: [users.id],
  }),
}));

export const shiftChangeRequestsRelations = relations(shiftChangeRequests, ({ one }) => ({
  requester: one(personnel, {
    fields: [shiftChangeRequests.requesterId],
    references: [personnel.id],
  }),
  originalShift: one(shiftAssignments, {
    fields: [shiftChangeRequests.originalShiftId],
    references: [shiftAssignments.id],
  }),
  proposedShift: one(shiftAssignments, {
    fields: [shiftChangeRequests.proposedShiftId],
    references: [shiftAssignments.id],
  }),
  targetPersonnel: one(personnel, {
    fields: [shiftChangeRequests.targetPersonnelId],
    references: [personnel.id],
  }),
  approver: one(users, {
    fields: [shiftChangeRequests.approvedBy],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPersonnelSchema = createInsertSchema(personnel).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaveTypeSchema = createInsertSchema(leaveTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShiftSchema = createInsertSchema(shifts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShiftAssignmentSchema = createInsertSchema(shiftAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({ id: true, createdAt: true, updatedAt: true });

// New table schemas
export const insertEducationRecordSchema = createInsertSchema(educationRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPerformanceEvaluationSchema = createInsertSchema(performanceEvaluations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHolidaySchema = createInsertSchema(holidays).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMobileDeviceSchema = createInsertSchema(mobileDevices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShiftTemplateSchema = createInsertSchema(shiftTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShiftChangeRequestSchema = createInsertSchema(shiftChangeRequests).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = z.infer<typeof insertPersonnelSchema>;
export type LeaveType = typeof leaveTypes.$inferSelect;
export type InsertLeaveType = z.infer<typeof insertLeaveTypeSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = z.infer<typeof insertShiftAssignmentSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

// New table types
export type EducationRecord = typeof educationRecords.$inferSelect;
export type InsertEducationRecord = z.infer<typeof insertEducationRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type PerformanceEvaluation = typeof performanceEvaluations.$inferSelect;
export type InsertPerformanceEvaluation = z.infer<typeof insertPerformanceEvaluationSchema>;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type Holiday = typeof holidays.$inferSelect;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;
export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type ShiftTemplate = typeof shiftTemplates.$inferSelect;
export type InsertShiftTemplate = z.infer<typeof insertShiftTemplateSchema>;
export type ShiftChangeRequest = typeof shiftChangeRequests.$inferSelect;
export type InsertShiftChangeRequest = z.infer<typeof insertShiftChangeRequestSchema>;

// Extended types with relations
export type PersonnelWithRelations = Personnel & {
  department?: Department;
  branch?: Branch;
  user?: User;
  educationRecords?: EducationRecord[];
  healthRecords?: HealthRecord[];
  documents?: Document[];
  performanceEvaluations?: PerformanceEvaluation[];
};

export type LeaveRequestWithRelations = LeaveRequest & {
  personnel?: Personnel;
  leaveType?: LeaveType;
  approver?: User;
};

export type ShiftAssignmentWithRelations = ShiftAssignment & {
  personnel?: Personnel;
  shift?: Shift;
};

export type PerformanceEvaluationWithRelations = PerformanceEvaluation & {
  personnel?: Personnel;
  evaluator?: User;
};

export type CalendarEventWithRelations = CalendarEvent & {
  organizer?: User;
};

export type ShiftChangeRequestWithRelations = ShiftChangeRequest & {
  requester?: Personnel;
  originalShift?: ShiftAssignment;
  proposedShift?: ShiftAssignment;
  targetPersonnel?: Personnel;
  approver?: User;
};

export type NotificationWithRelations = Notification & {
  recipient?: User;
};

// Security Enhancement Tables
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionId: varchar("session_id").notNull(),
  deviceInfo: jsonb("device_info"), // Browser, OS, etc.
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceFingerprint: varchar("device_fingerprint").notNull(),
  deviceName: varchar("device_name"),
  deviceType: varchar("device_type"), // desktop, mobile, tablet
  browser: varchar("browser"),
  os: varchar("os"),
  isTrusted: boolean("is_trusted").default(false),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  eventType: varchar("event_type").notNull(), // login, logout, 2fa_enabled, password_reset, etc.
  eventLevel: varchar("event_level").default("info"), // info, warning, error, critical
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  details: jsonb("details"), // Additional event details
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email"),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: varchar("user_agent"),
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason"),
  blocked: boolean("blocked").default(false),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export const twoFactorBackupCodes = pgTable("two_factor_backup_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  code: varchar("code").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security table relations
export const securityRelations = relations(users, ({ many }) => ({
  userSessions: many(userSessions),
  userDevices: many(userDevices),
  securityLogs: many(securityLogs),
  backupCodes: many(twoFactorBackupCodes),
}));

export const userSessionRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userDeviceRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

export const securityLogRelations = relations(securityLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityLogs.userId],
    references: [users.id],
  }),
}));

export const backupCodeRelations = relations(twoFactorBackupCodes, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorBackupCodes.userId],
    references: [users.id],
  }),
}));

// Security types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = typeof userDevices.$inferInsert;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

export type TwoFactorBackupCode = typeof twoFactorBackupCodes.$inferSelect;
export type InsertTwoFactorBackupCode = typeof twoFactorBackupCodes.$inferInsert;
