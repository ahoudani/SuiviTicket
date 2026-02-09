Suivi de tickets (PBi/Bug/Spike) – Organisation Cegid
Présentation
Cet outil permet d’effectuer le suivi des tickets (PBi, Bug, Spike) pour les équipes de Cegid. Il s’exécute en local via un fichier batch et nécessite Node.js.
Veuillez suivre les instructions ci-dessous pour la première configuration et le lancement.

Prérequis
Node.js doit être installé sur votre machine.
Vous pouvez vérifier l’installation en exécutant dans un terminal :

node -v
bash

Installation & Utilisation
Cloner ou copier le dossier du projet sur votre poste de travail.

Modifier le chemin d’accès dans le fichier lancer_suiviticket.bat :

Ouvrez le fichier lancer_suiviticket.bat avec un éditeur de texte (Notepad, VS Code, etc.).
Repérez la ligne contenant le chemin d’accès au projet.
Remplacez ce chemin par le chemin exact où se trouve le dossier du projet sur votre ordinateur.
Par exemple :

cd /d "C:\Votre\Dossier\Projet\suiviticket"
bat

Sauvegardez le fichier lancer_suiviticket.bat après modification.

Lancer l’application :

Double-cliquez sur le fichier lancer_suiviticket.bat.
Une fenêtre de commande devrait s’ouvrir et démarrer le suivi de tickets.
Résolution des problèmes
Si Node.js n’est pas installé, téléchargez-le depuis le site officiel, puis réessayez.
Vérifiez que le chemin renseigné correspond bien à l’emplacement du dossier du projet.
L’application ne s’ouvre pas ou affiche une erreur ? Assurez-vous que tous les prérequis sont remplis et que le chemin dans le batch est correct.
Notes
Cet outil est réservé à un usage interne à Cegid.
Pour toute question ou anomalie, contactez l’équipe projet ou votre référent technique.
