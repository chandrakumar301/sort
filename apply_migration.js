import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://imnxbptmrwoduxwfahoh.supabase.co";
const supabaseKey = "sb_publishable_YvBr8VUlfQP8PNVVosKx1Q_Vlobhj8M";

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Try to add the enum value
    const { error } = await supabase.rpc("exec_sql", {
      sql_string: `ALTER TYPE public.loan_status ADD VALUE 'completed' AFTER 'disbursed';`,
    });

    if (error) {
      console.log("Enum update note:", error.message);
    } else {
      console.log("Migration applied successfully");
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

applyMigration();
