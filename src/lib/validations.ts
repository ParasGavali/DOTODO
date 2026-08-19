import { z } from "zod";

export const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const accessSpaceSchema = z.object({
  ownerKey: z.string().regex(/^[A-F0-9]{4}-[A-F0-9]{4}$/, "Invalid Owner Key format"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  projectId: z.string().optional(),
  parentTaskId: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  labels: z.array(z.string()).optional(),
  estimatedMinutes: z.number().positive().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.number().min(0).max(4).optional(),
  dueDate: z.string().nullable().optional(),
  dueTime: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  projectId: z.string().nullable().optional(),
  notes: z.string().optional(),
  estimatedMinutes: z.number().positive().nullable().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  color: z.string().optional(),
});
