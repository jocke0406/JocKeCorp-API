# 🚀 JockeCorp API

Une API Express + MongoDB pour gérer les utilisateurs de JockeCorp.

## 📂 Fonctionnalités

- CRUD complet sur les utilisateurs (`/users`)
- Authentification basique :
  - `POST /auth/register`
  - `POST /auth/login`
- Soft delete (`deleted_at`)
- Validation avec Joi
- Hashage des mots de passe avec Argon2

## 🔧 Installation

```bash
git clone git@github.com:TonPseudo/JocKeCorp-API.git
cd JocKeCorp-API
npm install
cp .env.example .env
npm run dev
```

## ⚡ Routes principales

- `GET/health` — vérifie l’état du serveur
- `GET/users` — liste les utilisateurs actifs
- `PATCH/users/:id` — met à jour un utilisateur
- `DELETE/users/:id` — soft delete

## 🛠️ Stack

Node.js / Express
MongoDB (driver officiel)
Joi (validation)
Argon2 (hashage)
Nodemon (dev)
