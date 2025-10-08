import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export function TaskList() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/app/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/app/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/app/tasks"] });
      setNewTaskTitle("");
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/app/tasks/${taskId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to complete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/app/tasks"] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle.trim());
    }
  };

  const handleToggleTask = (task: Task) => {
    if (task.status === "pending") {
      completeTaskMutation.mutate(task.id);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage your to-do list</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={createTaskMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {isLoading ? (
          <div className="text-muted-foreground">Loading tasks...</div>
        ) : error ? (
          <div className="text-destructive">Error loading tasks</div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No tasks yet. Add one above!
              </div>
            ) : (
              <>
                {pendingTasks.length > 0 && (
                  <div className="space-y-2">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleToggleTask(task)}
                          disabled={completeTaskMutation.isPending}
                        />
                        <span className="flex-1">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {completedTasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed ({completedTasks.length})
                    </div>
                    {completedTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 opacity-60">
                        <Checkbox checked={true} disabled />
                        <span className="flex-1 line-through">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
