import nodemailer from 'nodemailer';
import * as crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export interface InvitationEmailData {
  invitedEmail: string;
  projectTitle: string;
  inviterEmail: string;
  inviterName?: string;
  role: string;
  invitationToken: string;
  projectId: string;
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { invitedEmail, projectTitle, inviterEmail, inviterName, role, invitationToken, projectId } = data;
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const acceptUrl = `${frontendUrl}/invitations/accept?token=${invitationToken}`;
  const declineUrl = `${frontendUrl}/invitations/decline?token=${invitationToken}`;
  
  const inviterDisplay = inviterName || inviterEmail.split('@')[0];
  
  const subject = `Invitation to join project: ${projectTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .button-accept { background-color: #10b981; color: white; }
        .button-decline { background-color: #ef4444; color: white; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Invitation</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${inviterDisplay}</strong> has invited you to join the project <strong>"${projectTitle}"</strong> as a <strong>${role}</strong>.</p>
          <p>You can accept or decline this invitation by clicking the buttons below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="button button-accept">Accept Invitation</a>
            <a href="${declineUrl}" class="button button-decline">Decline Invitation</a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">
            Or use these links directly:<br>
            Accept: <a href="${acceptUrl}">${acceptUrl}</a><br>
            Decline: <a href="${declineUrl}">${declineUrl}</a>
          </p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            This invitation will expire in 7 days.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from Syncify. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Hello,

${inviterDisplay} has invited you to join the project "${projectTitle}" as a ${role}.

Accept invitation: ${acceptUrl}
Decline invitation: ${declineUrl}

This invitation will expire in 7 days.

This is an automated message from Syncify. Please do not reply to this email.
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: invitedEmail,
      subject,
      text,
      html
    });
    console.log(`Invitation email sent to ${invitedEmail} for project ${projectId}`);
  } catch (err) {
    console.error('Failed to send invitation email:', (err as any).message || err);
    throw err;
  }
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.warn('sendEmail failed', (err as any).message || err);
    throw err;
  }
}

