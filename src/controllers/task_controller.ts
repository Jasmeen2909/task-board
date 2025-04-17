import { Task } from "../dto";
import { supabase } from "../supabaseClient";

export default class TaskController {
  public async getTasks(req: {
    status: string;
    category: string | null;
    dateRange: {
      from: number | null;
      to: number | null;
    };
    limit: number;
    offset: number;
  }): Promise<Array<Task>> {
    const { data, error } = await supabase.rpc("get_tasks_filtered", {
      status_filter: req.status,
      category_filter: req.category,
      date_from: req.dateRange.from,
      date_to: req.dateRange.to,
      limit_count: req.limit,
      offset_count: req.offset,
    });

    if (error !== null) return [];

    return <Array<Task>>data;
  }
}
