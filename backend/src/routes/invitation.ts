import express from "express";
import { v4 as uuid } from "uuid";
import { supabase } from "../config/supabase";        // ✅ Fixed path
import { sendInvitationEmail } from "../utils/email"; // ✅ Fixed path
import requireAuth from "../middleware/requireAuth";  // ✅ Add auth middleware

const router = express.Router();

// ✅ Invite to project
router.post("/:projectId/invite", requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = "member" } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // ✅ Ensure authenticated user
    const inviterEmail = req.user?.email;
    const inviterName =
      req.user?.name || (inviterEmail ? inviterEmail.split("@")[0] : "Unknown");

    if (!inviterEmail) {
      return res.status(401).json({ error: "Unauthorized: No inviter email found" });
    }

    const token = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // ✅ Insert invitation in DB
    const { data: invitation, error: insertError } = await supabase
      .from("project_invitations")
      .insert([
        {
          project_id: projectId,
          invited_by_email: inviterEmail,
          invited_email: email,
          role,
          status: "pending",
          token,
          expires_at: expiresAt,
        },
      ])
      .select("*")
      .single();

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    // ✅ Fetch project title
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single();

    const projectTitle = project?.title || "Project";

    if (projectError) {
      console.error("Project Fetch Error:", projectError);
    }

    await sendInvitationEmail({
        inviterEmail,
        invitedEmail: email,     // ✅ Added this
        inviterName,
        role,
        invitationToken: token,
        projectTitle: projectTitle,
        projectId
    });

    return res.json({
      success: true,
      message: "Invitation email sent successfully",
      invitation,
    });

  } catch (err: any) {
    console.error("Invite Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
