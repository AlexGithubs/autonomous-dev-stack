import { useState } from 'react';
import { Task } from '../types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl md:text-4xl font-bold text-center mb-8'>Task Manager</h1>
        
        <form onSubmit={addTask} className='mb-8'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className='flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Add a new task...'
            />
            <button
              type='submit'
              className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors'
            >
              Add
            </button>
          </div>
        </form>

        <div className='space-y-4'>
          {tasks.map(task => (
            <div
              key={task.id}
              className='flex items-center justify-between bg-white p-4 rounded-lg shadow'
            >
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className='h-5 w-5'
                />
                <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className='text-red-500 hover:text-red-700'
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
