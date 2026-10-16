# ANTA Management Platform

Plateforme web moderne de gestion immobilière multi-propriétés développée avec **Next.js 16 (App Router & Turbopack)**, **PostgreSQL (Drizzle ORM)** et **NextAuth.js**.

## 🚀 Fonctionnalités Clés

* **Multi-Propriétés** : Gestion multi-résidences (`RES-01`, `RES-02`, etc.) avec assignation granulaire des utilisateurs par le Super Admin et sélecteur dynamique dans la barre de navigation.
* **Sécurité & Authentification** : Rôles stricts (`super_admin`, `admin`, `gestionnaire`, `proprietaire`, `comptable`, `technicien`), mots de passe hachés avec `bcryptjs`, flux de réinitialisation sécurisé par token temporaire (1 heure).
* **Gestion des Loyers & Finances** : Calculs automatiques des impayés, acomptes, soldes restants, bilans financiers et trésorerie nette.
* **Moteur d'Email Open-Source & SMTP** : Support de n'importe quel serveur SMTP (Stalwart, Mailcow, Postfix, Gmail, Brevo) et mode de prévisualisation web immédiate avec Nodemailer Ethereal.
* **Exports Professionnels** : Quittances de loyer au format PDF certifié (`jspdf`), tableurs financiers Excel multi-onglets (`xlsx`), exports Grand Livre CSV UTF-8 avec BOM, et archives comptables ZIP (`jszip`).

## 🛠️ Stack Technique

* **Framework** : Next.js 16.3.5 (Turbopack, App Router)
* **Langage** : TypeScript 5
* **Base de données** : PostgreSQL via Drizzle ORM (`pg.Pool`)
* **Authentification** : NextAuth.js v4 (Stratégie JWT & Middleware de permissions)
* **Email** : Nodemailer (SMTP standard & Ethereal)
* **Styling & UI** : Tailwind CSS, Framer Motion, Lucide Icons

## 📦 Installation & Démarrage Local

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/Rocena/residence-anta.git
   cd residence-anta
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

4. **Accéder à l'application** :  
   Ouvrez [http://localhost:3000](http://localhost:3000)

## 🌐 Déploiement sur Vercel

Le projet est configuré pour un déploiement direct et sans accroc sur Vercel avec prise en charge automatique de Turbopack.
