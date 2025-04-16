import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUserCircle,
  faSignOutAlt,
  faTachometerAlt,
  faTrashAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/Logo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [limit, setLimit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    getUser();
  }, [statusFilter, categoryFilter, dateRange, limit]);

  const fetchTasks = async () => {
    const { data, error } = await supabase.rpc("get_tasks_filtered", {
      status_filter: statusFilter,
      category_filter: categoryFilter,
      date_from: dateRange.from,
      date_to: dateRange.to,
      limit_count: limit,
    });
    if (!error) {
      setTasks(data);
      const grouped = {};
      columns.forEach((col) => {
        grouped[col] = data.filter((task) => task.status === col);
      });
      setTasksByStatus(grouped);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Prevent drop in same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    const draggedTask = tasksByStatus[sourceCol][source.index];

    // Remove from source, add to destination
    const newSourceTasks = [...tasksByStatus[sourceCol]];
    const [movedTask] = newSourceTasks.splice(source.index, 1);
    movedTask.status = destCol;

    const newDestTasks = [...tasksByStatus[destCol]];
    newDestTasks.splice(destination.index, 0, movedTask);

    setTasksByStatus({
      ...tasksByStatus,
      [sourceCol]: newSourceTasks,
      [destCol]: newDestTasks,
    });

    // 🔁 Update status in Supabase via RPC
    await supabase.rpc("update_task_status", {
      task_id: movedTask.id,
      new_status: destCol,
    });
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
  };

  const columns = ["To Do", "In Progress", "Done"];
  const [tasksByStatus, setTasksByStatus] = useState({});

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`bg-white shadow-lg h-full fixed top-0 left-0 transition-all duration-300 z-10 ${
          sidebarOpen ? "w-63" : "w-16"
        }`}
      >
        <div className="flex flex-col items-center justify-between h-full">
          <div>
            <div className="px-5 py-5 shadow">
              {sidebarOpen && <img src={Logo} alt="Logo" className="h-10" />}
            </div>
            <nav className="mt-4">
              <Link
                to="/dashboard"
                className="flex items-center my-2 mx-5 px-4 py-2 text-md font-medium hover:bg-orange-600 hover:text-white cursor-pointer rounded-lg"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                {sidebarOpen && "Dashboard"}
              </Link>
              <Link
                to="/discard"
                className="flex items-center my-2 mx-5 px-4 py-2 text-md font-medium hover:bg-orange-600 hover:text-white cursor-pointer rounded-lg"
              >
                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                {sidebarOpen && "Discard"}
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <header
          className={`flex items-center justify-between bg-white p-4 fixed top-0 right-0 z-10 transition-all duration-300 ${
            sidebarOpen ? "left-64" : "left-16"
          }`}
        >
          <div className="flex items-center gap-4 ml-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
          </div>
          <div className="relative mr-4">
            <div
              className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
              {userEmail && (
                <span className="text-sm font-medium hidden sm:inline">
                  {userEmail}
                </span>
              )}
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 z-50">
                <div
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />{" "}
                  Logout
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 mt-20">
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

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-4">
              {columns.map((col) => (
                <Droppable droppableId={String(col)} key={col}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white rounded-lg shadow p-4 min-h-[300px]"
                    >
                      <div className="font-semibold mb-2 flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full mr-2 ${
                            col === "To Do"
                              ? "bg-yellow-500"
                              : col === "In Progress"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        />
                        {col}
                      </div>

                      {tasksByStatus[col]?.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="bg-gray-50 p-3 rounded shadow hover:shadow-md cursor-pointer mb-3"
                            >
                              <h2 className="font-semibold">{task.title}</h2>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {task.description}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
