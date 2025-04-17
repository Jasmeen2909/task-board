import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { DroppableColumn } from "./DroppableColumn";
import { DraggableCard } from "./DraggableCard";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [limit, setLimit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const scrollRef = useRef();

  const columnMap = {
    "to-do": "To Do",
    "in-progress": "In Progress",
    done: "Done",
  };

  const [tasksByStatus, setTasksByStatus] = useState({
    "to-do": [],
    "in-progress": [],
    done: [],
  });

  const columns = Object.keys(columnMap);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    setPage(0);
    setTasks([]);
    setHasMore(true);
    loadMoreTasks(true);
    getUser();
  }, [statusFilter, categoryFilter, dateRange]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const handleScroll = () => {
      if (
        scrollEl.scrollTop + scrollEl.clientHeight >=
          scrollEl.scrollHeight - 300 &&
        !loading &&
        hasMore
      ) {
        loadMoreTasks();
      }
    };
    scrollEl?.addEventListener("scroll", handleScroll);
    return () => scrollEl?.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const loadMoreTasks = async (reset = false) => {
    setLoading(true);
    const from = reset ? 0 : page * pageSize;

    const { data, error } = await supabase.rpc("get_tasks_filtered", {
      status_filter: statusFilter,
      category_filter: categoryFilter,
      date_from: dateRange.from,
      date_to: dateRange.to,
      limit_count: pageSize,
      offset_count: from,
    });

    if (!error && data) {
      const combined = reset ? data : [...tasks, ...data];

      const uniqueCombined = Array.from(
        new Map(combined.map((task) => [task.id, task])).values()
      );

      setTasks(uniqueCombined);

      const grouped = { "to-do": [], "in-progress": [], done: [] };
      uniqueCombined.forEach((task) => {
        const safeStatus = task.status.toLowerCase().replace(" ", "-");
        if (grouped[safeStatus]) grouped[safeStatus].push(task);
      });
      setTasksByStatus(grouped);

      if (data.length < pageSize) setHasMore(false);
      setPage((prev) => (reset ? 1 : prev + 1));
    }

    setLoading(false);
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceCol = Object.keys(tasksByStatus).find((col) =>
      tasksByStatus[col].some((task) => task.id.toString() === active.id)
    );
    const task = tasksByStatus[sourceCol].find(
      (t) => t.id.toString() === active.id
    );

    const newStatus = over.id;
    const newTasksByStatus = { ...tasksByStatus };

    newTasksByStatus[sourceCol] = newTasksByStatus[sourceCol].filter(
      (t) => t.id.toString() !== active.id
    );
    task.status = columnMap[newStatus];
    newTasksByStatus[newStatus].push(task);

    setTasksByStatus(newTasksByStatus);

    await supabase.rpc("update_task_status", {
      task_id: task.id,
      new_status: task.status,
    });
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userEmail={userEmail}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          handleLogout={handleLogout}
        />

        <div
          className="flex-1 overflow-y-auto p-6 bg-gray-100 mt-20"
          ref={scrollRef}
        >
          <h1 className="font-bold text-2xl mb-6">Dashboard</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="border border-gray-300 pl-10 pr-4 py-2 rounded text-sm w-48 bg-white"
              />
            </div>

            <select
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="border border-gray-300 px-3 py-2 rounded text-sm w-32 bg-white"
            >
              <option value="">Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="border border-gray-300 px-3 py-2 rounded text-sm w-32 bg-white"
            >
              <option value="">Category</option>
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
            </select>

            <div className="relative">
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="border border-gray-300 px-3 py-2 rounded text-sm w-48 text-left bg-white"
              >
                {range[0].startDate.toLocaleDateString()} -{" "}
                {range[0].endDate.toLocaleDateString()}
              </button>
              {calendarOpen && (
                <div className="absolute z-50 mt-2 shadow-lg">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
                      setRange([item.selection]);
                      setDateRange({
                        from: item.selection.startDate.toISOString(),
                        to: item.selection.endDate.toISOString(),
                      });
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                  />
                </div>
              )}
            </div>

            <select
              onChange={(e) => setLimit(Number(e.target.value) || null)}
              className="border border-gray-300 px-3 py-2 rounded text-sm w-32 bg-white"
            >
              <option value="">Limit</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <div className="grid grid-cols-3 gap-4">
              {columns.map((col) => (
                <DroppableColumn
                  key={col}
                  columnId={col}
                  title={columnMap[col]}
                  tasks={tasksByStatus[col] || []}
                  setActiveTask={setActiveTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <DraggableCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
          {loading && (
            <p className="text-center mt-4 text-gray-500">
              Loading more tasks...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
