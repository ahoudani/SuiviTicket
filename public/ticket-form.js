
const API_URL = 'http://localhost:3000/tickets';

// Récupérer l'ID du ticket depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const ticketId = urlParams.get('id');

// Charger les données du ticket si on est en mode édition
if (ticketId) {
  loadTicketData(ticketId);
}

async function loadTicketData(id) {
  try {
    const res = await fetch(API_URL);
    const tickets = await res.json();
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
    bobs: document.getElementById('bobs').value.trim()
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
    
    // Maintenant vous avez l'ID correct pour les deux cas
    console.log('ID du ticket:', finalTicketId);
    
    // Mettre à jour le champ caché avec le nouvel ID (pour les nouveaux tickets)
    document.getElementById('ticketId').value = finalTicketId;
    
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
  });
