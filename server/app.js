
// app.js
import express from "express";
import dotenv from "dotenv";

// MongoDB
import { MongoClient, ObjectId } from "mongodb";
dotenv.config();
// Importer le module path pour gérer les chemins de fichiers
import Task from '../src/models/Task.js';


const app = express();

const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques de l'application REACT build
app.use(express.static("dist"));
// Middleware pour analyser les corps JSON des requêtes
app.use(express.json());

const uri = `${process.env.MONGO_URI}`;
console.log(uri);

const client = new MongoClient(uri);

let tasksCollection;

async function startServer() {
  try {
    await client.connect();
    tasksCollection = client.db(process.env.MONGO_DB).collection("tasks"); // Ajoute .collection("tasks")
    console.log("Connexion MongoDB établie");
  } catch (err) {
    console.error("Erreur de connexion MongoDB :", err);
  }
}

startServer(); // N'oublie pas d'appeler la fonction

// Logger middleware pour logger chaque requête
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("↖️  req.body: ");
  console.log(req.body);
  const oldSend = res.send;
  res.send = function (data) {
    console.log("↘️ ", `Status: ${res.statusCode}`);
    if (data) console.log(JSON.parse(data));
    oldSend.call(this, data);
  };
  next();
});

// Opérations CRUD

// GET : Récupérer toutes les tâches
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await tasksCollection.find().toArray(); // Récupérer tous les documents
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Échec de la récupération des tâches." });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    const result = await tasksCollection.insertOne(task.toJSON());
    task._id = result.insertedId;

    res.status(201).json(task.toJSON());
  } catch (error) {
    res.status(400).json({ message: "Échec de la création de la tâche." });
  }
}); 

// PUT : Mettre à jour le titre d'une tâche par ID
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, completed } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (completed !== undefined) updateFields.completed = completed;

    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "Tâche non trouvée." });
    }

    res.status(200).json(result.value);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});
  

// DELETE : Supprimer une tâche par ID

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);

    const taskId = req.params.id;
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Tâche supprimée avec succès." });
    } else {
      res.status(404).json({ message: "Tâche non trouvée." });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(400).json({ message: error.message });
  }
});

// Rediriger toutes les autres requêtes vers index.html pour la gestion du routage côté client
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// Démarrer le serveur et écouter sur le port configuré

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} via http://localhost:${PORT}`);
});