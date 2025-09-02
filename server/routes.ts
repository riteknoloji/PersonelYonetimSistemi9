import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPersonnelSchema, 
  insertDepartmentSchema, 
  insertBranchSchema,
  insertLeaveRequestSchema,
  insertLeaveTypeSchema,
  insertShiftSchema,
  insertShiftAssignmentSchema,
  insertAttendanceRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Department routes
  app.get('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // Branch routes
  app.get('/api/branches', isAuthenticated, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post('/api/branches', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // Personnel routes
  app.get('/api/personnel', isAuthenticated, async (req, res) => {
    try {
      const personnel = await storage.getPersonnel();
      res.json(personnel);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      res.status(500).json({ message: "Failed to fetch personnel" });
    }
  });

  app.get('/api/personnel/:id', isAuthenticated, async (req, res) => {
    try {
      const personnel = await storage.getPersonnelById(req.params.id);
      if (!personnel) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.json(personnel);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      res.status(500).json({ message: "Failed to fetch personnel" });
    }
  });

  app.post('/api/personnel', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPersonnelSchema.parse(req.body);
      const personnel = await storage.createPersonnel(validatedData);
      res.status(201).json(personnel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating personnel:", error);
      res.status(500).json({ message: "Failed to create personnel" });
    }
  });

  app.put('/api/personnel/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPersonnelSchema.partial().parse(req.body);
      const personnel = await storage.updatePersonnel(req.params.id, validatedData);
      res.json(personnel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating personnel:", error);
      res.status(500).json({ message: "Failed to update personnel" });
    }
  });

  app.delete('/api/personnel/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePersonnel(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting personnel:", error);
      res.status(500).json({ message: "Failed to delete personnel" });
    }
  });

  // Leave request routes
  app.get('/api/leave-requests', isAuthenticated, async (req, res) => {
    try {
      const leaveRequests = await storage.getLeaveRequests();
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post('/api/leave-requests', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      const leaveRequest = await storage.createLeaveRequest(validatedData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.put('/api/leave-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.partial().parse(req.body);
      const leaveRequest = await storage.updateLeaveRequest(req.params.id, validatedData);
      res.json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Leave types routes
  app.get('/api/leave-types', isAuthenticated, async (req, res) => {
    try {
      const leaveTypes = await storage.getLeaveTypes();
      res.json(leaveTypes);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      res.status(500).json({ message: "Failed to fetch leave types" });
    }
  });

  app.post('/api/leave-types', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeaveTypeSchema.parse(req.body);
      const leaveType = await storage.createLeaveType(validatedData);
      res.status(201).json(leaveType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating leave type:", error);
      res.status(500).json({ message: "Failed to create leave type" });
    }
  });

  // Shift routes
  app.get('/api/shifts', isAuthenticated, async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post('/api/shifts', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  // Shift assignment routes
  app.get('/api/shift-assignments', isAuthenticated, async (req, res) => {
    try {
      const date = req.query.date as string;
      const assignments = await storage.getShiftAssignments(date);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching shift assignments:", error);
      res.status(500).json({ message: "Failed to fetch shift assignments" });
    }
  });

  app.post('/api/shift-assignments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShiftAssignmentSchema.parse(req.body);
      const assignment = await storage.createShiftAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating shift assignment:", error);
      res.status(500).json({ message: "Failed to create shift assignment" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const date = req.query.date as string;
      const records = await storage.getAttendanceRecords(date);
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating attendance record:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
