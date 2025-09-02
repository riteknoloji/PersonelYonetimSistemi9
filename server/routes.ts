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
      let leaveTypes = await storage.getLeaveTypes();
      
      // Eğer hiç izin türü yoksa varsayılan olanları ekle
      if (leaveTypes.length === 0) {
        const defaultTypes = [
          { name: "Yıllık İzin", description: "Çalışanın yıllık izin hakkı", maxDays: "20", isActive: true },
          { name: "Hastalık İzni", description: "Sağlık sorunu nedeniyle alınan izin", maxDays: "30", isActive: true },
          { name: "Doğum İzni", description: "Doğum öncesi ve sonrası izin", maxDays: "98", isActive: true },
          { name: "Babalık İzni", description: "Baba adayları için izin", maxDays: "10", isActive: true },
          { name: "Acil Durum İzni", description: "Acil durumlarda alınan kısa süreli izin", maxDays: "3", isActive: true }
        ];
        
        for (const typeData of defaultTypes) {
          await storage.createLeaveType(typeData);
        }
        
        leaveTypes = await storage.getLeaveTypes();
      }
      
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
      let shifts = await storage.getShifts();
      
      // Eğer hiç vardiya yoksa varsayılan olanları ekle
      if (shifts.length === 0) {
        const defaultShifts = [
          { 
            name: "Sabah Vardiyası", 
            description: "Normal mesai sabah vardiyası", 
            startTime: "08:00", 
            endTime: "17:00", 
            workingHours: "8", 
            isActive: true 
          },
          { 
            name: "Öğle Vardiyası", 
            description: "Öğle vardiyası", 
            startTime: "12:00", 
            endTime: "21:00", 
            workingHours: "8", 
            isActive: true 
          },
          { 
            name: "Gece Vardiyası", 
            description: "Gece vardiyası", 
            startTime: "22:00", 
            endTime: "06:00", 
            workingHours: "8", 
            isActive: true 
          }
        ];
        
        for (const shiftData of defaultShifts) {
          await storage.createShift(shiftData);
        }
        
        shifts = await storage.getShifts();
      }
      
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

  app.delete('/api/shifts/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteShift(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shift:", error);
      res.status(500).json({ message: "Failed to delete shift" });
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

  app.delete('/api/shift-assignments/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteShiftAssignment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shift assignment:", error);
      res.status(500).json({ message: "Failed to delete shift assignment" });
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
