// Variables globales
let savedNotes = [];
let currentEditingNoteId = null;
const API_URL = 'http://localhost:3000/notes';


// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadSavedNotes();

});

// Sauvegarde manuelle
async function saveNote() {
    const editor = document.getElementById('notesEditor');
    const content = editor.value.trim();
    
    if (!content) {
        showNotification('Aucun contenu à sauvegarder', 'error');
        return;
    }
    
    const noteData = {
        content: content,
        timestamp: new Date().toLocaleString('fr-FR'),
        type: 'manual'
    };
    
    try {
        let res;
        let savedNote;
        
        if (currentEditingNoteId) {
            // Mise à jour d'une note existante
            res = await fetch(`${API_URL}/${currentEditingNoteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            
            if (!res.ok) throw new Error('Erreur lors de la mise à jour');
            
            savedNote = await res.json();
            
            // Mettre à jour la liste locale
            const index = savedNotes.findIndex(n => n.id === currentEditingNoteId);
            if (index !== -1) {
                savedNotes[index] = savedNote;
            }
            
            showNotification('Note mise à jour avec succès', 'success');
        } else {
            // Création d'une nouvelle note
            res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            
            if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
            
            savedNote = await res.json();
            savedNotes.unshift(savedNote);
            showNotification('Note sauvegardée avec succès', 'success');
        }
        
        displaySavedNotes();
        clearEditor();
        resetSaveButton();
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
    }
}

function resetSaveButton() {
    currentEditingNoteId = null;
    const saveBtn = document.querySelector('.btn-save');
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
        </svg>
        Sauvegarder
    `;
}


// Effacer l'éditeur
function clearEditor() {
    document.getElementById('notesEditor').value = '';
    resetSaveButton();
}

// Charger les notes sauvegardées
async function loadSavedNotes() {
    try {
        const res = await fetch(API_URL);
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        savedNotes = await res.json();
        displaySavedNotes();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des notes', 'error');
        
        // Solution de repli: initialiser avec un tableau vide
        savedNotes = [];
        displaySavedNotes();
    }
}

// Afficher les notes sauvegardées
function displaySavedNotes() {
    const container = document.getElementById('savedNotesContainer');
    
    if (savedNotes.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; font-style: italic; text-align: center;">Aucune note sauvegardée</p>';
        return;
    }
    
    container.innerHTML = savedNotes.slice(0, 5).map(note => `
        <div class="quick-note-item">
            <div class="note-actions">
                <button class="btn-note-action btn-edit" onclick="editSelectedNote(${note.id})" title="Modifier">
                    ✏️
                </button>
                <button class="btn-note-action btn-delete" onclick="deleteNote(${note.id})" title="Supprimer">
                    ×
                </button>
            </div>
            <div class="note-timestamp">${note.timestamp}</div>
            <div class="note-content">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

function editSelectedNote(id) {
    const noteToEdit = savedNotes.find(note => note.id === id);
    if (noteToEdit) {
        document.getElementById('notesEditor').value = noteToEdit.content;
        currentEditingNoteId = id;
        
        // Changez le texte du bouton Sauvegarder
        const saveBtn = document.querySelector('.btn-save');
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Mettre à jour
        `;
        
        showNotification('Note chargée pour modification', 'info');
    }
}


// Supprimer une note
async function deleteNote(id) {
    showConfirm('Supprimer cette note ?', async () => { 
    
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) {
                throw new Error('Erreur lors de la suppression');
            }
            
            savedNotes = savedNotes.filter(note => note.id !== id);
            displaySavedNotes();
            //updateStats();
            showNotification('Note supprimée', 'info');
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la suppression de la note', 'error');
        }
    }
    );
}
