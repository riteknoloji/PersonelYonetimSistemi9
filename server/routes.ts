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
  insertAttendanceRecordSchema,
  insertQrCodeSchema,
  insertEducationRecordSchema,
  insertHealthRecordSchema,
  insertDocumentSchema,
  insertPerformanceEvaluationSchema,
  insertCalendarEventSchema,
  insertNotificationSchema,
  insertHolidaySchema
} from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import { createHash } from "crypto";

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

  // Enhanced Leave Management endpoints

  // Check for leave conflicts before approval
  app.post('/api/leave-requests/:id/check-conflicts', isAuthenticated, async (req, res) => {
    try {
      const leaveRequestId = req.params.id;
      
      // Get the leave request details
      const allLeaveRequests = await storage.getLeaveRequests();
      const leaveRequest = allLeaveRequests.find(lr => lr.id === leaveRequestId);
      
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check for conflicts with approved leave requests
      const conflicts = allLeaveRequests.filter(lr => 
        lr.id !== leaveRequestId &&
        lr.personnelId === leaveRequest.personnelId &&
        lr.status === 'approved' &&
        (
          // Check if dates overlap
          (new Date(lr.startDate) <= new Date(leaveRequest.endDate) &&
           new Date(lr.endDate) >= new Date(leaveRequest.startDate))
        )
      );

      // Check minimum staff requirements
      const sameDate = allLeaveRequests.filter(lr => 
        lr.id !== leaveRequestId &&
        lr.status === 'approved' &&
        (
          (new Date(lr.startDate) <= new Date(leaveRequest.endDate) &&
           new Date(lr.endDate) >= new Date(leaveRequest.startDate))
        )
      );

      const allPersonnel = await storage.getPersonnel();
      const totalStaff = allPersonnel.length;
      const staffOnLeave = sameDate.length;
      const availableStaff = totalStaff - staffOnLeave;
      const minimumRequired = Math.ceil(totalStaff * 0.3); // 30% minimum coverage

      const hasConflicts = conflicts.length > 0;
      const hasStaffingIssues = availableStaff < minimumRequired;

      res.json({
        hasConflicts,
        conflicts: conflicts.map(c => ({
          id: c.id,
          startDate: c.startDate,
          endDate: c.endDate,
          leaveType: c.leaveTypeId
        })),
        hasStaffingIssues,
        staffingInfo: {
          totalStaff,
          staffOnLeave,
          availableStaff,
          minimumRequired
        },
        canApprove: !hasConflicts && !hasStaffingIssues
      });
    } catch (error) {
      console.error("Error checking leave conflicts:", error);
      res.status(500).json({ message: "Failed to check leave conflicts" });
    }
  });

  // Get employee leave balance and usage
  app.get('/api/leave-balance/:personnelId', isAuthenticated, async (req, res) => {
    try {
      const personnelId = req.params.personnelId;
      const { year } = req.query as { year?: string };
      const targetYear = year || new Date().getFullYear().toString();

      // Get all leave types
      const leaveTypes = await storage.getLeaveTypes();
      
      // Get all approved leave requests for this employee in the year
      const allLeaveRequests = await storage.getLeaveRequests();
      const employeeLeaves = allLeaveRequests.filter(lr => 
        lr.personnelId === personnelId &&
        lr.status === 'approved' &&
        new Date(lr.startDate).getFullYear().toString() === targetYear
      );

      // Calculate balance for each leave type
      const balances = leaveTypes.map(leaveType => {
        const usedDays = employeeLeaves
          .filter(lr => lr.leaveTypeId === leaveType.id)
          .reduce((total, lr) => {
            const startDate = new Date(lr.startDate);
            const endDate = new Date(lr.endDate);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
            return total + diffDays;
          }, 0);

        const entitledDays = leaveType.maxDaysPerYear || 0;
        const remainingDays = Math.max(0, entitledDays - usedDays);
        
        // Calculate carry-over from previous year (max 5 days for annual leave)
        const carryOverDays = leaveType.name.toLowerCase().includes('yıllık') ? 
          Math.min(5, remainingDays) : 0;

        return {
          leaveType: {
            id: leaveType.id,
            name: leaveType.name,
            maxDaysPerYear: entitledDays
          },
          usedDays,
          remainingDays,
          carryOverDays,
          totalAvailable: remainingDays + carryOverDays
        };
      });

      res.json({
        personnelId,
        year: targetYear,
        balances,
        totalUsedDays: employeeLeaves.reduce((total, lr) => {
          const startDate = new Date(lr.startDate);
          const endDate = new Date(lr.endDate);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return total + diffDays;
        }, 0)
      });
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      res.status(500).json({ message: "Failed to fetch leave balance" });
    }
  });

  // Get department coverage report
  app.get('/api/leave-coverage/:departmentId', isAuthenticated, async (req, res) => {
    try {
      const departmentId = req.params.departmentId;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      // Get all personnel in the department
      const allPersonnel = await storage.getPersonnel();
      const departmentPersonnel = allPersonnel.filter(p => p.departmentId === departmentId);
      
      // Get all approved leave requests in the date range
      const allLeaveRequests = await storage.getLeaveRequests();
      const relevantLeaves = allLeaveRequests.filter(lr => 
        lr.status === 'approved' &&
        departmentPersonnel.some(p => p.id === lr.personnelId) &&
        (new Date(lr.startDate) <= new Date(endDate) &&
         new Date(lr.endDate) >= new Date(startDate))
      );

      // Calculate daily coverage
      const coverage = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        const currentDateStr = current.toISOString().split('T')[0];
        
        const onLeave = relevantLeaves.filter(lr => 
          new Date(lr.startDate) <= current && 
          new Date(lr.endDate) >= current
        );

        const available = departmentPersonnel.length - onLeave.length;
        const coveragePercentage = Math.round((available / departmentPersonnel.length) * 100);

        coverage.push({
          date: currentDateStr,
          totalStaff: departmentPersonnel.length,
          onLeave: onLeave.length,
          available,
          coveragePercentage,
          isAdequate: coveragePercentage >= 70, // 70% minimum coverage
          onLeaveDetails: onLeave.map(lr => ({
            personnelId: lr.personnelId,
            personnelName: departmentPersonnel.find(p => p.id === lr.personnelId)?.firstName + ' ' + 
                          departmentPersonnel.find(p => p.id === lr.personnelId)?.lastName,
            leaveType: lr.leaveTypeId
          }))
        });

        current.setDate(current.getDate() + 1);
      }

      res.json({
        departmentId,
        dateRange: { startDate, endDate },
        totalPersonnel: departmentPersonnel.length,
        coverage,
        summary: {
          averageCoverage: Math.round(coverage.reduce((sum, day) => sum + day.coveragePercentage, 0) / coverage.length),
          criticalDays: coverage.filter(day => day.coveragePercentage < 70).length,
          adequateDays: coverage.filter(day => day.coveragePercentage >= 70).length
        }
      });
    } catch (error) {
      console.error("Error calculating leave coverage:", error);
      res.status(500).json({ message: "Failed to calculate leave coverage" });
    }
  });

  // Enhanced leave validation before creation/approval
  app.post('/api/leave-requests/validate', isAuthenticated, async (req, res) => {
    try {
      const { personnelId, leaveTypeId, startDate, endDate } = req.body;

      if (!personnelId || !leaveTypeId || !startDate || !endDate) {
        return res.status(400).json({ message: "All fields are required for validation" });
      }

      const validationResults = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
        info: [] as string[]
      };

      // Check date validity
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        validationResults.isValid = false;
        validationResults.errors.push("Başlangıç tarihi bitiş tarihinden sonra olamaz");
      }

      if (start < new Date()) {
        validationResults.warnings.push("Geçmiş tarih için izin talebi oluşturuyorsunuz");
      }

      // Check leave duration
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 30) {
        validationResults.warnings.push("30 günden uzun izin talepleri özel onay gerektirebilir");
      }

      // Check employee balance
      const leaveTypes = await storage.getLeaveTypes();
      const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
      
      if (leaveType) {
        const allLeaveRequests = await storage.getLeaveRequests();
        const currentYear = start.getFullYear().toString();
        
        const employeeLeaves = allLeaveRequests.filter(lr => 
          lr.personnelId === personnelId &&
          lr.status === 'approved' &&
          new Date(lr.startDate).getFullYear().toString() === currentYear
        );

        const usedDays = employeeLeaves
          .filter(lr => lr.leaveTypeId === leaveTypeId)
          .reduce((total, lr) => {
            const s = new Date(lr.startDate);
            const e = new Date(lr.endDate);
            const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return total + days;
          }, 0);

        const maxDays = leaveType.maxDaysPerYear || 0;
        const remainingDays = maxDays - usedDays;

        if (diffDays > remainingDays) {
          validationResults.isValid = false;
          validationResults.errors.push(`Yeterli izin bakiyeniz yok. Kalan: ${remainingDays} gün, Talep edilen: ${diffDays} gün`);
        } else if (diffDays > remainingDays * 0.8) {
          validationResults.warnings.push(`İzin bakiyenizin büyük kısmını kullanacaksınız. Kalan: ${remainingDays} gün`);
        }

        validationResults.info.push(`${leaveType.name} - Kullanılan: ${usedDays}/${maxDays} gün`);
      }

      // Check for conflicts
      const allLeaveRequests = await storage.getLeaveRequests();
      const conflicts = allLeaveRequests.filter(lr => 
        lr.personnelId === personnelId &&
        lr.status === 'approved' &&
        (new Date(lr.startDate) <= end && new Date(lr.endDate) >= start)
      );

      if (conflicts.length > 0) {
        validationResults.isValid = false;
        validationResults.errors.push("Seçtiğiniz tarihler mevcut izinlerinizle çakışıyor");
      }

      res.json(validationResults);
    } catch (error) {
      console.error("Error validating leave request:", error);
      res.status(500).json({ message: "Failed to validate leave request" });
    }
  });

  // Enhanced Shift Management endpoints

  // Shift Templates
  app.get('/api/shift-templates', isAuthenticated, async (req, res) => {
    try {
      // Predefined shift templates
      const templates = [
        {
          id: 'morning-shift',
          name: 'Sabah Vardiyası',
          description: 'Standart sabah vardiyası',
          startTime: '08:00',
          endTime: '16:00',
          workingHours: '8',
          color: '#3B82F6', // Blue
          isDefault: true
        },
        {
          id: 'afternoon-shift',
          name: 'Öğleden Sonra Vardiyası',
          description: 'Öğleden sonra vardiyası',
          startTime: '16:00',
          endTime: '00:00',
          workingHours: '8',
          color: '#F59E0B', // Yellow
          isDefault: true
        },
        {
          id: 'night-shift',
          name: 'Gece Vardiyası',
          description: 'Gece vardiyası',
          startTime: '00:00',
          endTime: '08:00',
          workingHours: '8',
          color: '#6366F1', // Indigo
          isDefault: true
        },
        {
          id: 'part-time-morning',
          name: 'Yarı Zamanlı Sabah',
          description: 'Yarı zamanlı sabah vardiyası',
          startTime: '09:00',
          endTime: '13:00',
          workingHours: '4',
          color: '#10B981', // Green
          isDefault: false
        },
        {
          id: 'part-time-afternoon',
          name: 'Yarı Zamanlı Öğleden Sonra',
          description: 'Yarı zamanlı öğleden sonra vardiyası',
          startTime: '14:00',
          endTime: '18:00',
          workingHours: '4',
          color: '#F97316', // Orange
          isDefault: false
        },
        {
          id: 'weekend-shift',
          name: 'Hafta Sonu Vardiyası',
          description: 'Hafta sonu özel vardiyası',
          startTime: '10:00',
          endTime: '18:00',
          workingHours: '8',
          color: '#8B5CF6', // Purple
          isDefault: false
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error("Error fetching shift templates:", error);
      res.status(500).json({ message: "Failed to fetch shift templates" });
    }
  });

  // Bulk shift assignment from template
  app.post('/api/shift-assignments/bulk', isAuthenticated, async (req, res) => {
    try {
      const { assignments, templateId } = req.body;

      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({ message: "assignments array is required" });
      }

      const results = [];
      const errors = [];

      for (const assignment of assignments) {
        try {
          const shiftAssignment = await storage.createShiftAssignment({
            personnelId: assignment.personnelId,
            shiftId: assignment.shiftId,
            date: assignment.date,
            isActive: true
          });
          results.push(shiftAssignment);
        } catch (error) {
          errors.push({
            personnelId: assignment.personnelId,
            date: assignment.date,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        message: `${results.length} atama başarıyla oluşturuldu`,
        successCount: results.length,
        errorCount: errors.length,
        assignments: results,
        errors: errors
      });
    } catch (error) {
      console.error("Error creating bulk assignments:", error);
      res.status(500).json({ message: "Failed to create bulk assignments" });
    }
  });

  // Shift change requests
  app.get('/api/shift-change-requests', isAuthenticated, async (req, res) => {
    try {
      // This would typically fetch from a shift_change_requests table
      // For now, return empty array as the table doesn't exist yet
      const changeRequests = [];
      res.json(changeRequests);
    } catch (error) {
      console.error("Error fetching shift change requests:", error);
      res.status(500).json({ message: "Failed to fetch shift change requests" });
    }
  });

  app.post('/api/shift-change-requests', isAuthenticated, async (req, res) => {
    try {
      const { originalAssignmentId, requestedShiftId, requestedDate, reason } = req.body;
      const userId = req.user?.claims?.sub;

      // For now, we'll simulate this functionality
      // In a real implementation, you'd store this in a shift_change_requests table
      const changeRequest = {
        id: `change-${Date.now()}`,
        originalAssignmentId,
        requestedShiftId,
        requestedDate,
        reason,
        requesterId: userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message: "Vardiya değişiklik talebi başarıyla oluşturuldu"
      };

      res.status(201).json(changeRequest);
    } catch (error) {
      console.error("Error creating shift change request:", error);
      res.status(500).json({ message: "Failed to create shift change request" });
    }
  });

  // Enhanced shift calendar data
  app.get('/api/shift-calendar', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      // Get all shift assignments in date range
      const allAssignments = await storage.getShiftAssignments();
      const assignments = allAssignments.filter(assignment => 
        assignment.date >= startDate && assignment.date <= endDate
      );

      // Get all shifts for color coding
      const shifts = await storage.getShifts();
      const personnel = await storage.getPersonnel();

      // Enrich assignments with shift and personnel details
      const enrichedAssignments = assignments.map(assignment => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        const person = personnel.find(p => p.id === assignment.personnelId);
        
        return {
          ...assignment,
          shift: {
            id: shift?.id,
            name: shift?.name,
            startTime: shift?.startTime,
            endTime: shift?.endTime,
            color: getShiftColor(shift?.name || '')
          },
          personnel: {
            id: person?.id,
            name: `${person?.firstName || ''} ${person?.lastName || ''}`.trim(),
            position: person?.position
          }
        };
      });

      // Group by date for easier frontend processing
      const calendarData = {};
      enrichedAssignments.forEach(assignment => {
        const date = assignment.date;
        if (!calendarData[date]) {
          calendarData[date] = [];
        }
        calendarData[date].push(assignment);
      });

      res.json({
        startDate,
        endDate,
        assignments: enrichedAssignments,
        calendarData,
        statistics: {
          totalAssignments: enrichedAssignments.length,
          uniquePersonnel: new Set(enrichedAssignments.map(a => a.personnelId)).size,
          shiftsUsed: new Set(enrichedAssignments.map(a => a.shiftId)).size
        }
      });
    } catch (error) {
      console.error("Error fetching shift calendar data:", error);
      res.status(500).json({ message: "Failed to fetch shift calendar data" });
    }
  });

  // Helper function for shift colors
  function getShiftColor(shiftName: string): string {
    const colors = {
      'sabah': '#3B82F6',    // Blue
      'morning': '#3B82F6',   // Blue
      'öğleden': '#F59E0B',   // Yellow
      'afternoon': '#F59E0B', // Yellow
      'gece': '#6366F1',      // Indigo
      'night': '#6366F1',     // Indigo
      'yarı': '#10B981',      // Green
      'part': '#10B981',      // Green
      'hafta': '#8B5CF6',     // Purple
      'weekend': '#8B5CF6'    // Purple
    };

    const lowerName = shiftName.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }
    return '#6B7280'; // Default gray
  }

  // Shift coverage analysis
  app.get('/api/shift-coverage/:date', isAuthenticated, async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get all assignments for the date
      const allAssignments = await storage.getShiftAssignments();
      const dayAssignments = allAssignments.filter(assignment => assignment.date === date);

      // Get shifts and personnel
      const shifts = await storage.getShifts();
      const personnel = await storage.getPersonnel();

      // Calculate coverage for each shift
      const coverageAnalysis = shifts.map(shift => {
        const shiftAssignments = dayAssignments.filter(assignment => 
          assignment.shiftId === shift.id && assignment.isActive
        );
        
        return {
          shift: {
            id: shift.id,
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            color: getShiftColor(shift.name || '')
          },
          assignedPersonnel: shiftAssignments.map(assignment => {
            const person = personnel.find(p => p.id === assignment.personnelId);
            return {
              id: person?.id,
              name: `${person?.firstName || ''} ${person?.lastName || ''}`.trim(),
              position: person?.position
            };
          }),
          assignedCount: shiftAssignments.length,
          requiredCount: 2, // Default requirement - this could be configurable
          coveragePercentage: Math.round((shiftAssignments.length / 2) * 100),
          isAdequate: shiftAssignments.length >= 2
        };
      });

      const totalRequired = coverageAnalysis.reduce((sum, shift) => sum + shift.requiredCount, 0);
      const totalAssigned = coverageAnalysis.reduce((sum, shift) => sum + shift.assignedCount, 0);

      res.json({
        date,
        shifts: coverageAnalysis,
        summary: {
          totalRequired,
          totalAssigned,
          overallCoveragePercentage: totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0,
          adequateShifts: coverageAnalysis.filter(shift => shift.isAdequate).length,
          inadequateShifts: coverageAnalysis.filter(shift => !shift.isAdequate).length
        }
      });
    } catch (error) {
      console.error("Error analyzing shift coverage:", error);
      res.status(500).json({ message: "Failed to analyze shift coverage" });
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

  // QR Code routes
  app.get('/api/qr-codes', isAuthenticated, async (req, res) => {
    try {
      const branchId = req.query.branchId as string;
      const qrCodes = await storage.getQrCodes(branchId);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.post('/api/qr-codes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertQrCodeSchema.parse(req.body);
      
      // Generate unique code value with timestamp and branch info
      const timestamp = Date.now().toString();
      const branchInfo = validatedData.branchId?.slice(-4) || "0000";
      const randomString = Math.random().toString(36).substring(2, 8);
      const codeValue = `QR-${branchInfo}-${timestamp}-${randomString}`;
      
      // Create hash for security
      const securityHash = createHash('sha256')
        .update(`${codeValue}-${validatedData.branchId}-${process.env.QR_SECRET || 'default_secret'}`)
        .digest('hex')
        .substring(0, 16);

      const qrCodeData = {
        ...validatedData,
        codeValue,
        securityHash,
      };

      const qrCode = await storage.createQrCode(qrCodeData);
      
      // Generate QR code image
      try {
        const qrImageData = await QRCode.toDataURL(JSON.stringify({
          code: codeValue,
          branch: validatedData.branchId,
          hash: securityHash,
          timestamp: Date.now()
        }), {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        res.status(201).json({
          ...qrCode,
          qrImage: qrImageData
        });
      } catch (qrError) {
        console.error("Error generating QR image:", qrError);
        res.status(201).json(qrCode);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating QR code:", error);
      res.status(500).json({ message: "Failed to create QR code" });
    }
  });

  app.put('/api/qr-codes/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertQrCodeSchema.partial().parse(req.body);
      const qrCode = await storage.updateQrCode(req.params.id, validatedData);
      res.json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating QR code:", error);
      res.status(500).json({ message: "Failed to update QR code" });
    }
  });

  app.delete('/api/qr-codes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteQrCode(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deactivating QR code:", error);
      res.status(500).json({ message: "Failed to deactivate QR code" });
    }
  });

  // QR Code scanning and attendance
  app.post('/api/qr-codes/scan', isAuthenticated, async (req, res) => {
    try {
      const { qrData, personnelId, type, ipAddress, userAgent } = req.body;

      // Parse QR data
      let scannedData;
      try {
        scannedData = JSON.parse(qrData);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }

      // Validate QR code
      const qrCode = await storage.getActiveQrCodeByValue(scannedData.code);
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found or inactive" });
      }

      // Verify security hash
      const expectedHash = createHash('sha256')
        .update(`${scannedData.code}-${scannedData.branch}-${process.env.QR_SECRET || 'default_secret'}`)
        .digest('hex')
        .substring(0, 16);

      if (scannedData.hash !== expectedHash) {
        return res.status(401).json({ message: "Invalid QR code security hash" });
      }

      // Check if QR code is expired (24 hours validity)
      const qrCodeAge = Date.now() - new Date(qrCode.createdAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (qrCodeAge > maxAge) {
        return res.status(410).json({ message: "QR code expired" });
      }

      // Create attendance record
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      const attendanceRecord = await storage.createAttendanceRecord({
        personnelId,
        date: today,
        timeIn: type === 'entry' ? currentTime : undefined,
        timeOut: type === 'exit' ? currentTime : undefined,
        qrCodeId: qrCode.id,
        ipAddress,
        userAgent,
        location: qrCode.location,
        notes: `QR code scan - ${type}`,
      });

      // Get personnel info for response
      const personnel = await storage.getPersonnelById(personnelId);

      res.json({
        success: true,
        message: `${type === 'entry' ? 'Giriş' : 'Çıkış'} başarıyla kaydedildi`,
        attendanceRecord,
        personnel: personnel ? {
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          employeeId: personnel.employeeId
        } : null,
        timestamp: now.toISOString(),
        location: qrCode.location
      });

    } catch (error) {
      console.error("Error processing QR code scan:", error);
      res.status(500).json({ message: "Failed to process QR code scan" });
    }
  });

  // Generate fresh QR code for a branch
  app.post('/api/qr-codes/:id/regenerate', isAuthenticated, async (req, res) => {
    try {
      const qrCodeId = req.params.id;
      const { pinCode } = req.body;

      // Get existing QR code
      const existingQrCodes = await storage.getQrCodes();
      const existingQrCode = existingQrCodes.find(qr => qr.id === qrCodeId);
      
      if (!existingQrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }

      // Verify PIN if provided and required
      if (existingQrCode.pinCode && existingQrCode.pinCode !== pinCode) {
        return res.status(401).json({ message: "Invalid PIN code" });
      }

      // Generate new code value
      const timestamp = Date.now().toString();
      const branchInfo = existingQrCode.branchId?.slice(-4) || "0000";
      const randomString = Math.random().toString(36).substring(2, 8);
      const newCodeValue = `QR-${branchInfo}-${timestamp}-${randomString}`;
      
      // Create new security hash
      const newSecurityHash = createHash('sha256')
        .update(`${newCodeValue}-${existingQrCode.branchId}-${process.env.QR_SECRET || 'default_secret'}`)
        .digest('hex')
        .substring(0, 16);

      // Update QR code
      const updatedQrCode = await storage.updateQrCode(qrCodeId, {
        codeValue: newCodeValue,
        securityHash: newSecurityHash,
      });

      // Generate new QR image
      const qrImageData = await QRCode.toDataURL(JSON.stringify({
        code: newCodeValue,
        branch: existingQrCode.branchId,
        hash: newSecurityHash,
        timestamp: Date.now()
      }), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.json({
        ...updatedQrCode,
        qrImage: qrImageData,
        message: "QR kod başarıyla yenilendi"
      });

    } catch (error) {
      console.error("Error regenerating QR code:", error);
      res.status(500).json({ message: "Failed to regenerate QR code" });
    }
  });

  // Calendar Events routes
  app.get('/api/calendar/events', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const events = await storage.getCalendarEvents(startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar/events', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      
      // Set organizer to current user
      const userId = req.user?.claims?.sub;
      if (userId) {
        validatedData.organizerId = userId;
      }

      const event = await storage.createCalendarEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put('/api/calendar/events/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.partial().parse(req.body);
      const event = await storage.updateCalendarEvent(req.params.id, validatedData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar/events/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCalendarEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Holidays routes
  app.get('/api/calendar/holidays', isAuthenticated, async (req, res) => {
    try {
      const { year } = req.query as { year?: string };
      const holidays = await storage.getHolidays(year);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  app.post('/api/calendar/holidays', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertHolidaySchema.parse(req.body);
      const holiday = await storage.createHoliday(validatedData);
      res.status(201).json(holiday);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating holiday:", error);
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });

  // Turkish holidays data for 2025
  app.post('/api/calendar/holidays/populate-turkish', isAuthenticated, async (req, res) => {
    try {
      const { year } = req.body;
      const targetYear = year || '2025';

      // Turkish holidays for 2025
      const turkishHolidays = [
        { name: 'Yılbaşı', date: `${targetYear}-01-01`, type: 'public', isRecurring: true },
        { name: 'Ulusal Egemenlik ve Çocuk Bayramı', date: `${targetYear}-04-23`, type: 'public', isRecurring: true },
        { name: 'Emek ve Dayanışma Günü', date: `${targetYear}-05-01`, type: 'public', isRecurring: true },
        { name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', date: `${targetYear}-05-19`, type: 'public', isRecurring: true },
        { name: 'Demokrasi ve Milli Birlik Günü', date: `${targetYear}-07-15`, type: 'public', isRecurring: true },
        { name: 'Zafer Bayramı', date: `${targetYear}-08-30`, type: 'public', isRecurring: true },
        { name: 'Cumhuriyet Bayramı', date: `${targetYear}-10-29`, type: 'public', isRecurring: true },
        
        // Religious holidays for 2025 (approximate dates - these change each year)
        { name: 'Ramazan Bayramı 1. Gün', date: `${targetYear}-03-31`, type: 'religious', isRecurring: false },
        { name: 'Ramazan Bayramı 2. Gün', date: `${targetYear}-04-01`, type: 'religious', isRecurring: false },
        { name: 'Ramazan Bayramı 3. Gün', date: `${targetYear}-04-02`, type: 'religious', isRecurring: false },
        { name: 'Kurban Bayramı 1. Gün', date: `${targetYear}-06-07`, type: 'religious', isRecurring: false },
        { name: 'Kurban Bayramı 2. Gün', date: `${targetYear}-06-08`, type: 'religious', isRecurring: false },
        { name: 'Kurban Bayramı 3. Gün', date: `${targetYear}-06-09`, type: 'religious', isRecurring: false },
        { name: 'Kurban Bayramı 4. Gün', date: `${targetYear}-06-10`, type: 'religious', isRecurring: false },
      ];

      const createdHolidays = [];
      for (const holidayData of turkishHolidays) {
        const holiday = await storage.createHoliday({
          ...holidayData,
          year: targetYear,
          description: `${targetYear} yılı Türkiye resmi tatili`
        });
        createdHolidays.push(holiday);
      }

      res.json({
        message: `${targetYear} yılı Türkiye tatilleri başarıyla eklendi`,
        count: createdHolidays.length,
        holidays: createdHolidays
      });
    } catch (error) {
      console.error("Error populating Turkish holidays:", error);
      res.status(500).json({ message: "Failed to populate Turkish holidays" });
    }
  });

  // Notification System routes
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const { status, type, recipientId } = req.query as { 
        status?: string; 
        type?: string; 
        recipientId?: string; 
      };
      
      const notifications = await storage.getNotifications({ status, type, recipientId });
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      
      // Set sender to current user
      const userId = req.user?.claims?.sub;
      if (userId) {
        validatedData.senderId = userId;
      }

      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.partial().parse(req.body);
      const notification = await storage.updateNotification(req.params.id, validatedData);
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notification = await storage.updateNotification(req.params.id, {
        status: 'read',
        readAt: new Date().toISOString()
      });
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Send notification (immediate send)
  app.post('/api/notifications/:id/send', isAuthenticated, async (req, res) => {
    try {
      const notificationId = req.params.id;
      
      // Get notification details
      const notifications = await storage.getNotifications({ id: notificationId });
      const notification = notifications[0];
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Here you would integrate with SMS/Push notification services
      // For now, we'll just update the status to 'sent'
      const updatedNotification = await storage.updateNotification(notificationId, {
        status: 'sent',
        sentAt: new Date().toISOString()
      });

      res.json({
        ...updatedNotification,
        message: "Bildirim başarıyla gönderildi"
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Send bulk notifications
  app.post('/api/notifications/send-bulk', isAuthenticated, async (req, res) => {
    try {
      const { recipientIds, title, content, type, priority } = req.body;
      
      if (!recipientIds || !Array.isArray(recipientIds) || !title || !content) {
        return res.status(400).json({ 
          message: "recipientIds (array), title ve content alanları gereklidir" 
        });
      }

      const userId = req.user?.claims?.sub;
      const results = [];

      // Create notification for each recipient
      for (const recipientId of recipientIds) {
        const notificationData = {
          title,
          content,
          type: type || 'info',
          priority: priority || 'normal',
          recipientId,
          senderId: userId,
          status: 'sent' as const,
          sentAt: new Date().toISOString()
        };

        const notification = await storage.createNotification(notificationData);
        results.push(notification);
      }

      res.json({
        message: `${results.length} kişiye bildirim gönderildi`,
        count: results.length,
        notifications: results
      });
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      res.status(500).json({ message: "Failed to send bulk notifications" });
    }
  });

  // Notification templates
  app.get('/api/notifications/templates', isAuthenticated, async (req, res) => {
    try {
      // Predefined notification templates
      const templates = [
        {
          id: 'leave-approved',
          name: 'İzin Onaylandı',
          title: 'İzin Başvurunuz Onaylandı',
          content: 'Merhaba {employee_name}, {start_date} - {end_date} tarihleri arası izin başvurunuz onaylanmıştır.',
          type: 'success',
          variables: ['employee_name', 'start_date', 'end_date']
        },
        {
          id: 'leave-rejected',
          name: 'İzin Reddedildi',
          title: 'İzin Başvurunuz Reddedildi',
          content: 'Merhaba {employee_name}, {start_date} - {end_date} tarihleri arası izin başvurunuz reddedilmiştir. Sebep: {reason}',
          type: 'warning',
          variables: ['employee_name', 'start_date', 'end_date', 'reason']
        },
        {
          id: 'shift-reminder',
          name: 'Vardiya Hatırlatması',
          title: 'Vardiya Hatırlatması',
          content: 'Merhaba {employee_name}, yarın {date} tarihinde {start_time}-{end_time} vardiyasınız bulunmaktadır.',
          type: 'info',
          variables: ['employee_name', 'date', 'start_time', 'end_time']
        },
        {
          id: 'document-expiry',
          name: 'Belge Süresi Dolma',
          title: 'Belge Süresi Dolacak',
          content: 'Merhaba {employee_name}, {document_name} belgenizin süresi {expiry_date} tarihinde dolacaktır. Lütfen yenileyiniz.',
          type: 'warning',
          variables: ['employee_name', 'document_name', 'expiry_date']
        },
        {
          id: 'birthday-wish',
          name: 'Doğum Günü Tebriği',
          title: 'Doğum Günün Kutlu Olsun!',
          content: 'Sevgili {employee_name}, doğum gününüz kutlu olsun! Size sağlık, mutluluk ve başarılar dileriz.',
          type: 'celebration',
          variables: ['employee_name']
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ message: "Failed to fetch notification templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
