const API_URL = 'http://localhost:3000/tickets';

function displayTickets(tickets) {
  const tbody = document.querySelector('#ticketsTable tbody');
  tbody.innerHTML = '';
  tickets.forEach(t => {
    const tr = document.createElement('tr');
    
    // Ajouter des classes CSS pour les états
    let statusClass = '';
    if (t.state === 'Done') {
      statusClass = 'status-done';
    } else if (t.state === 'Test') {
      statusClass = 'status-test';
    } else if (t.state === 'Dev') {
      statusClass = 'status-dev';
    } else if (t.state === 'StandBy') {
      statusClass = 'status-standby';
    }
    
    if (statusClass) {
      tr.className = statusClass;
    }
    
    tr.innerHTML = `
      <td>
        <div class="action-buttons">
          <button onclick="editTicket(${t.id})" class="btn-action btn-edit" aria-label="Modifier ticket ${t.numero}" title="Modifier">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onclick="deleteTicket(${t.id})" class="btn-action btn-delete" aria-label="Supprimer ticket ${t.numero}" title="Supprimer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </td>
      <td><strong>${t.numero || ''}</strong></td>
      <td>
        ${t.type ? `<span class="type-badge type-${t.type.toLowerCase()}">${t.type}</span>` : ''}
      </td>
      <td style="max-width: 200px; word-wrap: break-word;">${t.nom || ''}</td>
      <td>${t.baseTravail || ''}</td>
      <td>${t.serveurBase || ''}</td>
      <td style="font-family: monospace; font-size: 12px;">${t.cheminGit || ''}</td>
      <td style="font-family: monospace; font-size: 12px;">${t.brancheGit || ''}</td>
      <td>
        ${t.state ? `<span class="status-badge status-${t.state.toLowerCase()}">${t.state}</span>` : ''}
      </td>          
    `;
    tbody.appendChild(tr);
  });
}

async function loadAllTickets() {
  try {
    const res = await fetch(API_URL);
    const tickets = await res.json();
    displayTickets(tickets);
  } catch (error) {
    console.error('Erreur lors du chargement des tickets:', error);
  }
}


async function searchTickets() {
  const num = document.getElementById('searchNum').value.trim().toLowerCase();
  const nom = document.getElementById('searchNom').value.trim().toLowerCase();
  const state = document.getElementById('searchState').value.trim().toLowerCase();
  const type = document.getElementById('searchType').value.trim().toLowerCase();

  try {
    const res = await fetch(API_URL);
    const tickets = await res.json();

    const filtered = tickets.filter(t => {
      const matchNum = num === '' || (t.numero && t.numero.toLowerCase().includes(num));
      const matchNom = nom === '' || (t.nom && t.nom.toLowerCase().includes(nom));
      const matchType = type === '' || type === 'tous' || (t.type && t.type.toLowerCase().includes(type));
      const matchState = state === '' || state === 'tous' || (t.state && t.state.toLowerCase().includes(state));    

      return matchNum && matchNom && matchState && matchType; 
    });

    displayTickets(filtered);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
  }
}

function newTicket() {
  saveSearchState();
  window.location.href = 'ticket-form.html';
}

function editTicket(id) {
  saveSearchState();
  window.location.href = `ticket-form.html?id=${id}`;
}

document.getElementById('btnSearch').addEventListener('click', searchTickets);
document.getElementById('btnReset').addEventListener('click', () => {
  document.getElementById('searchNum').value = '';
  document.getElementById('searchNom').value = '';
  document.getElementById('searchState').value = 'Tous';
  document.getElementById('searchType').value = 'Tous';
  loadAllTickets();
});

async function deleteTicket(id) {
  // if (!confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?")) return;
  showConfirm('Supprimer ce ticket ?', async () => { 

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          // alert("Erreur lors de la suppression du ticket.");
          showNotification('Erreur lors de la suppression du ticket.', 'error'); 
          return;
        }

        // alert("Ticket supprimé avec succès.");
        showNotification('Ticket supprimé avec succès !', 'info'); 
        searchTickets();
        // loadAllTickets();
      } catch (err) {
        console.error("Erreur réseau :", err);
        // alert("Une erreur est survenue lors de la suppression.");
        showNotification('Une erreur est survenue lors de la suppression.', 'error'); 
      }
  });
}

function saveSearchState() {
  sessionStorage.setItem('searchNum', document.getElementById('searchNum').value);
  sessionStorage.setItem('searchNom', document.getElementById('searchNom').value);
  sessionStorage.setItem('searchState', document.getElementById('searchState').value);
  sessionStorage.setItem('searchType', document.getElementById('searchType').value);

  // Tu peux aussi sauvegarder l'ID du ticket en cours si besoin
}


function restoreSearchState() {
  const num = sessionStorage.getItem('searchNum');
  const nom = sessionStorage.getItem('searchNom');
  const state = sessionStorage.getItem('searchState');
  const type = sessionStorage.getItem('searchType');

  if (num !== null) document.getElementById('searchNum').value = num;
  if (nom !== null) document.getElementById('searchNom').value = nom;
  if (state !== null) document.getElementById('searchState').value = state;
  if (type !== null) document.getElementById('searchType').value = type;

  if (num || nom || state || type) {
    searchTickets(); // ou ta fonction de filtre pour recharger les bons tickets
  }

}

window.addEventListener("DOMContentLoaded", function () {
  restoreSearchState();
  //clearSearchState();
});



function clearSearchState() {
  sessionStorage.removeItem('searchNum');
  sessionStorage.removeItem('searchNom');
  sessionStorage.removeItem('searchState');
  sessionStorage.removeItem('searchType');

}
// Chargement initial
loadAllTickets();