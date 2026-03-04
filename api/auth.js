// /api/auth.js
console.log("Auth function file loaded (CommonJS minimal test)");

const handler = async (req, res) => {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    console.log("SUPABASE_URL:", url);
    console.log("SUPABASE_KEY:", key ? "Loaded" : "Missing");

    return res.status(200).json({
      message: "Environment variable check (CommonJS)",
      SUPABASE_URL: url || "Missing",
      SUPABASE_KEY: key ? "Loaded" : "Missing",
    });
  } catch (err) {
    console.error("Error in minimal /api/auth:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = handler;
