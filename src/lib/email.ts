import * as db from "./db";
import { getDb, isDatabaseConfigured } from "@/db";
import { emailLogs } from "@/db/schema";
import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  template?: string;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  previewUrl?: string;
}

// Cached nodemailer transporter if SMTP credentials provided
let smtpTransporter: any = null;
let etherealTransporter: any = null;

function getSmtpTransporter(): any {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return null;
  }

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return smtpTransporter;
}

async function getEtherealTransporter(): Promise<any> {
  if (etherealTransporter) {
    return etherealTransporter;
  }
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log(`[Email] Compte Ethereal Open-Source créé : ${testAccount.user}`);
    etherealTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return etherealTransporter;
  } catch (err) {
    console.warn("[Email] Impossible de créer un compte Ethereal:", err);
    return null;
  }
}

/**
 * Core email sender with open-source first architecture:
 * 1. Open-Source SMTP / Nodemailer (SMTP_HOST, SMTP_USER, SMTP_PASS)
 * 2. Resend API (RESEND_API_KEY) if configured
 * 3. Automatic Open-Source Ethereal Inbox (Nodemailer test account) with real message delivery & web preview URL
 * 4. Fallback simulation with persistent audit logging in PostgreSQL & DB
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  template = "general",
  metadata = {},
}: SendEmailOptions): Promise<EmailResult> {
  const recipient = Array.isArray(to) ? to.join(", ") : to;
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "ANTA Management <notifications@anta.app>";
  const smtp = getSmtpTransporter();

  let externalId: string | undefined;
  let previewUrl: string | undefined;
  let errorMsg: string | undefined;
  let success = false;

  try {
    // 1. Open-Source SMTP Transporter (Production & Self-hosted SMTP)
    if (smtp) {
      const info = await smtp.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ""),
      });
      externalId = info.messageId;
      success = true;
      console.log(`[Email Envoyé via SMTP Open-Source] ID: ${info.messageId} Destinataire: ${recipient}`);
    }
    // 2. Resend API if specifically provided
    else if (apiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ""),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        errorMsg = errData.message || `Resend HTTP error ${response.status}`;
        console.warn("[Email] Erreur Resend API:", errorMsg);
      } else {
        const data = await response.json();
        externalId = data.id;
        success = true;
      }
    }
    // 3. Open-Source Ethereal Transporter (Envoi Réel avec URL de consultation web)
    else {
      const ethereal = await getEtherealTransporter();
      if (ethereal) {
        const info = await ethereal.sendMail({
          from: fromAddress,
          to: recipient,
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ""),
        });
        externalId = info.messageId;
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        success = true;
        console.log(`[Email Réel Ethereal Envoyé] ID: ${info.messageId} To: ${recipient}`);
        if (previewUrl) {
          console.log(`[Email Preview Web] 👉 ${previewUrl}`);
        }
      } else {
        // 4. Fallback simulation
        console.log(`[Email Simulation] To: ${recipient} | Sujet: "${subject}"`);
        externalId = `sim-${Date.now()}`;
        success = true;
      }
    }
  } catch (err: any) {
    console.error("[Email Exception]", err);
    errorMsg = err.message || "Échec de l'envoi de l'email";
  }

  const enrichedMetadata = {
    ...metadata,
    ...(previewUrl ? { previewUrl } : {}),
  };

  // Record email log in PostgreSQL if available
  if (isDatabaseConfigured()) {
    try {
      const database = getDb();
      await database.insert(emailLogs).values({
        to: recipient,
        subject,
        template,
        status: success ? "sent" : "failed",
        bodyPreview: text ? text.substring(0, 160) : subject,
        error: errorMsg,
        metadata: enrichedMetadata,
      });
    } catch (pgErr) {
      console.warn("[Email] Could not log to PostgreSQL table:", pgErr);
    }
  }

  // Record email log in system file database
  try {
    if (typeof db.addEmailLog === "function") {
      db.addEmailLog({
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        to: recipient,
        subject,
        template,
        status: success ? "sent" : "failed",
        bodyPreview: text ? text.substring(0, 160) : subject,
        error: errorMsg,
        sentAt: new Date().toISOString(),
        metadata: enrichedMetadata,
      });
    }
  } catch (fileErr) {
    console.warn("[Email] Could not log to fileDb:", fileErr);
  }

  return {
    success,
    id: externalId,
    error: errorMsg,
    previewUrl,
  };
}

/**
 * Email template for welcoming new users / accounts with initial credentials
 */
export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
  tempPassword?: string;
  role: string;
}): Promise<EmailResult> {
  const subject = `Bienvenue sur ANTA Management Platform, ${user.name}`;
  const baseUrl = process.env.NEXTAUTH_URL || "https://anta.app";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">ANTA Management Platform</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Système de gestion immobilière et financière</p>
      </div>
      
      <p style="color: #334155; font-size: 16px;">Bonjour <strong>${user.name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        Votre compte d'accès à la plateforme ANTA Management a été créé avec succès avec le rôle : 
        <span style="display: inline-block; padding: 2px 10px; background: #e0e7ff; color: #3730a3; border-radius: 9999px; font-weight: 600; font-size: 13px;">${user.role}</span>.
      </p>

      ${
        user.tempPassword
          ? `
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 13px; font-weight: 600;">Vos identifiants de connexion :</p>
        <p style="margin: 4px 0; color: #1e293b; font-family: monospace; font-size: 14px;"><strong>Email :</strong> ${user.email}</p>
        <p style="margin: 4px 0; color: #1e293b; font-family: monospace; font-size: 14px;"><strong>Mot de passe temporaire :</strong> ${user.tempPassword}</p>
      </div>
      `
          : ""
      }

      <div style="text-align: center; margin: 28px 0;">
        <a href="${baseUrl}/login" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
          Accéder à votre compte
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        Ce message est envoyé automatiquement par ANTA Management Platform. Merci de ne pas y répondre directement.
      </p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html, template: "welcome" });
}

/**
 * Official password reset link email with secure one-time token
 */
export async function sendPasswordResetLinkEmail({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name?: string;
  resetUrl: string;
}): Promise<EmailResult> {
  const subject = "Réinitialisation de votre mot de passe - ANTA Management";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">ANTA Management</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Sécurité du compte</p>
      </div>

      <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Demande de réinitialisation de mot de passe</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Bonjour${name ? ` <strong>${name}</strong>` : ""},</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ANTA Management. Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe :
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
          Réinitialiser mon mot de passe
        </a>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #475569; font-size: 13px;">
          ⏱ <strong>Ce lien est valide pendant 1 heure</strong> et ne peut être utilisé qu'une seule fois.
        </p>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        Si le bouton ci-dessus ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur :<br/>
        <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
      </p>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin-top: 24px;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        ANTA Management Platform • Plateforme de gestion immobilière et financière certifiée
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, template: "password_reset_link" });
}

/**
 * Email template for admin-initiated password reset
 */
export async function sendPasswordResetEmail(
  email: string,
  newPasswordOrToken: string
): Promise<EmailResult> {
  const subject = "Réinitialisation de votre mot de passe - ANTA";
  const baseUrl = process.env.NEXTAUTH_URL || "https://anta.app";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">Réinitialisation de mot de passe</h2>
      <p style="color: #334155;">Bonjour,</p>
      <p style="color: #334155;">Une réinitialisation de votre mot de passe a été effectuée par l'administrateur.</p>
      
      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 6px;">Nouveau mot de passe temporaire :</span>
        <code style="font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 1px;">${newPasswordOrToken}</code>
      </div>

      <p style="color: #334155; font-size: 14px;">Nous vous recommandons de le changer dès votre première connexion dans vos paramètres de profil.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${baseUrl}/login" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
          Se connecter
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        ANTA Management Platform
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, template: "password_reset" });
}

/**
 * Rent receipt email template
 */
export async function sendRentReceiptEmail(
  param1: {
    email: string;
    tenantName?: string;
    name?: string;
    period?: string;
    month?: string;
    amount?: number;
    receiptNumber?: string;
    residenceName?: string;
  } | any,
  param2?: any
): Promise<EmailResult> {
  const options = param2
    ? {
        email: param1.email,
        tenantName: param1.name || param1.tenantName,
        period: param2.month || param2.period || "Courant",
        amount: param2.amount || 0,
        receiptNumber: param2.receiptNumber || "REC-" + Date.now().toString().slice(-6),
        residenceName: param2.residenceName,
      }
    : {
        email: param1.email,
        tenantName: param1.tenantName || param1.name,
        period: param1.period || param1.month || "Courant",
        amount: param1.amount || 0,
        receiptNumber: param1.receiptNumber || "REC-" + Date.now().toString().slice(-6),
        residenceName: param1.residenceName,
      };

  const { email, tenantName, period, amount, receiptNumber, residenceName } = options;
  const subject = `Quittance de loyer ${period} - ${residenceName || "Résidence ANTA"}`;
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin: 0;">${residenceName || "RÉSIDENCE ANTA"}</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Quittance de loyer officielle n° ${receiptNumber}</p>
      </div>

      <p style="color: #334155;">Cher(e) <strong>${tenantName}</strong>,</p>
      <p style="color: #334155;">Nous vous confirmons la bonne réception de votre paiement pour le loyer de la période : <strong>${period}</strong>.</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748b; font-size: 14px;">Montant acquitté :</span>
          <span style="font-weight: bold; color: #059669; font-size: 16px;">${formattedAmount}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748b; font-size: 14px;">Période :</span>
          <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${period}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b; font-size: 14px;">Statut :</span>
          <span style="color: #059669; font-size: 13px; font-weight: bold;">PAYÉ / ACQUITTÉ</span>
        </div>
      </div>

      <p style="color: #475569; font-size: 14px;">
        Ce document certifie le règlement intégral de vos obligations locatives pour la période mentionnée.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        ANTA Management Platform • Service Gestion Locative
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, template: "rent_receipt" });
}

/**
 * Rent unpaid reminder email template
 */
export async function sendUnpaidReminderEmail(
  param1: {
    email: string;
    tenantName?: string;
    name?: string;
    period?: string;
    month?: string;
    amountDue?: number;
    residenceName?: string;
  } | any,
  param2?: any
): Promise<EmailResult> {
  const options = param2
    ? {
        email: param1.email,
        tenantName: param1.name || param1.tenantName,
        period: param2.month || param2.period || "Courant",
        amountDue: param2.amountDue || 0,
        residenceName: param2.residenceName,
      }
    : {
        email: param1.email,
        tenantName: param1.tenantName || param1.name,
        period: param1.period || param1.month || "Courant",
        amountDue: param1.amountDue || 0,
        residenceName: param1.residenceName,
      };

  const { email, tenantName, period, amountDue, residenceName } = options;

  const subject = `Rappel : Loyer en attente (${period}) - ${residenceName || "Résidence ANTA"}`;
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amountDue);

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #ea580c; margin-top: 0;">Rappel d'échéance de loyer</h2>
      <p style="color: #334155;">Bonjour <strong>${tenantName}</strong>,</p>
      <p style="color: #334155;">
        Sauf erreur de notre part, le règlement de votre loyer pour la période <strong>${period}</strong> présente un solde restant à régler de :
      </p>

      <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
        <span style="color: #9a3412; font-size: 14px; display: block; margin-bottom: 4px;">Reste à payer :</span>
        <span style="font-size: 24px; font-weight: bold; color: #c2410c;">${formattedAmount}</span>
      </div>

      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Nous vous prions de bien vouloir procéder à la régularisation dans les meilleurs délais ou de contacter la gestion pour toute question.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        ANTA Management Platform • Service Recouvrement
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, template: "unpaid_reminder" });
}

/**
 * Expense status notification
 */
export async function sendExpenseStatusEmail({
  email,
  title,
  amount,
  status,
  updatedBy,
}: {
  email: string;
  title: string;
  amount: number;
  status: string;
  updatedBy: string;
}): Promise<EmailResult> {
  const subject = `Mise à jour dépense : ${title} (${status})`;
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h3 style="color: #4f46e5; margin-top: 0;">Mise à jour du statut d'une dépense</h3>
      <p style="color: #334155;">La dépense suivante a été modifiée par <strong>${updatedBy}</strong> :</p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0; color: #1e293b;"><strong>Objet :</strong> ${title}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Montant :</strong> ${formattedAmount}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Nouveau statut :</strong> <span style="font-weight: bold; color: #4f46e5;">${status}</span></p>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        ANTA Management Platform
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, template: "expense_status" });
}
