# IMPORTANT : CRÉATION DE LA BASE DE DONNÉES

J'ai essayé d'exécuter la création de la base de données automatiquement depuis le serveur, mais l'API Supabase n'autorise pas l'exécution de requêtes DDL (Data Definition Language) de type `CREATE TABLE` via le client JavaScript, et l'accès direct PostgreSQL n'a pas pu se connecter car votre projet est tout neuf ou suspendu (ou le mode Pooler requiert SSL que le client node de base ne passe pas facilement ici sans certificats additionnels).

C'est une restriction de sécurité normale de Supabase.

**Vous DEVEZ impérativement exécuter le script SQL manuellement dans votre tableau de bord Supabase.**
