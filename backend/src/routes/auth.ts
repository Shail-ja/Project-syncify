import express from "express";
import supabase from "../config/supabase";
import { UserPayload } from "../types";

const router = express.Router();
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// -------------------------------------------
// Validate Supabase access token, ensure user exists, return session info
// -------------------------------------------
router.post("/token", async (req, res) => {
  const authHeader = req.headers.authorization;
  const bodyToken = (req.body as any)?.access_token as string | undefined;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : bodyToken;

  if (!accessToken) return res.status(400).json({ error: "Missing access token" });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid or expired token" });

  const email = data.user.email || "";
  const id = data.user.id;

  try {
    const metaFirstName = data.user.user_metadata?.first_name;
    const metaLastName = data.user.user_metadata?.last_name;
    await supabase
      .from("users")
      .upsert(
        {
          id,
          email,
          first_name: metaFirstName && metaFirstName.trim() ? metaFirstName.trim() : null,
          last_name: metaLastName && metaLastName.trim() ? metaLastName.trim() : null,
        },
        { onConflict: "id" }
      )
      .select("id")
      .single();
  } catch (err) {
    console.warn("Failed to upsert user:", (err as any).message || err);
  }

  const isAdmin = email ? ADMIN_EMAILS.includes(email) : false;
  const user: UserPayload = { email, isAdmin, id } as any;

  res.json({ accessToken, user });
});

// -------------------------------------------
// Get Current User Profile
// -------------------------------------------
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = data.user.id;
    const email = data.user.email || "";

    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, bio, phone, job_title, company, location, timezone, website, twitter, linkedin, github, created_at")
      .eq("id", userId)
      .single();

    if (userError && userError.code !== "PGRST116") {
      console.warn("Failed to fetch user data:", userError);
    }

    // Combine auth user data with database user data
    const user = {
      id: userId,
      email: email,
      firstName: userData?.first_name || data.user.user_metadata?.first_name || "",
      lastName: userData?.last_name || data.user.user_metadata?.last_name || "",
      fullName: userData?.first_name && userData?.last_name 
        ? `${userData.first_name} ${userData.last_name}`.trim()
        : email.split("@")[0], // Fallback to email username
      bio: userData?.bio || "",
      phone: userData?.phone || "",
      jobTitle: userData?.job_title || "",
      company: userData?.company || "",
      location: userData?.location || "",
      timezone: userData?.timezone || "",
      website: userData?.website || "",
      twitter: userData?.twitter || "",
      linkedin: userData?.linkedin || "",
      github: userData?.github || "",
      createdAt: userData?.created_at || data.user.created_at,
    };

    res.json({ user });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// -------------------------------------------
// Update User Profile
// -------------------------------------------
router.put("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = data.user.id;
    const { 
      firstName, 
      lastName, 
      email: newEmail,
      bio,
      phone,
      jobTitle,
      company,
      location,
      timezone,
      website,
      twitter,
      linkedin,
      github
    } = req.body;

    // Update user in database
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (firstName !== undefined) updateData.first_name = firstName || null;
    if (lastName !== undefined) updateData.last_name = lastName || null;
    if (newEmail !== undefined && newEmail !== data.user.email) {
      // Email changes require Supabase auth update (optional - can be handled separately)
      updateData.email = newEmail;
    }
    if (bio !== undefined) updateData.bio = bio || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (jobTitle !== undefined) updateData.job_title = jobTitle || null;
    if (company !== undefined) updateData.company = company || null;
    if (location !== undefined) updateData.location = location || null;
    if (timezone !== undefined) updateData.timezone = timezone || null;
    if (website !== undefined) updateData.website = website || null;
    if (twitter !== undefined) updateData.twitter = twitter || null;
    if (linkedin !== undefined) updateData.linkedin = linkedin || null;
    if (github !== undefined) updateData.github = github || null;

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("id, email, first_name, last_name, bio, phone, job_title, company, location, timezone, website, twitter, linkedin, github, created_at")
      .single();

    if (updateError) {
      console.error("Failed to update user:", updateError);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    const user = {
      id: userId,
      email: updatedUser?.email || data.user.email || "",
      firstName: updatedUser?.first_name || "",
      lastName: updatedUser?.last_name || "",
      fullName: updatedUser?.first_name && updatedUser?.last_name 
        ? `${updatedUser.first_name} ${updatedUser.last_name}`.trim()
        : (updatedUser?.email || data.user.email || "").split("@")[0],
      bio: updatedUser?.bio || "",
      phone: updatedUser?.phone || "",
      jobTitle: updatedUser?.job_title || "",
      company: updatedUser?.company || "",
      location: updatedUser?.location || "",
      timezone: updatedUser?.timezone || "",
      website: updatedUser?.website || "",
      twitter: updatedUser?.twitter || "",
      linkedin: updatedUser?.linkedin || "",
      github: updatedUser?.github || "",
      createdAt: updatedUser?.created_at || data.user.created_at,
    };

    res.json({ user, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// -------------------------------------------
// Login Route
// -------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.session) {
      return res.status(401).json({ error: authError?.message || "Invalid email or password" });
    }

    const user = authData.user;
    const accessToken = authData.session.access_token;

    // Ensure user exists in users table and get user data
    let userData = null;
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // Create user record if doesn't exist
        const metaFirstName = user.user_metadata?.first_name;
        const metaLastName = user.user_metadata?.last_name;
        await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              email: user.email,
              first_name: metaFirstName && metaFirstName.trim() ? metaFirstName.trim() : null,
              last_name: metaLastName && metaLastName.trim() ? metaLastName.trim() : null,
            },
            { onConflict: "id" }
          );
      } else {
        // Update null values if metadata has them
        const metaFirstName = user.user_metadata?.first_name;
        const metaLastName = user.user_metadata?.last_name;
        const updateData: any = {};
        
        if (!existingUser.first_name && metaFirstName && metaFirstName.trim()) {
          updateData.first_name = metaFirstName.trim();
        }
        if (!existingUser.last_name && metaLastName && metaLastName.trim()) {
          updateData.last_name = metaLastName.trim();
        }
        
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id);
          
          // Update userData with new values
          userData = {
            ...existingUser,
            ...updateData,
          };
        } else {
          userData = existingUser;
        }
      }
    } catch (err) {
      console.warn("Failed to upsert user:", (err as any).message || err);
    }

    res.json({
      message: "Login successful",
      token: accessToken,
      email: user.email,
      firstName: userData?.first_name || user.user_metadata?.first_name || "",
      lastName: userData?.last_name || user.user_metadata?.last_name || "",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// -------------------------------------------
// Register Route
// -------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log("Register request received:", { email, hasPassword: !!password, firstName, lastName });

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate password length (Supabase requires at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
      },
    });

    if (authError) {
      console.error("Supabase signup error:", authError);
      
      // Provide helpful error message for database errors
      if (authError.code === "unexpected_failure" || authError.message?.includes("Database error")) {
        return res.status(500).json({ 
          error: "Database configuration error. Please check your Supabase database setup.",
          details: "This usually indicates a missing or broken database trigger. Please run the SQL script in backend/fix_users_table.sql in your Supabase SQL Editor.",
          code: authError.code
        });
      }
      
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      console.error("No user returned from Supabase");
      return res.status(400).json({ error: "Failed to create user" });
    }

    console.log("User created successfully:", authData.user.id);

    // If email confirmation is required, Supabase won't return a session immediately
    // Check if session exists (email confirmation disabled) or not (email confirmation enabled)
    if (authData.session) {
      // Email confirmation is disabled - user is logged in immediately
      const accessToken = authData.session.access_token;

      // Create user record in users table
      try {
        await supabase.from("users").upsert(
          {
            id: authData.user.id,
            email: authData.user.email,
            first_name: firstName && firstName.trim() ? firstName.trim() : null,
            last_name: lastName && lastName.trim() ? lastName.trim() : null,
          },
          { onConflict: "id" }
        );
      } catch (err) {
        console.warn("Failed to create user record:", (err as any).message || err);
      }

      return res.status(201).json({
        message: "Account created successfully",
        token: accessToken,
        email: authData.user.email,
      });
    } else {
      // Email confirmation is enabled - user needs to verify email
      return res.status(201).json({
        message: "Account created. Please check your email to verify your account.",
        email: authData.user.email,
        requiresEmailVerification: true,
      });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
