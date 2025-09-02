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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  getShiftAssignments(date?: string): Promise<ShiftAssignmentWithRelations[]>;
  createShiftAssignment(assignment: InsertShiftAssignment): Promise<ShiftAssignment>;
  
  // Attendance operations
  getAttendanceRecords(date?: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  
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
    return await db.select().from(leaveTypes).where(eq(leaveTypes.isActive, true));
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
      baseQuery = baseQuery.where(eq(shiftAssignments.isActive, true));
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
}

export const storage = new DatabaseStorage();
