const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;
const DATA_FILE = 'tickets.json';
const DATA_NOTE_FILE = 'notes.json';


app.use(cors()); // Autorise les requêtes cross-origin (pour tester depuis navigateur)
app.use(bodyParser.json());

// Charger les tickets depuis le fichier JSON
function loadTickets() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

// Charger les notes depuis le fichier JSON
function loadNotes() {
  if (!fs.existsSync(DATA_NOTE_FILE)) return [];
  const data = fs.readFileSync(DATA_NOTE_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

// Sauvegarder les tickets dans le fichier JSON
function saveTickets(tickets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2));
}

// Sauvegarder les notes dans le fichier JSON
function saveNotes(notes) {
  fs.writeFileSync(DATA_NOTE_FILE, JSON.stringify(notes, null, 2));
}

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Modifiez la route GET /notes pour retourner toujours un tableau
app.get('/notes', (req, res) => {
    try {
        const notes = loadNotes();
        res.json(notes || []); // Garantit de toujours retourner un tableau
    } catch (error) {
        console.error('Error loading notes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// GET tous les tickets
app.get('/tickets', (req, res) => {
  const tickets = loadTickets();
  res.json(tickets);
});


// POST nouveau ticket
app.post('/tickets', (req, res) => {
  const tickets = loadTickets();
  const newTicket = req.body;
  newTicket.id = Date.now(); // id unique simple
  tickets.push(newTicket);
  saveTickets(tickets);
  res.status(201).json(newTicket);
});

// POST nouveau note
app.post('/notes', (req, res) => {
  const notes = loadNotes();
  const newNote = req.body;
  newNote.id = Date.now(); // id unique simple
  notes.push(newNote);
  saveNotes(notes);
  res.status(201).json(newNote);
});

// PUT modifier un ticket par id
app.put('/tickets/:id', (req, res) => {
  const tickets = loadTickets();
  const id = parseInt(req.params.id);
  const updated = req.body;
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Ticket non trouvé' });
  tickets[index] = { ...tickets[index], ...updated };
  saveTickets(tickets);
  res.json(tickets[index]);
});

// PUT modifier un note par id
app.put('/notes/:id', (req, res) => {
  const notes = loadNotes();
  const id = parseInt(req.params.id);
  const updated = req.body;
  const index = notes.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Note non trouvée' });
  notes[index] = { ...notes[index], ...updated };
  saveNotes(notes);
  res.json(notes[index]);
});

app.delete('/tickets/:id', (req, res) => {
  const tickets = loadTickets();
  const id = parseInt(req.params.id);
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Ticket non trouvé' });
  tickets.splice(index, 1);
  saveTickets(tickets);
  res.status(204).send(); // Pas de contenu
});

app.delete('/notes/:id', (req, res) => {
  const notes = loadNotes();
  const id = parseInt(req.params.id);
  const index = notes.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Note non trouvée' });
  notes.splice(index, 1);
  saveNotes(notes);
  res.status(204).send(); // Pas de contenu
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});


