// server.js
import express from 'express';
import cors from 'cors';
import db from './src/models/db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/tasks', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM tasks');
  res.json(rows);
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM tasks WHERE id = ?', [Number(req.params.id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error("Suppression error:", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const completed = false;

  const [result] = await db.execute(
    'INSERT INTO tasks (title, completed) VALUES (?, ?)',
    [title, completed]
  ); 

  const newTask = {
    id: result.insertId,
    title,
    completed,
  };

  res.status(201).json(newTask); 
});

app.listen(PORT, () => {
  console.log(`Server running ${PORT}`);
});
