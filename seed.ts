import { db } from "./src/db/index";
import { users, roles, residences, units } from "./src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

async function seed() {
  console.log("🌱 Début de l'initialisation de la base de données PostgreSQL...");

  // 1. Create standard roles
  const rolesData = [
    { name: "super_admin", description: "Super Administrateur Global" },
    { name: "admin", description: "Administrateur système" },
    { name: "proprietaire", description: "Propriétaire (Tévi)" },
    { name: "gestionnaire", description: "Gestionnaire (Véronique, Jean)" },
    { name: "comptable", description: "Comptable & Trésorier" },
    { name: "technicien", description: "Technicien de maintenance" },
    { name: "intendant", description: "Intendant (Calvin)" },
  ];

  for (const r of rolesData) {
    try {
      const existing = await db.select().from(roles).where(eq(roles.name, r.name));
      if (existing.length === 0) {
        await db.insert(roles).values(r);
        console.log(`✅ Rôle '${r.name}' créé.`);
      }
    } catch (e) {
      console.warn(`Avertissement rôle ${r.name}:`, e);
    }
  }

  const allRoles = await db.select().from(roles);
  const getRoleId = (name: string) => allRoles.find((r) => r.name === name)?.id;

  // 2. Create properties / residences
  const propertiesData = [
    {
      reference: "RES-ANTA-01",
      name: "Résidence ANTA Principale",
      address: "Quartier Batterie IV, Libreville",
      city: "Libreville",
      country: "Gabon",
      managerName: "Véronique MIAKABAKANA",
      description: "Immeuble R+3 standing avec 16 appartements et studios.",
    },
    {
      reference: "RES-ANTA-02",
      name: "Résidence Les Palmiers",
      address: "Cap Estérias, Akanda",
      city: "Akanda",
      country: "Gabon",
      managerName: "Jean KPERI",
      description: "Ensemble pavillonnaire de standing avec villas et duplex.",
    },
    {
      reference: "RES-ANTA-03",
      name: "Immeuble Le Phare",
      address: "Plateau, Dakar",
      city: "Dakar",
      country: "Sénégal",
      managerName: "Calvin NZUE",
      description: "Immeuble commercial et résidentiel au cœur de Dakar.",
    },
  ];

  for (const prop of propertiesData) {
    try {
      const existing = await db.select().from(residences).where(eq(residences.name, prop.name));
      if (existing.length === 0) {
        await db.insert(residences).values(prop);
        console.log(`✅ Propriété '${prop.name}' enregistrée.`);
      }
    } catch (e) {
      console.warn(`Avertissement résidence ${prop.name}:`, e);
    }
  }

  // 3. Create seeded user accounts
  const seedPassword = process.env.DEFAULT_SEED_PASSWORD || "password123";
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  const usersData = [
    {
      name: "Super Admin ANTA",
      email: "superadmin@anta.com",
      passwordHash,
      role: "super_admin",
      roleId: getRoleId("super_admin") || getRoleId("admin"),
      residenceIds: ["*"],
    },
    {
      name: "Administrateur",
      email: "admin@anta.com",
      passwordHash,
      role: "admin",
      roleId: getRoleId("admin"),
      residenceIds: ["*"],
    },
    {
      name: "Tévi ADABUNU",
      email: "tevi@anta.com",
      passwordHash,
      role: "proprietaire",
      roleId: getRoleId("proprietaire"),
      residenceIds: ["*"],
    },
    {
      name: "Véronique MIAKABAKANA",
      email: "veronique@anta.com",
      passwordHash,
      role: "gestionnaire",
      roleId: getRoleId("gestionnaire"),
      residenceIds: ["RES-01"],
    },
    {
      name: "Jean KPERI",
      email: "jean@anta.com",
      passwordHash,
      role: "gestionnaire",
      roleId: getRoleId("gestionnaire"),
      residenceIds: ["RES-02"],
    },
    {
      name: "Calvin NZUE",
      email: "calvin@anta.com",
      passwordHash,
      role: "technicien",
      roleId: getRoleId("technicien") || getRoleId("intendant"),
      residenceIds: ["RES-01", "RES-03"],
    },
    {
      name: "Comptable ANTA",
      email: "comptable@anta.com",
      passwordHash,
      role: "comptable",
      roleId: getRoleId("comptable"),
      residenceIds: ["*"],
    },
  ];

  for (const u of usersData) {
    try {
      const existing = await db.select().from(users).where(eq(users.email, u.email));
      if (existing.length === 0) {
        await db.insert(users).values(u as any);
        console.log(`✅ Utilisateur '${u.email}' (${u.role}) créé.`);
      }
    } catch (e) {
      console.warn(`Avertissement utilisateur ${u.email}:`, e);
    }
  }

  console.log("✨ Initialisation PostgreSQL terminée avec succès !");
  console.log(`🔑 Mot de passe par défaut pour tous les comptes : ${seedPassword}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erreur lors du seed :", err);
  process.exit(1);
});
