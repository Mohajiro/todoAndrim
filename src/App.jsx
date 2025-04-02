import { useState, useEffect } from "react";
import "./app.css";
import Task from "./models/Task";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetch(`/api/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      });
  }, []);

  function handleAddTask() {
    if (!newTask) {
      alert("Please enter a task");
      return;
    }
    fetch(`/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTask, completed: false }),
    })
    .then((res) => res.json())
    .then((taskData) => {
      const task = Task.fromJSON(taskData);
      setTasks([...tasks, task]);
      setNewTask("");
    });
  }

  function handleToggleTask(id) {
    const task = tasks.find((task) => task._id === id);
    const updatedCompleted = !task.completed;

    fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: updatedCompleted }),
    })
      .then((res) => res.json())
      .then(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === id ? { ...task, completed: updatedCompleted } : task
          )
        );
      });
  }

  function handleDeleteTask(id) {
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).then(() => {
      setTasks(tasks.filter((task) => task._id !== id));
    });
  }

  function renderTasks() {
    return tasks.map((task) => (
      <li key={task._id} className="flex items-center gap-8 bg-pink-100 rounded-lg p-4 shadow">
        <span
          style={{ textDecoration: task.completed ? "line-through" : "none" }}
          onClick={() => handleToggleTask(task._id)}
          className="cursor-pointer flex-1 text-pink-800 font-semibold"
        >
          {task.title}
        </span>
        <button
          onClick={() => handleDeleteTask(task._id)}
          className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-bold py-1 px-4 rounded"
        >
          🌈 Delete
        </button>
      </li>
    ));
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center">
      <main className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
        <div className="bg-white p-8 shadow rounded-xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-extrabold text-pink-700 text-center w-full">🌸 Pony Todo List 🦄</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="🦄 Add magical task..."
              className="flex-1 p-3 rounded-lg border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleAddTask}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold p-3 rounded-lg shadow"
            >
              Add ✨
            </button>
          </div>
        </div>
        {tasks.length > 0 ? (
          <ul className="flex flex-col gap-4">{renderTasks()}</ul>
        ) : (
          <p className="text-center text-pink-700 font-semibold">No tasks yet 🐴✨</p>
        )}
      </main>
    </div>
  );
}

export default App;
