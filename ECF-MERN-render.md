# Tutoriel : Déploiment d'une TODO app fullstack avec Express JS, REACT JS, MongoDB Atlas et Render

[TOC]

Ce tutoriel va vous permettre de créer une TODO app avec Express JS, REACT JS et MongoDB Atlas en évitant les problèmes de cors

- Express sur le port 8080
- REACT sur le port 5173

Le dossier `server/` contiendra le code de l'API ExpressJS et le dossier `dist/` contiendra le code de l'application REACT transpilé.

> 🔴 Chaque partie de l'application aura ses propres modules, faites attention de bien changer de dossier lorsqu'il faudra modifier une partie de l'application ou installer des modules.
> On ouvrira un terminal dans chacun des dossiers.

## Installation de REACT

```bash
npx create-vite todo-app --template REACT
cd todo-app
npm install
npm run dev
```

## Back-end - serveur ExpressJS

Créer un dossier `server/` qui contiendra le code de l'API (back-end ExpressJS) et placez vous dans le dossier.

```bashnp
mkdir server
cd server
npm init -y
```

Puis installer le module suivant:

```bash
npm i express dotenv
```

Ici ExpressJS est le frameWork que nous utiliserons pour créer notre AP et `dotenv` nous permettra de lire les variables d'environnement.

Ajouter les lignes suivantes au fichier `package.json`:

```json
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js"
  }

```

> Le type de module nous permettra d'utiliser l'import et l'export de ES6.
> Le script `start` nous permettra de lancer le serveur en production et le script `dev` nous permettra de lancer le serveur en développement

Toujours dans le dossier `server/`, créer les fichiers `app.js` et `.env` et insérer les lignes code suivant :

- `app.js`:

```js
// app.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} via http://localhost:${PORT}`);
});
```

- `.env`:

```bash
# .env
PORT=8080
# A adapter selon vos besoins
MONGO_ROOT_USER=root
MONGO_ROOT_PASS=supersecretpassword
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=tasks
```

> 🟠 Ajouter les lignes suivantes dans le fichier `.gitignore`

    node_modules/
    dist/
    .env

Tester le server sur le navigateur avec les commandes

- Pour la version de production

  ```bash
  npm run start
  ```

- Pour la version de développement
  ```bash
  npm run dev
  ```

Toujours dans `server/`, ajouter les lignes suivantes à `app.js` et tester le résultats sur le navigateur:

```js
// Données provisoires pour tester
const todos = [
  {
    id: 1,
    title: "Buy milk",
    completed: false,
  },
  {
    id: 2,
    title: "Buy eggs",
    completed: false,
  },
  {
    id: 3,
    title: "Buy bread",
    completed: false,
  },
];

app.get("/api/tasks", (req, res) => {
  // Express converts the todos array to JSON and sends it back to the client
  res.send(todos);
});
```

> 🟢 Le serveur devrait
 retourner les tâches du tableau `todos` sur la route `http://localhost:8080/api/tasks`.

## Front-end avec REACT

Maintenant on va tenter de `fetch` les données dans REACT.
Retourner dans le dossier de REACT et insérer le code suivant dans le fichier `src/App.js`:

```js
// App.js
import { useState, useEffect } from "react";
function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      });
  }, []);

  function renderTasks() {
    return tasks.map((task) => {
      return <li key={task.id}>{task.title}</li>;
    });
  }

  return (
    <main>
      <h1>Hello</h1>
      {renderTasks()}
    </main>
  );
}

export default App;
```

Lancer le server de REACT `npm run dev`

> 🔴 A ce stade REACT écoute le port `5173` et le server envoie les données sur le port `8080` et cela produira une erreur...

Dans le terminal de REACT, arrêter le serveur `CTRL + C` et lancer la commande `npm run build`

Ensuite déplacer le dossier `dist` ( ou `build`) généré par REACT vers le dossier de `server/` de l'API Express (`server/dist/`)

Insérer les lignes suivantes dans le fichier `server/app.js` pour servir le dossier `dist`.

```js
// app.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques de l'application REACT build
app.use(express.static("dist"));

const todos = [
  {
    id: 1,
    title: "Buy milk",
    completed: false,
  },
  {
    id: 2,
    title: "Buy eggs",
    completed: false,
  },
  {
    id: 3,
    title: "Buy bread",
    completed: false,
  },
];

app.get("/api/tasks", (req, res) => {
  // Express converts the todos array to JSON and sends it back to the client
  res.send(todos);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} via http://localhost:${PORT}`);
});
```

Express servira le dossier `dist` contenant le build de REACT et ce dernier pourra communiquer avec le serveur ExpressJS sur le port `8080`.

La fonction `fetch` retournera les données de l'API car les fichiers exécuteront sur le meme serveur avec le port `8080`

Dans le terminal de l'API Express, lancer la commande `npm run dev`:

- 🟢 <http://localhost:8080/api/tasks> : affiche toujours les tâches
- 🟢 <http://localhost:8080/> : affiche le front-end depuis le dossier `dist/`

Maintenant pour que cela fonctionne depuis REACT en mode développement, ajouter le code suivant dans `vite.config.js` de REACT :

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Chemin où les fichiers de production seront générés
    outDir: resolve(__dirname, "./server/dist"),
  },
  server: {
    proxy: {
      // toutes les requêtes commençant par '/api' seront transférées à 'http://localhost:8080'
      "/api": "http://localhost:8080",
    },
  },
});
```

Cela redirigera les requêtes `/api` de REACT vers le serveur expressJS `server` avec le port `8080`

Maintenant vous pouvez lancer REACT avec la commande `npm run dev`
et le serveur ExpressJS avec la commande `npm run dev`

🟢 Tester `http://localhost:5173/`, vous devriez voir les tâches qui sont affichées

## Enregistrement des tâches dans la base de données MongoDB

- Apprendre les commandes MongoDB (requêtes) pour ajouter des tâches à la base de données MongoDB : <https://youtu.be/ofme2o29ngU?si=71NwVst-yrlySdRV>
- Opérations de CRUD avec MongoDB et Express : <https://youtu.be/ObkVmnr8B9k?si=_-eZJYsHxo0-Yabm>

Voir aussi document Annexe

## Application Complète

Commencer par installer MongoDB dans le terminal de l'API Express

```bash
npm i mongodb
```

Maintenant essayer de gérer les tâches dans l'application et enregistrer les tâches dans la base de données MongoDB.

### Ajouter le code de l'API dans le fichier `server/app.js`

A compléter :

```javascript
// app.js
import express from "express";
import dotenv from "dotenv";

// MongoDB
import { MongoClient, ObjectId } from "mongodb";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques de l'application REACT build
app.use(express.static("dist"));
// Middleware pour analyser les corps JSON des requêtes
app.use(express.json());

const uri = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`;
console.log(uri);

const client = new MongoClient(uri);

let tasksCollection;

async function startServer() {
  try {
    await client.connect();
    tasksCollection = client.db(process.env.MONGO_DB).collection("tasks"); // Ajoute .collection("tasks")
    console.log("✅ Connexion MongoDB établie");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
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

// POST : Créer une nouvelle tâche
app.post("/api/tasks", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    // TODO A compléter
  } catch (error) {
    res.status(400).json({ message: "Échec de la création de la tâche." });
  }
});

// PUT : Mettre à jour une tâche par ID
app.put("/api/tasks/:id", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);
    // TODO A compléter
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE : Supprimer une tâche par ID
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);
    // TODO A compléter
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
```

### Ajouter le code dans REACT

```js
// src/App.jsx
import { useState, useEffect } from "react";
import "./app.css";

// Utiliser la variable d'environnement pour l'URL de l'API
// const API_URL = process.env.VITE_API_URL;
// console.log('API_URL:', API_URL)

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
      .then((task) => {
        setTasks([...tasks, task]);
        setNewTask("");
      });
  }

  function handleToggleTask(id) {
    const task = tasks.find((task) => task._id === id);
    fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        console.log("updatedTask:", updatedTask);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === id
              ? { ...updatedTask, completed: !updatedTask.completed }
              : task
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
      <li key={task._id} className="flex items-center gap-8">
        <span
          style={{ textDecoration: task.completed ? "line-through" : "none" }}
          onClick={() => handleToggleTask(task._id)}
          className="cursor-pointer flex-1"
        >
          {task.title}
        </span>
        <button
          onClick={() => handleDeleteTask(task._id)}
          className="cursor-pointer"
        >
          Delete
        </button>
      </li>
    ));
  }

  return (
    <main className="mw-420 m-auto p-16 flex flex-col gap-16">
      <div className="p-16 shadow rounded-16">
        <h1>Todo List</h1>
        <div className="flex items-center">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task"
            className="flex-1 p-8"
          />
          <button onClick={handleAddTask} className="p-8 cursor-pointer">
            Add Task
          </button>
        </div>
      </div>
      {tasks.length > 0 ? (
        <ul className="flex flex-col gap-8 p-16">{renderTasks()}</ul>
      ) : (
        <p className="p-16">No tasks yet</p>
      )}
    </main>
  );
}

export default App;
```


## Déployer votre application avec Render

Rendez-vous sur [Render](https://render.com/) : <https://render.com/>

1. Vous pouvez créer un compte rapidement en vous connectant avec les identifiants de votre compte GitHub
2. Choisissez +New > Web Service
3. Reliez le _repository_ de votre application sur GitHub
4. Nommez votre projet et configurer les commandes nécessaires pour deployer votre application.
   - Build Command: `npm install ; npm run build ; cd server ; npm install`
   - Start Command: `cd server ; npm run start`
