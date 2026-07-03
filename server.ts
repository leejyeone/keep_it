import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to convert string to numeric bigint ID (safe positive integer for Supabase)
function stringToNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 1. Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// 2. Initialize Supabase Client (safe fallback if keys are missing)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = supabaseUrl.trim() !== "" && supabaseAnonKey.trim() !== "";

let supabase: any = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.log("Supabase is not configured yet. Falling back to LocalStorage persistence.");
}

// --- API Endpoints ---

// Get Configuration Status
app.get("/api/config", (req, res) => {
  res.json({
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: isSupabaseConfigured ? supabaseUrl.substring(0, 15) + "..." : null
  });
});

// Generate dynamic recommended supplements using Gemini 3.5 Flash
app.post("/api/recommend", async (req, res) => {
  const { gender, age } = req.body;
  if (!gender || !age) {
    return res.status(400).json({ error: "성별과 나이를 모두 제공해야 합니다." });
  }

  const ageNum = parseInt(age, 10);
  const genderKorean = gender === "M" ? "남성" : "여성";

  try {
    const prompt = `Recommend exactly 3 supplements tailored specifically for a ${ageNum} years old ${genderKorean} in South Korea. 
Provide professional, highly relevant, and realistic details.
Respond in Korean for the text fields (name, description, benefits), but keep IDs, iconType, and defaultTime in standard English.

Constraints:
- iconType MUST be one of: 'zap', 'shield', 'sun', 'activity', 'eye', 'heart', 'sparkles', 'droplet', 'bone', 'clock'
- defaultTime MUST be one of: 'morning', 'afternoon', 'evening', 'any'`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Snake_case unique string ID, e.g. lactobacillus" },
              name: { type: Type.STRING, description: "Name of the supplement in Korean, e.g. 유산균" },
              description: { type: Type.STRING, description: "A friendly 1-2 sentence description in Korean detailing why this is recommended for their age and gender." },
              benefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 3 brief, precise benefit bullet points in Korean."
              },
              iconType: { type: Type.STRING, description: "Must be exactly one of: zap, shield, sun, activity, eye, heart, sparkles, droplet, bone, clock" },
              defaultTime: { type: Type.STRING, description: "Must be exactly one of: morning, afternoon, evening, any" }
            },
            required: ["id", "name", "description", "benefits", "iconType", "defaultTime"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const recommendedSupplements = JSON.parse(text);
    res.json({ success: true, data: recommendedSupplements });

  } catch (error: any) {
    console.error("Gemini API recommendations generation failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "추천 영양제 생성 중 오류가 발생했습니다." 
    });
  }
});

// Sync user's state to Supabase
app.post("/api/sync/save", async (req, res) => {
  if (!supabase) {
    return res.json({ success: true, info: "Supabase not connected. LocalStorage used." });
  }

  const { userId, profile, routines, historyLog } = req.body;
  if (!userId || !profile) {
    return res.status(400).json({ error: "userId and profile are required for syncing" });
  }

  try {
    // 1. Map and Sync User Profile
    // We insert both age and age_group columns to cover whichever schema is defined in Supabase
    const calculatedAgeGroup = profile.age < 30 ? "20s" : profile.age < 40 ? "30s" : "40s_50s";
    
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        gender: profile.gender,
        age: parseInt(profile.age, 10),
        age_group: calculatedAgeGroup,
        name: profile.name
      });

    if (profileError) {
      console.warn("Profile sync error (might be table schema mismatch, continuing):", profileError);
    }

    // 2. Sync Supplements
    // Gather all routine supplements, check if they exist or insert them
    if (routines && routines.length > 0) {
      const supplementRecords = routines.map((r: any) => ({
        id: stringToNumericId(r.name),
        name: r.name,
        target_group: profile.gender + "_" + calculatedAgeGroup
      }));

      // Upsert supplements
      const { error: supError } = await supabase
        .from("supplements")
        .upsert(supplementRecords, { onConflict: "id" });

      if (supError) {
        console.warn("Supplements table sync error (continuing):", supError);
      }

      // 3. Sync User Routines
      // Map check list routines. If checked today, is_checked = true.
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayRecord = historyLog[todayKey] || {};

      const routineRecords = routines.map((r: any) => ({
        id: stringToNumericId(r.id),
        user_id: userId,
        supplement_id: stringToNumericId(r.name),
        is_checked: !!todayRecord[r.id],
        created_at: r.createdAt || new Date().toISOString()
      }));

      // Clear previous routines first to prevent duplicate lists, then insert current active ones
      await supabase
        .from("user_routines")
        .delete()
        .eq("user_id", userId);

      const { error: routinesError } = await supabase
        .from("user_routines")
        .insert(routineRecords);

      if (routinesError) {
        console.warn("User routines table sync error (continuing):", routinesError);
      }
    }

    res.json({ success: true, message: "Supabase sync successfully executed." });

  } catch (error: any) {
    console.error("Supabase sync failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load user's state from Supabase
app.get("/api/sync/load", async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, error: "Supabase not connected." });
  }

  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // 1. Fetch Profile
    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profileData) {
      return res.json({ success: false, error: "프로필이 존재하지 않습니다." });
    }

    // 2. Fetch User Routines
    const { data: routinesData, error: routinesErr } = await supabase
      .from("user_routines")
      .select(`
        id,
        is_checked,
        created_at,
        supplement_id,
        supplements (
          name
        )
      `)
      .eq("user_id", userId);

    if (routinesErr) {
      console.error("Error loading routines:", routinesErr);
    }

    // Map database results back to application structures
    const loadedProfile = {
      gender: profileData.gender,
      age: profileData.age || (profileData.age_group === "20s" ? 25 : profileData.age_group === "30s" ? 35 : 45),
      name: profileData.name || "사용자"
    };

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const loadedRoutines: any[] = [];
    const loadedTodayRecord: any = {};

    if (routinesData) {
      routinesData.forEach((row: any) => {
        const supName = row.supplements?.name || "추천 영양제";
        const routineId = `routine_${row.id}`;
        
        loadedRoutines.push({
          id: routineId,
          name: supName,
          timeOfDay: 'any', // default fallback
          dosage: '1캡슐',
          isCustom: false,
          createdAt: row.created_at
        });

        if (row.is_checked) {
          loadedTodayRecord[routineId] = true;
        }
      });
    }

    res.json({
      success: true,
      data: {
        profile: loadedProfile,
        routines: loadedRoutines,
        historyLog: {
          [todayKey]: loadedTodayRecord
        }
      }
    });

  } catch (error: any) {
    console.error("Supabase load failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Vite middleware configuration or production build static folder serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
