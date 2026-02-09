// notifications.js - Système de notifications modernes
// À inclure dans vos pages HTML

class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = [];
        this.confirmCallback = null;
        this.createModal();
    }

    // Créer le container des notifications
    createContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Créer la modal de confirmation
    createModal() {
        if (document.getElementById('modalOverlay')) return;

        const modal = document.createElement('div');
        modal.id = 'modalOverlay';
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <h3 class="modal-title" id="modalTitle">Confirmer l'action</h3>
                </div>
                <p class="modal-message" id="modalMessage">Êtes-vous sûr de vouloir effectuer cette action ?</p>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-secondary" id="modalCancel">Annuler</button>
                    <button class="modal-btn modal-btn-primary" id="modalConfirm">Confirmer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupModalEvents();
    }

    // Configuration des événements de la modal
    setupModalEvents() {
        const modal = document.getElementById('modalOverlay');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');

        cancelBtn.addEventListener('click', () => this.hideConfirm());
        confirmBtn.addEventListener('click', () => this.confirm());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideConfirm();
        });
    }

    // Afficher une notification
    showNotification(message, type = 'info', title = null, duration = 5000) {
        const notification = this.createNotificationElement(message, type, title, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Suppression automatique
        if (duration > 0) {
            this.startProgressBar(notification, duration);
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    }

    // Créer l'élément notification
    createNotificationElement(message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = this.getIcon(type);
        const autoTitle = title || this.getDefaultTitle(type);

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${autoTitle}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Event listener pour le bouton de fermeture
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

        return notification;
    }

    // Démarrer la barre de progression
    startProgressBar(notification, duration) {
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressBar.style.transition = `width ${duration}ms linear`;
            }, 50);
        }
    }

    // Masquer une notification
    hideNotification(notification) {
        if (!notification.classList.contains('hide')) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    this.notifications = this.notifications.filter(n => n !== notification);
                }
            }, 400);
        }
    }

    // Obtenir l'icône selon le type
    getIcon(type) {
        const icons = {
            success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
            error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[type] || icons.info;
    }

    // Obtenir le titre par défaut
    getDefaultTitle(type) {
        const titles = {
            success: 'Succès',
            error: 'Erreur',
            warning: 'Attention',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }

    // Afficher une modal de confirmation
    showConfirm(message, onConfirm, title = 'Confirmer l\'action') {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        this.confirmCallback = onConfirm;
        modal.classList.add('show');
    }

    // Masquer la modal de confirmation
    hideConfirm() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('show');
        this.confirmCallback = null;
    }

    // Confirmer l'action
    confirm() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirm();
    }
}

// Initialiser le système
const notificationSystem = new NotificationSystem();

// Fonctions globales pour faciliter l'utilisation
window.showNotification = (message, type = 'info', title = null, duration = 5000) => {
    return notificationSystem.showNotification(message, type, title, duration);
};

window.showConfirm = (message, callback, title = 'Confirmer l\'action') => {
    return notificationSystem.showConfirm(message, callback, title);
};

// Fonctions de raccourci
window.showSuccess = (message, title = null) => showNotification(message, 'success', title);
window.showError = (message, title = null) => showNotification(message, 'error', title);
window.showWarning = (message, title = null) => showNotification(message, 'warning', title);
window.showInfo = (message, title = null) => showNotification(message, 'info', title);