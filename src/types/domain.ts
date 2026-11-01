export type TaskStatus = "Pending" | "InProgress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
