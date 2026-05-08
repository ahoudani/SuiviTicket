
const API_URL = 'http://localhost:3000/tickets';

// Récupérer l'ID du ticket depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const ticketId = urlParams.get('id');

// --- Tickets liés ---
let allTickets = [];
let ticketsLies = [];          // [{id, numero, nom}]
let originalTicketsLiesIds = []; // IDs au dernier chargement (pour diff bidirectionnel)

async function fetchAllTickets() {
  try {
    const res = await fetch(API_URL);
    allTickets = await res.json();
  } catch (e) {
    console.error('Erreur fetchAllTickets:', e);
  }
}

function renderTicketsLiesBadges() {
  const container = document.getElementById('ticketsLiesBadges');
  if (!container) return;
  container.innerHTML = '';
  ticketsLies.forEach(t => {
    const badge = document.createElement('span');
    badge.className = 'ticket-lie-badge';
    badge.innerHTML =
      `<a href="ticket-form.html?id=${t.id}" class="ticket-lie-link">${t.numero} — ${t.nom}</a>` +
      `<button type="button" class="ticket-lie-remove" data-id="${t.id}" title="Retirer le lien">×</button>`;
    badge.querySelector('.ticket-lie-remove').addEventListener('click', () => removeTicketLie(t.id));
    container.appendChild(badge);
  });
}

function addTicketLie(ticket) {
  if (!ticketsLies.find(t => String(t.id) === String(ticket.id))) {
    ticketsLies.push({ id: ticket.id, numero: ticket.numero, nom: ticket.nom });
    renderTicketsLiesBadges();
  }
  document.getElementById('ticketsLiesInput').value = '';
  closeAutocomplete();
}

function removeTicketLie(id) {
  ticketsLies = ticketsLies.filter(t => String(t.id) !== String(id));
  renderTicketsLiesBadges();
}

function closeAutocomplete() {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (dropdown) dropdown.innerHTML = '';
}

function setupAutocomplete() {
  const input = document.getElementById('ticketsLiesInput');
  if (!input) return;

  input.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    const dropdown = document.getElementById('autocompleteDropdown');
    dropdown.innerHTML = '';
    if (!query) return;

    const currentId = String(document.getElementById('ticketId').value);
    const lieIds = ticketsLies.map(t => String(t.id));

    const matches = allTickets.filter(t =>
      String(t.id) !== currentId &&
      !lieIds.includes(String(t.id)) &&
      ((t.numero || '').toLowerCase().includes(query) || (t.nom || '').toLowerCase().includes(query))
    ).slice(0, 8);

    matches.forEach(t => {
      const li = document.createElement('li');
      li.className = 'autocomplete-item';
      li.innerHTML = `<span class="ac-numero">${t.numero}</span><span class="ac-nom">${t.nom}</span>`;
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        addTicketLie(t);
      });
      dropdown.appendChild(li);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.autocomplete-container')) {
      closeAutocomplete();
    }
  });
}

async function syncBidirectionnel(currentId) {
  currentId = String(currentId);
  const newIds = ticketsLies.map(t => String(t.id));
  const oldIds = originalTicketsLiesIds.map(String);

  const added   = newIds.filter(id => !oldIds.includes(id));
  const removed = oldIds.filter(id => !newIds.includes(id));

  const updates = [];

  for (const id of added) {
    const target = allTickets.find(t => String(t.id) === id);
    if (!target) continue;
    const targetLieIds = (target.ticketsLies || []).map(String);
    if (!targetLieIds.includes(currentId)) {
      updates.push(fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketsLies: [...targetLieIds.map(Number), Number(currentId)] })
      }));
    }
  }

  for (const id of removed) {
    const target = allTickets.find(t => String(t.id) === id);
    if (!target) continue;
    const targetLieIds = (target.ticketsLies || []).map(String).filter(tid => tid !== currentId);
    updates.push(fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketsLies: targetLieIds.map(Number) })
    }));
  }

  await Promise.all(updates);
  originalTicketsLiesIds = ticketsLies.map(t => t.id);
  await fetchAllTickets();
}

// Charger les données du ticket si on est en mode édition
if (ticketId) {
  loadTicketData(ticketId);
}

async function loadTicketData(id) {
  try {
    const res = await fetch(API_URL);
    const tickets = await res.json();
    allTickets = tickets;
    const ticket = tickets.find(t => t.id == id);
    
    if (!ticket) {
      // alert('Ticket non trouvé');
      showNotification('Ticket non trouvé', 'warning');
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('ticketId').value = ticket.id;
    document.getElementById('numero').value = ticket.numero || '';
    document.getElementById('type').value = ticket.type || '';
    document.getElementById('nom').value = ticket.nom || '';
    document.getElementById('baseTravail').value = ticket.baseTravail || '';
    document.getElementById('serveurBase').value = ticket.serveurBase || 'Local';
    document.getElementById('cheminGit').value = ticket.cheminGit || '';
    document.getElementById('brancheGit').value = ticket.brancheGit || '';
    document.getElementById('state').value = ticket.state || '';
    document.getElementById('informations').value = ticket.informations || '';
    document.getElementById('remarques').value = ticket.remarques || '';
    document.getElementById('modifications').value = ticket.modifications || '';
    document.getElementById('bobs').value = ticket.bobs || '';

    document.getElementById('formTitle').textContent = ticket.nom.slice(0,99) || '';

    // Initialiser les tickets liés
    const lieIds = ticket.ticketsLies || [];
    ticketsLies = lieIds.map(lid => {
      const t = allTickets.find(t => String(t.id) === String(lid));
      return t ? { id: t.id, numero: t.numero, nom: t.nom } : null;
    }).filter(Boolean);
    originalTicketsLiesIds = ticketsLies.map(t => t.id);
    renderTicketsLiesBadges();

  } catch (error) {
    console.error('Erreur lors du chargement du ticket:', error);
    // alert('Erreur lors du chargement du ticket');
     showNotification('Erreur lors du chargement du ticket', 'error');
  }
}

document.getElementById('ticketForm').addEventListener('submit', async e => {
  e.preventDefault();

  const ticketIdValue = document.getElementById('ticketId').value;
  const ticketData = {
    numero: document.getElementById('numero').value.trim(),
    type: document.getElementById('type').value,
    nom: document.getElementById('nom').value.trim(),
    baseTravail: document.getElementById('baseTravail').value.trim(),
    serveurBase: document.getElementById('serveurBase').value,
    cheminGit: document.getElementById('cheminGit').value.trim(),
    brancheGit: document.getElementById('brancheGit').value.trim(),
    state: document.getElementById('state').value.trim(),
    informations: document.getElementById('informations').value.trim(),
    remarques: document.getElementById('remarques').value.trim(),
    modifications: document.getElementById('modifications').value.trim(),
    bobs: document.getElementById('bobs').value.trim(),
    ticketsLies: ticketsLies.map(t => t.id)
  };

  if (!ticketData.numero || !ticketData.type || !ticketData.nom || !ticketData.state) {
    showNotification('Veuillez remplir tous les champs obligatoires (marqués d\'un *)', 'warning');
    return;
  }

  try {
    let res;
    let finalTicketId;

    if (ticketIdValue) {
      // Modifier un ticket existant
      res = await fetch(`${API_URL}/${ticketIdValue}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      finalTicketId = ticketIdValue; // Pour la modification, on garde l'ID existant
    } else {
      // Créer un nouveau ticket
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      
      // Récupérer l'ID du nouveau ticket depuis la réponse
      const createdTicket = await res.json();
      finalTicketId = createdTicket.id;
    }

    if (!res.ok) {
      throw new Error('Erreur lors de l\'enregistrement');
    }

    showNotification('Ticket enregistré avec succès !', 'success');
    
    // Mettre à jour le champ caché avec le nouvel ID (pour les nouveaux tickets)
    document.getElementById('ticketId').value = finalTicketId;

    // Synchroniser les liaisons bidirectionnelles
    await syncBidirectionnel(finalTicketId);
    
    // Recharger les données du ticket
    loadTicketData(finalTicketId);
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors de l\'enregistrement du ticket', 'error');
  }
});

function clearForm() {
  //document.getElementById('ticketId').value = '';
  document.getElementById('ticketForm').reset();
}

function retournToList() {  
  window.location.href = 'index.html';
}

function cancelForm() {
  showConfirm('Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.',  () => {
    window.location.href = 'index.html';});
}

document.getElementById('btnClear').addEventListener('click', clearForm);
document.getElementById('btnCancel').addEventListener('click', cancelForm);


document.addEventListener("DOMContentLoaded", function () {
    const numeroInput = document.getElementById("numero");
    const brancheGitInput = document.getElementById("brancheGit");

    numeroInput.addEventListener("input", function () {
      const ticketValue = numeroInput.value.trim();
      if (ticketValue) {
        brancheGitInput.value = "feature/" + ticketValue.toLowerCase();
      } else {
        brancheGitInput.value = "";
      }
    });

    // Charger tous les tickets pour l'autocomplete (nouveau ticket uniquement,
    // en édition c'est fait dans loadTicketData)
    if (!ticketId) {
      fetchAllTickets();
    }
    setupAutocomplete();
  });
