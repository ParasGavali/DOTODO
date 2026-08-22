"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Task {
  _id: string;
  spaceId: string;
  projectId?: string;
  parentTaskId?: string;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  dueDate?: string;
  dueTime?: string;
  recurrence?: { type: string; interval: number; daysOfWeek?: number[]; endDate?: string };
  reminderAt?: string;
  estimatedMinutes?: number;
  labels: string[];
  position: number;
  notes: string;
  completedAt?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  spaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: number;
  archived: boolean;
}

export interface Label {
  _id: string;
  spaceId: string;
  name: string;
  color: string;
}

export function useTasks(filters?: { projectId?: string; completed?: boolean; inbox?: boolean }) {
  return useQuery<Task[]>({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectId) params.set("projectId", filters.projectId);
      if (filters?.completed !== undefined) params.set("completed", String(filters.completed));
      if (filters?.inbox) params.set("inbox", "true");
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; projectId?: string; priority?: number; dueDate?: string; dueTime?: string; labels?: string[]; parentTaskId?: string }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Task>) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete task");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; icon?: string; color?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useLabels() {
  return useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: async () => {
      const res = await fetch("/api/labels");
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json();
    },
  });
}

export function useCreateLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labels"] }),
  });
}
