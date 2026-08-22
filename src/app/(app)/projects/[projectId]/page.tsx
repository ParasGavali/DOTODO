"use client";

import { use } from "react";
import { useTasks, useProjects, useUpdateTask } from "@/hooks/use-data";
import { useUIStore } from "@/stores/ui-store";
import { TaskItem } from "@/components/task/task-item";
import { TaskInput } from "@/components/task/task-input";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTasks({ projectId, completed: false });

  const project = projects?.find((p) => p._id === projectId);

  return (
    <div className="px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: project?.color }}>
          {project?.name || "Project"}
        </h1>
        {project?.description && <p className="mt-1 text-sm text-text-muted">{project.description}</p>}
      </div>

      <div className="pb-4 border-b border-border">
        <TaskInput projectId={projectId} placeholder="Add a task to this project..." />
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-1" />)}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-0.5 py-4">
          {tasks.map((task) => <TaskItem key={task._id} task={task} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl opacity-20">&#x1F4CB;</div>
          <p className="text-sm text-text-dim">No tasks yet.</p>
        </div>
      )}
    </div>
  );
}
