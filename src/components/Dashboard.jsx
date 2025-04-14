import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('realtime:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('projects').select('*');
    setTasks(data);
  };

  const columns = ['todo', 'inprogress', 'done'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Project Board</h1>
      <div className="grid grid-cols-3 gap-6">
        {columns.map((status) => (
          <div key={status} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold capitalize mb-4">{status}</h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className="bg-gray-100 p-3 rounded mb-3">
                <h3 className="font-bold">{task.project}</h3>
                <p className="text-sm">{task.description}</p>
                <p className="text-xs text-gray-500">Budget: ₹{task.budget}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
