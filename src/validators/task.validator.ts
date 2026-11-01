import { z } from "zod";

const status = z.enum(["Pending", "InProgress", "Completed"]);
const priority = z.enum(["Low", "Medium", "High"]);
const dueDate = z.iso.datetime({ offset: true });

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5000).nullable().optional(),
  status: status.default("Pending"),
  priority: priority.default("Low"),
  dueDate: dueDate.nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: dueDate.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: status.optional(),
  priority: priority.optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority", "title"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
