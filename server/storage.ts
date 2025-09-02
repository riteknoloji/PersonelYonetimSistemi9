import {
  users,
  departments,
  branches,
  personnel,
  leaveTypes,
  leaveRequests,
  shifts,
  shiftAssignments,
  attendanceRecords,
  educationRecords,
  healthRecords,
  documents,
  performanceEvaluations,
  qrCodes,
  calendarEvents,
  holidays,
  notifications,
  mobileDevices,
  systemSettings,
  shiftTemplates,
  shiftChangeRequests,
  userSessions,
  userDevices,
  securityLogs,
  loginAttempts,
  twoFactorBackupCodes,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type Branch,
  type InsertBranch,
  type Personnel,
  type InsertPersonnel,
  type PersonnelWithRelations,
  type LeaveType,
  type InsertLeaveType,
  type LeaveRequest,
  type InsertLeaveRequest,
  type LeaveRequestWithRelations,
  type Shift,
  type InsertShift,
  type ShiftAssignment,
  type InsertShiftAssignment,
  type ShiftAssignmentWithRelations,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type EducationRecord,
  type InsertEducationRecord,
  type HealthRecord,
  type InsertHealthRecord,
  type Document,
  type InsertDocument,
  type PerformanceEvaluation,
  type InsertPerformanceEvaluation,
  type PerformanceEvaluationWithRelations,
  type QrCode,
  type InsertQrCode,
  type CalendarEvent,
  type InsertCalendarEvent,
  type CalendarEventWithRelations,
  type Holiday,
  type InsertHoliday,
  type Notification,
  type InsertNotification,
  type NotificationWithRelations,
  type MobileDevice,
  type InsertMobileDevice,
  type SystemSetting,
  type InsertSystemSetting,
  type ShiftTemplate,
  type InsertShiftTemplate,
  type ShiftChangeRequest,
  type InsertShiftChangeRequest,
  type ShiftChangeRequestWithRelations,
  type UserSession,
  type InsertUserSession,
  type UserDevice,
  type InsertUserDevice,
  type SecurityLog,
  type InsertSecurityLog,
  type LoginAttempt,
  type InsertLoginAttempt,
  type TwoFactorBackupCode,
  type InsertTwoFactorBackupCode,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Security operations
  logSecurityEvent(event: InsertSecurityLog): Promise<void>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  terminateUserSession(sessionId: string): Promise<void>;
  terminateAllUserSessions(userId: string): Promise<void>;
  
  createUserDevice(device: InsertUserDevice): Promise<UserDevice>;
  getUserDevices(userId: string): Promise<UserDevice[]>;
  updateDeviceTrusted(deviceId: string, trusted: boolean): Promise<void>;
  removeUserDevice(deviceId: string): Promise<void>;
  
  logLoginAttempt(attempt: InsertLoginAttempt): Promise<void>;
  getRecentLoginAttempts(ipAddress: string): Promise<LoginAttempt[]>;
  
  enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void>;
  disable2FA(userId: string): Promise<void>;
  verify2FABackupCode(userId: string, code: string): Promise<boolean>;
  getSecurityLogs(userId?: string, limit?: number): Promise<SecurityLog[]>;
  
  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: string): Promise<void>;
  
  // Branch operations
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  
  // Personnel operations
  getPersonnel(): Promise<PersonnelWithRelations[]>;
  getPersonnelById(id: string): Promise<PersonnelWithRelations | undefined>;
  createPersonnel(personnelData: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: string, personnelData: Partial<InsertPersonnel>): Promise<Personnel>;
  deletePersonnel(id: string): Promise<void>;
  
  // Leave operations
  getLeaveTypes(): Promise<LeaveType[]>;
  createLeaveType(leaveType: InsertLeaveType): Promise<LeaveType>;
  getLeaveRequests(): Promise<LeaveRequestWithRelations[]>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, data: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  
  // Shift operations
  getShifts(): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  deleteShift(id: string): Promise<void>;
  getShiftAssignments(date?: string): Promise<ShiftAssignmentWithRelations[]>;
  createShiftAssignment(assignment: InsertShiftAssignment): Promise<ShiftAssignment>;
  deleteShiftAssignment(id: string): Promise<void>;
  
  // Attendance operations
  getAttendanceRecords(date?: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  
  // Education records operations
  getEducationRecords(personnelId: string): Promise<EducationRecord[]>;
  createEducationRecord(record: InsertEducationRecord): Promise<EducationRecord>;
  updateEducationRecord(id: string, record: Partial<InsertEducationRecord>): Promise<EducationRecord>;
  deleteEducationRecord(id: string): Promise<void>;
  
  // Health records operations
  getHealthRecords(personnelId: string): Promise<HealthRecord[]>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  updateHealthRecord(id: string, record: Partial<InsertHealthRecord>): Promise<HealthRecord>;
  deleteHealthRecord(id: string): Promise<void>;
  
  // Document operations
  getDocuments(personnelId?: string): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getExpiringDocuments(days?: number): Promise<Document[]>;
  
  // Performance evaluations operations
  getPerformanceEvaluations(personnelId?: string): Promise<PerformanceEvaluationWithRelations[]>;
  createPerformanceEvaluation(evaluation: InsertPerformanceEvaluation): Promise<PerformanceEvaluation>;
  updatePerformanceEvaluation(id: string, evaluation: Partial<InsertPerformanceEvaluation>): Promise<PerformanceEvaluation>;
  deletePerformanceEvaluation(id: string): Promise<void>;
  
  // QR Code operations
  getQrCodes(branchId?: string): Promise<QrCode[]>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(id: string, qrCode: Partial<InsertQrCode>): Promise<QrCode>;
  deleteQrCode(id: string): Promise<void>;
  getActiveQrCodeByValue(codeValue: string): Promise<QrCode | undefined>;
  
  // Calendar and Holiday operations
  getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEventWithRelations[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;
  getHolidays(year?: string): Promise<Holiday[]>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  
  // Notification operations
  getNotifications(recipientId: string): Promise<NotificationWithRelations[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;
  markNotificationAsRead(id: string): Promise<void>;
  markNotificationAsSent(id: string): Promise<void>;
  
  // Mobile device operations
  getMobileDevices(userId?: string): Promise<MobileDevice[]>;
  createMobileDevice(device: InsertMobileDevice): Promise<MobileDevice>;
  updateMobileDevice(id: string, device: Partial<InsertMobileDevice>): Promise<MobileDevice>;
  deleteMobileDevice(id: string): Promise<void>;
  deactivateUserDevices(userId: string): Promise<void>;
  
  // System settings operations
  getSystemSettings(category?: string): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
  
  // Shift templates and change requests
  getShiftTemplates(): Promise<ShiftTemplate[]>;
  createShiftTemplate(template: InsertShiftTemplate): Promise<ShiftTemplate>;
  deleteShiftTemplate(id: string): Promise<void>;
  getShiftChangeRequests(status?: string): Promise<ShiftChangeRequestWithRelations[]>;
  createShiftChangeRequest(request: InsertShiftChangeRequest): Promise<ShiftChangeRequest>;
  updateShiftChangeRequest(id: string, request: Partial<InsertShiftChangeRequest>): Promise<ShiftChangeRequest>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalPersonnel: number;
    onLeaveToday: number;
    activeShifts: number;
    pendingLeaves: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...department, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(branches.name);
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  async updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch> {
    const [updatedBranch] = await db
      .update(branches)
      .set({ ...branch, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updatedBranch;
  }

  async deleteBranch(id: string): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  // Personnel operations
  async getPersonnel(): Promise<PersonnelWithRelations[]> {
    const result = await db
      .select({
        id: personnel.id,
        userId: personnel.userId,
        employeeId: personnel.employeeId,
        firstName: personnel.firstName,
        lastName: personnel.lastName,
        email: personnel.email,
        phone: personnel.phone,
        tcNo: personnel.tcNo,
        dateOfBirth: personnel.dateOfBirth,
        address: personnel.address,
        departmentId: personnel.departmentId,
        branchId: personnel.branchId,
        position: personnel.position,
        salary: personnel.salary,
        hireDate: personnel.hireDate,
        terminationDate: personnel.terminationDate,
        status: personnel.status,
        createdAt: personnel.createdAt,
        updatedAt: personnel.updatedAt,
        department: departments,
        branch: branches,
      })
      .from(personnel)
      .leftJoin(departments, eq(personnel.departmentId, departments.id))
      .leftJoin(branches, eq(personnel.branchId, branches.id))
      .orderBy(desc(personnel.createdAt));

    return result.map(row => ({
      ...row,
      department: row.department || undefined,
      branch: row.branch || undefined
    }));
  }

  async getPersonnelById(id: string): Promise<PersonnelWithRelations | undefined> {
    const [result] = await db
      .select({
        id: personnel.id,
        userId: personnel.userId,
        employeeId: personnel.employeeId,
        firstName: personnel.firstName,
        lastName: personnel.lastName,
        email: personnel.email,
        phone: personnel.phone,
        tcNo: personnel.tcNo,
        dateOfBirth: personnel.dateOfBirth,
        address: personnel.address,
        departmentId: personnel.departmentId,
        branchId: personnel.branchId,
        position: personnel.position,
        salary: personnel.salary,
        hireDate: personnel.hireDate,
        terminationDate: personnel.terminationDate,
        status: personnel.status,
        createdAt: personnel.createdAt,
        updatedAt: personnel.updatedAt,
        department: departments,
        branch: branches,
      })
      .from(personnel)
      .leftJoin(departments, eq(personnel.departmentId, departments.id))
      .leftJoin(branches, eq(personnel.branchId, branches.id))
      .where(eq(personnel.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result,
      department: result.department || undefined,
      branch: result.branch || undefined
    };
  }

  async createPersonnel(personnelData: InsertPersonnel): Promise<Personnel> {
    const [newPersonnel] = await db.insert(personnel).values(personnelData).returning();
    return newPersonnel;
  }

  async updatePersonnel(id: string, personnelData: Partial<InsertPersonnel>): Promise<Personnel> {
    const [updatedPersonnel] = await db
      .update(personnel)
      .set({ ...personnelData, updatedAt: new Date() })
      .where(eq(personnel.id, id))
      .returning();
    return updatedPersonnel;
  }

  async deletePersonnel(id: string): Promise<void> {
    await db.delete(personnel).where(eq(personnel.id, id));
  }

  // Leave operations
  async getLeaveTypes(): Promise<LeaveType[]> {
    return await db.select().from(leaveTypes).orderBy(desc(leaveTypes.createdAt));
  }

  async createLeaveType(leaveType: InsertLeaveType): Promise<LeaveType> {
    const [newLeaveType] = await db.insert(leaveTypes).values(leaveType).returning();
    return newLeaveType;
  }

  async getLeaveRequests(): Promise<LeaveRequestWithRelations[]> {
    const result = await db
      .select({
        id: leaveRequests.id,
        personnelId: leaveRequests.personnelId,
        leaveTypeId: leaveRequests.leaveTypeId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        days: leaveRequests.days,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        approvedBy: leaveRequests.approvedBy,
        approvedAt: leaveRequests.approvedAt,
        rejectionReason: leaveRequests.rejectionReason,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
        personnel: personnel,
        leaveType: leaveTypes,
        approver: users,
      })
      .from(leaveRequests)
      .leftJoin(personnel, eq(leaveRequests.personnelId, personnel.id))
      .leftJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
      .leftJoin(users, eq(leaveRequests.approvedBy, users.id))
      .orderBy(desc(leaveRequests.createdAt));

    return result.map(row => ({
      ...row,
      personnel: row.personnel || undefined,
      leaveType: row.leaveType || undefined,
      approver: row.approver || undefined
    }));
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newLeaveRequest] = await db.insert(leaveRequests).values(leaveRequest).returning();
    return newLeaveRequest;
  }

  async updateLeaveRequest(id: string, data: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [updatedLeaveRequest] = await db
      .update(leaveRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedLeaveRequest;
  }

  // Shift operations
  async getShifts(): Promise<Shift[]> {
    return await db.select().from(shifts).where(eq(shifts.isActive, true));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [newShift] = await db.insert(shifts).values(shift).returning();
    return newShift;
  }

  async deleteShift(id: string): Promise<void> {
    await db.delete(shifts).where(eq(shifts.id, id));
  }

  async getShiftAssignments(date?: string): Promise<ShiftAssignmentWithRelations[]> {
    let baseQuery = db
      .select({
        id: shiftAssignments.id,
        personnelId: shiftAssignments.personnelId,
        shiftId: shiftAssignments.shiftId,
        date: shiftAssignments.date,
        isActive: shiftAssignments.isActive,
        createdAt: shiftAssignments.createdAt,
        updatedAt: shiftAssignments.updatedAt,
        personnel: personnel,
        shift: shifts,
      })
      .from(shiftAssignments)
      .leftJoin(personnel, eq(shiftAssignments.personnelId, personnel.id))
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.id));

    if (date) {
      baseQuery = baseQuery.where(and(eq(shiftAssignments.isActive, true), eq(shiftAssignments.date, date))) as any;
    } else {
      baseQuery = baseQuery.where(eq(shiftAssignments.isActive, true)) as any;
    }

    const result = await baseQuery.orderBy(shiftAssignments.date);
    
    return result.map(row => ({
      ...row,
      personnel: row.personnel || undefined,
      shift: row.shift || undefined
    }));
  }

  async createShiftAssignment(assignment: InsertShiftAssignment): Promise<ShiftAssignment> {
    const [newAssignment] = await db.insert(shiftAssignments).values(assignment).returning();
    return newAssignment;
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    await db.delete(shiftAssignments).where(eq(shiftAssignments.id, id));
  }

  // Attendance operations
  async getAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
    if (date) {
      return await db.select().from(attendanceRecords)
        .where(eq(attendanceRecords.date, date))
        .orderBy(desc(attendanceRecords.date));
    }

    return await db.select().from(attendanceRecords)
      .orderBy(desc(attendanceRecords.date));
  }

  // Education records operations
  async getEducationRecords(personnelId: string): Promise<EducationRecord[]> {
    return await db.select().from(educationRecords)
      .where(eq(educationRecords.personnelId, personnelId))
      .orderBy(desc(educationRecords.graduationYear));
  }

  async createEducationRecord(record: InsertEducationRecord): Promise<EducationRecord> {
    const [newRecord] = await db.insert(educationRecords).values(record).returning();
    return newRecord;
  }

  async updateEducationRecord(id: string, record: Partial<InsertEducationRecord>): Promise<EducationRecord> {
    const [updatedRecord] = await db
      .update(educationRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(educationRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteEducationRecord(id: string): Promise<void> {
    await db.delete(educationRecords).where(eq(educationRecords.id, id));
  }

  // Health records operations
  async getHealthRecords(personnelId: string): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords)
      .where(eq(healthRecords.personnelId, personnelId))
      .orderBy(desc(healthRecords.reportDate));
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async updateHealthRecord(id: string, record: Partial<InsertHealthRecord>): Promise<HealthRecord> {
    const [updatedRecord] = await db
      .update(healthRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(healthRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteHealthRecord(id: string): Promise<void> {
    await db.delete(healthRecords).where(eq(healthRecords.id, id));
  }

  // Document operations
  async getDocuments(personnelId: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(eq(documents.personnelId, personnelId))
      .orderBy(desc(documents.issueDate));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [newRecord] = await db.insert(attendanceRecords).values(record).returning();
    return newRecord;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalPersonnel: number;
    onLeaveToday: number;
    activeShifts: number;
    pendingLeaves: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [totalPersonnelResult] = await db
      .select({ count: count() })
      .from(personnel)
      .where(eq(personnel.status, 'active'));

    const [onLeaveTodayResult] = await db
      .select({ count: count() })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.status, 'approved'),
          sql`${leaveRequests.startDate} <= ${today}`,
          sql`${leaveRequests.endDate} >= ${today}`
        )
      );

    const [activeShiftsResult] = await db
      .select({ count: count() })
      .from(shifts)
      .where(eq(shifts.isActive, true));

    const [pendingLeavesResult] = await db
      .select({ count: count() })
      .from(leaveRequests)
      .where(eq(leaveRequests.status, 'pending'));

    return {
      totalPersonnel: totalPersonnelResult.count,
      onLeaveToday: onLeaveTodayResult.count,
      activeShifts: activeShiftsResult.count,
      pendingLeaves: pendingLeavesResult.count,
    };
  }

  // Education records operations
  async getEducationRecords(personnelId: string): Promise<EducationRecord[]> {
    return await db.select().from(educationRecords)
      .where(and(eq(educationRecords.personnelId, personnelId), eq(educationRecords.isActive, true)))
      .orderBy(desc(educationRecords.endDate));
  }

  async createEducationRecord(record: InsertEducationRecord): Promise<EducationRecord> {
    const [newRecord] = await db.insert(educationRecords).values(record).returning();
    return newRecord;
  }

  async updateEducationRecord(id: string, record: Partial<InsertEducationRecord>): Promise<EducationRecord> {
    const [updatedRecord] = await db
      .update(educationRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(educationRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteEducationRecord(id: string): Promise<void> {
    await db.update(educationRecords)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(educationRecords.id, id));
  }

  // Health records operations
  async getHealthRecords(personnelId: string): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords)
      .where(eq(healthRecords.personnelId, personnelId))
      .orderBy(desc(healthRecords.recordDate));
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async updateHealthRecord(id: string, record: Partial<InsertHealthRecord>): Promise<HealthRecord> {
    const [updatedRecord] = await db
      .update(healthRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(healthRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteHealthRecord(id: string): Promise<void> {
    await db.delete(healthRecords).where(eq(healthRecords.id, id));
  }

  // Document operations
  async getDocuments(personnelId?: string): Promise<Document[]> {
    if (personnelId) {
      return await db.select().from(documents)
        .where(and(eq(documents.personnelId, personnelId), eq(documents.status, 'active')))
        .orderBy(desc(documents.createdAt));
    }
    return await db.select().from(documents)
      .where(eq(documents.status, 'active'))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.update(documents)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(documents.id, id));
  }

  async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return await db.select().from(documents)
      .where(
        and(
          eq(documents.status, 'active'),
          sql`${documents.expiryDate} IS NOT NULL`,
          sql`${documents.expiryDate} <= ${futureDateStr}`
        )
      )
      .orderBy(documents.expiryDate);
  }

  // Performance evaluations operations
  async getPerformanceEvaluations(personnelId?: string): Promise<PerformanceEvaluationWithRelations[]> {
    let baseQuery = db
      .select({
        id: performanceEvaluations.id,
        personnelId: performanceEvaluations.personnelId,
        evaluatorId: performanceEvaluations.evaluatorId,
        evaluationPeriod: performanceEvaluations.evaluationPeriod,
        overallScore: performanceEvaluations.overallScore,
        goals: performanceEvaluations.goals,
        achievements: performanceEvaluations.achievements,
        areasOfImprovement: performanceEvaluations.areasOfImprovement,
        feedback: performanceEvaluations.feedback,
        recommendedActions: performanceEvaluations.recommendedActions,
        status: performanceEvaluations.status,
        isPromotionRecommended: performanceEvaluations.isPromotionRecommended,
        createdAt: performanceEvaluations.createdAt,
        updatedAt: performanceEvaluations.updatedAt,
        personnel: personnel,
        evaluator: users,
      })
      .from(performanceEvaluations)
      .leftJoin(personnel, eq(performanceEvaluations.personnelId, personnel.id))
      .leftJoin(users, eq(performanceEvaluations.evaluatorId, users.id));

    if (personnelId) {
      baseQuery = baseQuery.where(eq(performanceEvaluations.personnelId, personnelId)) as any;
    }

    const result = await baseQuery.orderBy(desc(performanceEvaluations.createdAt));
    
    return result.map(row => ({
      ...row,
      personnel: row.personnel || undefined,
      evaluator: row.evaluator || undefined
    }));
  }

  async createPerformanceEvaluation(evaluation: InsertPerformanceEvaluation): Promise<PerformanceEvaluation> {
    const [newEvaluation] = await db.insert(performanceEvaluations).values(evaluation).returning();
    return newEvaluation;
  }

  async updatePerformanceEvaluation(id: string, evaluation: Partial<InsertPerformanceEvaluation>): Promise<PerformanceEvaluation> {
    const [updatedEvaluation] = await db
      .update(performanceEvaluations)
      .set({ ...evaluation, updatedAt: new Date() })
      .where(eq(performanceEvaluations.id, id))
      .returning();
    return updatedEvaluation;
  }

  async deletePerformanceEvaluation(id: string): Promise<void> {
    await db.delete(performanceEvaluations).where(eq(performanceEvaluations.id, id));
  }

  // QR Code operations
  async getQrCodes(branchId?: string): Promise<QrCode[]> {
    if (branchId) {
      return await db.select().from(qrCodes)
        .where(and(eq(qrCodes.branchId, branchId), eq(qrCodes.isActive, true)))
        .orderBy(desc(qrCodes.createdAt));
    }
    return await db.select().from(qrCodes)
      .where(eq(qrCodes.isActive, true))
      .orderBy(desc(qrCodes.createdAt));
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const [newQrCode] = await db.insert(qrCodes).values(qrCode).returning();
    return newQrCode;
  }

  async updateQrCode(id: string, qrCode: Partial<InsertQrCode>): Promise<QrCode> {
    const [updatedQrCode] = await db
      .update(qrCodes)
      .set({ ...qrCode, updatedAt: new Date() })
      .where(eq(qrCodes.id, id))
      .returning();
    return updatedQrCode;
  }

  async deleteQrCode(id: string): Promise<void> {
    await db.update(qrCodes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(qrCodes.id, id));
  }

  async getActiveQrCodeByValue(codeValue: string): Promise<QrCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes)
      .where(and(eq(qrCodes.codeValue, codeValue), eq(qrCodes.isActive, true)));
    return qrCode;
  }

  // Calendar and Holiday operations
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEventWithRelations[]> {
    let baseQuery = db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        eventDate: calendarEvents.eventDate,
        startTime: calendarEvents.startTime,
        endTime: calendarEvents.endTime,
        type: calendarEvents.type,
        isRecurring: calendarEvents.isRecurring,
        recurrencePattern: calendarEvents.recurrencePattern,
        location: calendarEvents.location,
        organizerId: calendarEvents.organizerId,
        attendees: calendarEvents.attendees,
        color: calendarEvents.color,
        isPublic: calendarEvents.isPublic,
        reminderMinutes: calendarEvents.reminderMinutes,
        createdAt: calendarEvents.createdAt,
        updatedAt: calendarEvents.updatedAt,
        organizer: users,
      })
      .from(calendarEvents)
      .leftJoin(users, eq(calendarEvents.organizerId, users.id));

    if (startDate && endDate) {
      baseQuery = baseQuery.where(
        and(
          sql`${calendarEvents.eventDate} >= ${startDate}`,
          sql`${calendarEvents.eventDate} <= ${endDate}`
        )
      ) as any;
    }

    const result = await baseQuery.orderBy(calendarEvents.eventDate);
    
    return result.map(row => ({
      ...row,
      organizer: row.organizer || undefined
    }));
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  async getHolidays(year?: string): Promise<Holiday[]> {
    if (year) {
      return await db.select().from(holidays)
        .where(eq(holidays.year, year))
        .orderBy(holidays.date);
    }
    return await db.select().from(holidays)
      .orderBy(holidays.date);
  }

  async createHoliday(holiday: InsertHoliday): Promise<Holiday> {
    const [newHoliday] = await db.insert(holidays).values(holiday).returning();
    return newHoliday;
  }

  // Notification operations
  async getNotifications(recipientId: string): Promise<NotificationWithRelations[]> {
    const result = await db
      .select({
        id: notifications.id,
        recipientId: notifications.recipientId,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        status: notifications.status,
        priority: notifications.priority,
        scheduledFor: notifications.scheduledFor,
        sentAt: notifications.sentAt,
        deliveredAt: notifications.deliveredAt,
        readAt: notifications.readAt,
        relatedEntity: notifications.relatedEntity,
        relatedEntityId: notifications.relatedEntityId,
        createdAt: notifications.createdAt,
        updatedAt: notifications.updatedAt,
        recipient: users,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.recipientId, users.id))
      .where(eq(notifications.recipientId, recipientId))
      .orderBy(desc(notifications.createdAt));

    return result.map(row => ({
      ...row,
      recipient: row.recipient || undefined
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification> {
    const [updatedNotification] = await db.update(notifications)
      .set({ ...notification, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ readAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async markNotificationAsSent(id: string): Promise<void> {
    await db.update(notifications)
      .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id));
  }

  // Mobile device operations
  async getMobileDevices(userId?: string): Promise<MobileDevice[]> {
    if (userId) {
      return await db.select().from(mobileDevices)
        .where(and(eq(mobileDevices.userId, userId), eq(mobileDevices.isActive, true)))
        .orderBy(desc(mobileDevices.lastUsed));
    }
    return await db.select().from(mobileDevices)
      .where(eq(mobileDevices.isActive, true))
      .orderBy(desc(mobileDevices.lastUsed));
  }

  async createMobileDevice(device: InsertMobileDevice): Promise<MobileDevice> {
    const [newDevice] = await db.insert(mobileDevices).values(device).returning();
    return newDevice;
  }

  async updateMobileDevice(id: string, device: Partial<InsertMobileDevice>): Promise<MobileDevice> {
    const [updatedDevice] = await db
      .update(mobileDevices)
      .set({ ...device, updatedAt: new Date() })
      .where(eq(mobileDevices.id, id))
      .returning();
    return updatedDevice;
  }

  async deleteMobileDevice(id: string): Promise<void> {
    await db.update(mobileDevices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(mobileDevices.id, id));
  }

  async deactivateUserDevices(userId: string): Promise<void> {
    await db.update(mobileDevices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(mobileDevices.userId, userId));
  }

  // System settings operations
  async getSystemSettings(category?: string): Promise<SystemSetting[]> {
    if (category) {
      return await db.select().from(systemSettings)
        .where(eq(systemSettings.category, category))
        .orderBy(systemSettings.key);
    }
    return await db.select().from(systemSettings)
      .orderBy(systemSettings.category, systemSettings.key);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [updatedSetting] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return updatedSetting;
  }

  // Shift templates and change requests operations
  async getShiftTemplates(): Promise<ShiftTemplate[]> {
    return await db.select().from(shiftTemplates)
      .where(eq(shiftTemplates.isActive, true))
      .orderBy(desc(shiftTemplates.createdAt));
  }

  async createShiftTemplate(template: InsertShiftTemplate): Promise<ShiftTemplate> {
    const [newTemplate] = await db.insert(shiftTemplates).values(template).returning();
    return newTemplate;
  }

  async deleteShiftTemplate(id: string): Promise<void> {
    await db.update(shiftTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(shiftTemplates.id, id));
  }

  async getShiftChangeRequests(status?: string): Promise<ShiftChangeRequestWithRelations[]> {
    let baseQuery = db
      .select({
        id: shiftChangeRequests.id,
        requesterId: shiftChangeRequests.requesterId,
        originalShiftId: shiftChangeRequests.originalShiftId,
        proposedShiftId: shiftChangeRequests.proposedShiftId,
        targetPersonnelId: shiftChangeRequests.targetPersonnelId,
        reason: shiftChangeRequests.reason,
        status: shiftChangeRequests.status,
        approvedBy: shiftChangeRequests.approvedBy,
        approvedAt: shiftChangeRequests.approvedAt,
        rejectionReason: shiftChangeRequests.rejectionReason,
        createdAt: shiftChangeRequests.createdAt,
        updatedAt: shiftChangeRequests.updatedAt,
        requester: personnel,
        originalShift: shiftAssignments,
        proposedShift: {
          id: shiftAssignments.id,
          personnelId: shiftAssignments.personnelId,
          shiftId: shiftAssignments.shiftId,
          date: shiftAssignments.date,
          isActive: shiftAssignments.isActive,
          createdAt: shiftAssignments.createdAt,
          updatedAt: shiftAssignments.updatedAt,
        },
        targetPersonnel: {
          id: personnel.id,
          userId: personnel.userId,
          employeeId: personnel.employeeId,
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          email: personnel.email,
          phone: personnel.phone,
          tcNo: personnel.tcNo,
          dateOfBirth: personnel.dateOfBirth,
          address: personnel.address,
          departmentId: personnel.departmentId,
          branchId: personnel.branchId,
          position: personnel.position,
          salary: personnel.salary,
          hireDate: personnel.hireDate,
          terminationDate: personnel.terminationDate,
          status: personnel.status,
          createdAt: personnel.createdAt,
          updatedAt: personnel.updatedAt,
        },
        approver: users,
      })
      .from(shiftChangeRequests)
      .leftJoin(personnel, eq(shiftChangeRequests.requesterId, personnel.id))
      .leftJoin(shiftAssignments, eq(shiftChangeRequests.originalShiftId, shiftAssignments.id))
      .leftJoin(users, eq(shiftChangeRequests.approvedBy, users.id));

    if (status) {
      baseQuery = baseQuery.where(eq(shiftChangeRequests.status, status)) as any;
    }

    const result = await baseQuery.orderBy(desc(shiftChangeRequests.createdAt));
    
    return result.map(row => ({
      ...row,
      requester: row.requester || undefined,
      originalShift: row.originalShift || undefined,
      proposedShift: row.proposedShift || undefined,
      targetPersonnel: row.targetPersonnel || undefined,
      approver: row.approver || undefined
    }));
  }

  async createShiftChangeRequest(request: InsertShiftChangeRequest): Promise<ShiftChangeRequest> {
    const [newRequest] = await db.insert(shiftChangeRequests).values(request).returning();
    return newRequest;
  }

  async updateShiftChangeRequest(id: string, request: Partial<InsertShiftChangeRequest>): Promise<ShiftChangeRequest> {
    const [updatedRequest] = await db
      .update(shiftChangeRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(shiftChangeRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Security operations implementation
  async logSecurityEvent(event: InsertSecurityLog): Promise<void> {
    await db.insert(securityLogs).values(event);
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)))
      .orderBy(desc(userSessions.lastActivity));
  }

  async terminateUserSession(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async terminateAllUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  async createUserDevice(device: InsertUserDevice): Promise<UserDevice> {
    const [newDevice] = await db.insert(userDevices).values(device).returning();
    return newDevice;
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastUsed));
  }

  async updateDeviceTrusted(deviceId: string, trusted: boolean): Promise<void> {
    await db
      .update(userDevices)
      .set({ isTrusted: trusted })
      .where(eq(userDevices.id, deviceId));
  }

  async removeUserDevice(deviceId: string): Promise<void> {
    await db.delete(userDevices).where(eq(userDevices.id, deviceId));
  }

  async logLoginAttempt(attempt: InsertLoginAttempt): Promise<void> {
    await db.insert(loginAttempts).values(attempt);
  }

  async getRecentLoginAttempts(ipAddress: string): Promise<LoginAttempt[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ipAddress, ipAddress),
          sql`${loginAttempts.attemptedAt} >= ${thirtyMinutesAgo}`
        )
      )
      .orderBy(desc(loginAttempts.attemptedAt));
  }

  async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user with 2FA enabled
      await tx
        .update(users)
        .set({ 
          twoFactorEnabled: true, 
          twoFactorSecret: secret,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Insert backup codes
      const backupCodeRecords = backupCodes.map(code => ({
        userId,
        code,
        used: false,
      }));
      await tx.insert(twoFactorBackupCodes).values(backupCodeRecords);

      // Log security event
      await tx.insert(securityLogs).values({
        userId,
        eventType: "2fa_enabled",
        eventLevel: "info",
        success: true,
      });
    });
  }

  async disable2FA(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user with 2FA disabled
      await tx
        .update(users)
        .set({ 
          twoFactorEnabled: false, 
          twoFactorSecret: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Remove backup codes
      await tx.delete(twoFactorBackupCodes).where(eq(twoFactorBackupCodes.userId, userId));

      // Log security event
      await tx.insert(securityLogs).values({
        userId,
        eventType: "2fa_disabled",
        eventLevel: "warning",
        success: true,
      });
    });
  }

  async verify2FABackupCode(userId: string, code: string): Promise<boolean> {
    const result = await db.transaction(async (tx) => {
      const [backupCode] = await tx
        .select()
        .from(twoFactorBackupCodes)
        .where(
          and(
            eq(twoFactorBackupCodes.userId, userId),
            eq(twoFactorBackupCodes.code, code),
            eq(twoFactorBackupCodes.used, false)
          )
        );

      if (!backupCode) {
        return false;
      }

      // Mark backup code as used
      await tx
        .update(twoFactorBackupCodes)
        .set({ used: true, usedAt: new Date() })
        .where(eq(twoFactorBackupCodes.id, backupCode.id));

      // Log security event
      await tx.insert(securityLogs).values({
        userId,
        eventType: "2fa_backup_code_used",
        eventLevel: "info",
        success: true,
      });

      return true;
    });

    return result;
  }

  async getSecurityLogs(userId?: string, limit: number = 100): Promise<SecurityLog[]> {
    if (userId) {
      return await db.select()
        .from(securityLogs)
        .where(eq(securityLogs.userId, userId))
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit);
    } else {
      return await db.select()
        .from(securityLogs)
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit);
    }
  }
}

export const storage = new DatabaseStorage();
