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
    await supabase
      .from("users")
      .upsert(
        {
          id,
          email,
          first_name: data.user.user_metadata?.first_name || null,
          last_name: data.user.user_metadata?.last_name || null,
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

    // Ensure user exists in users table
    try {
      await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email,
            first_name: null, // Can be updated later if needed
            last_name: null,
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();
    } catch (err) {
      console.warn("Failed to upsert user:", (err as any).message || err);
    }

    res.json({
      message: "Login successful",
      token: accessToken,
      email: user.email,
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
            first_name: firstName || null,
            last_name: lastName || null,
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
