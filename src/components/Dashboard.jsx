import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [limit, setLimit] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, categoryFilter, dateRange, limit]);

  const fetchTasks = async () => {
    const { data, error } = await supabase.rpc("get_tasks_filtered", {
      status_filter: statusFilter,
      category_filter: categoryFilter,
      date_from: dateRange.from,
      date_to: dateRange.to,
      limit_count: limit
    });
    if (!error) setTasks(data);
  };

  const columns = ["To Do", "In Progress", "Done"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <select onChange={(e) => setStatusFilter(e.target.value || null)}>
            <option value="">Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select onChange={(e) => setCategoryFilter(e.target.value || null)}>
            <option value="">Category</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
          </select>
          <select onChange={(e) => setLimit(Number(e.target.value) || null)}>
            <option value="">Limit</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                col === "To Do"
                  ? "bg-yellow-500"
                  : col === "In Progress"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}></span>
              {col}
            </div>
            <div className="space-y-4">
              {tasks.filter(task => task.status === col).length === 0 ? (
                col === "Done" && <div className="text-center text-gray-400">No Task</div>
              ) : (
                tasks
                  .filter(task => task.status === col)
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-gray-50 p-3 rounded shadow hover:shadow-md cursor-pointer"
                    >
                      <h2 className="font-semibold">{task.title}</h2>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
