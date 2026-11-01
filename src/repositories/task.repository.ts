import { pool } from "../db/pool.js";
import type { Task } from "../types/domain.js";
import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "../validators/task.validator.js";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
};

const mapTask = (r: TaskRow): Task => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  description: r.description,
  status: r.status,
  priority: r.priority,
  dueDate: r.due_date,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const columns = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  dueDate: "due_date",
  priority: "priority",
  title: "title",
} as const;

export const taskRepository = {
  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const r = await pool.query<TaskRow>(
      `INSERT INTO tasks(user_id,title,description,status,priority,due_date) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        userId,
        input.title,
        input.description ?? null,
        input.status,
        input.priority,
        input.dueDate ?? null,
      ],
    );
    return mapTask(r.rows[0]!);
  },

  async list(
    userId: string,
    query: TaskQuery,
  ): Promise<{ tasks: Task[]; total: number }> {
    const values: (string | number)[] = [userId];
    const filters = ["user_id=$1", "deleted_at IS NULL"];
    if (query.status) {
      values.push(query.status);
      filters.push(`status=$${values.length}`);
    }

    if (query.priority) {
      values.push(query.priority);
      filters.push(`priority=$${values.length}`);
    }

    if (query.search) {
      values.push(`%${query.search}%`);
      filters.push(
        `(title ILIKE $${values.length} OR description ILIKE $${values.length})`,
      );
    }

    const where = filters.join(" AND ");
    const sortColumn = columns[query.sortBy];
    const direction = query.order === "asc" ? "ASC" : "DESC";
    const pageValues = [...values, query.limit, (query.page - 1) * query.limit];
    const [rows, count] = await Promise.all([
      pool.query<TaskRow>(
        `SELECT * FROM tasks WHERE ${where} ORDER BY ${sortColumn} ${direction} NULLS LAST,id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        pageValues,
      ),
      pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM tasks WHERE ${where}`,
        values,
      ),
    ]);
    return {
      tasks: rows.rows.map(mapTask),
      total: Number(count.rows[0]?.total ?? 0),
    };
  },

  async findById(userId: string, id: string): Promise<Task | null> {
    const r = await pool.query<TaskRow>(
      "SELECT * FROM tasks WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
      [id, userId],
    );
    return r.rows[0] ? mapTask(r.rows[0]) : null;
  },

  async update(
    userId: string,
    id: string,
    input: UpdateTaskInput,
  ): Promise<Task | null> {
    const fields: string[] = [];
    const values: (string | null)[] = [id, userId];
    const mapping = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      dueDate: "due_date",
    } as const;

    for (const key of Object.keys(mapping) as (keyof typeof mapping)[]) {
      const value = input[key];
      if (value !== undefined) {
        values.push(value);
        fields.push(`${mapping[key]}=$${values.length}`);
      }
    }

    if (!fields.length) return this.findById(userId, id);

    fields.push("updated_at=NOW()");
    const r = await pool.query<TaskRow>(
      `UPDATE tasks SET ${fields.join(",")} WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING *`,
      values,
    );

    return r.rows[0] ? mapTask(r.rows[0]) : null;
  },

  async softDelete(userId: string, id: string): Promise<boolean> {
    const r = await pool.query(
      "UPDATE tasks SET deleted_at=NOW(),updated_at=NOW() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
      [id, userId],
    );
    return (r.rowCount ?? 0) > 0;
  },

  async stats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    const r = await pool.query<{
      total: string;
      pending: string;
      in_progress: string;
      completed: string;
      overdue: string;
    }>(
      `SELECT COUNT(*) total, COUNT(*) FILTER(WHERE status='Pending') pending, COUNT(*) FILTER(WHERE status='InProgress') in_progress, COUNT(*) FILTER(WHERE status='Completed') completed, COUNT(*) FILTER(WHERE due_date < NOW() AND status <> 'Completed') overdue FROM tasks WHERE user_id=$1 AND deleted_at IS NULL`,
      [userId],
    );
    const x = r.rows[0]!;
    return {
      total: Number(x.total),
      pending: Number(x.pending),
      inProgress: Number(x.in_progress),
      completed: Number(x.completed),
      overdue: Number(x.overdue),
    };
  },
};
