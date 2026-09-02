const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");

const VALID_PERMISSIONS = ["all_access", "program", "foto_homepage", "testimoni", "galeri"];

const parsePermissions = (raw) => {
  if (!raw) return ["all_access"];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((p) => typeof p === "string");
    }
    return ["all_access"];
  } catch {
    return ["all_access"];
  }
};

const getUserPermissions = async (userId) => {
  if (!userId) return ["all_access"];

  try {
    const key = `user_permissions_${userId}`;
    if (isSupabase) {
      const row = await supabase.findOne("settings", { setting_key: key }, "setting_value");
      if (row && row.setting_value) {
        return parsePermissions(row.setting_value);
      }
      return ["all_access"];
    }

    const [rows] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = ?", [key]);
    if (rows.length > 0 && rows[0].setting_value) {
      return parsePermissions(rows[0].setting_value);
    }
    return ["all_access"];
  } catch (error) {
    console.error("Error getting user permissions:", error.message);
    return ["all_access"];
  }
};

const setUserPermissions = async (userId, permissions) => {
  if (!userId) return;

  const validPerms = Array.isArray(permissions) && permissions.length > 0
    ? permissions.filter((p) => typeof p === "string" && (VALID_PERMISSIONS.includes(p) || p === "all_access"))
    : ["all_access"];

  const payload = JSON.stringify(validPerms);
  const key = `user_permissions_${userId}`;

  try {
    if (isSupabase) {
      await supabase.upsertByKey("settings", "setting_key", [{
        setting_key: key,
        setting_value: payload,
      }]);
      return validPerms;
    }

    await pool.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [key, payload]
    );
    return validPerms;
  } catch (error) {
    console.error("Error setting user permissions:", error.message);
    return validPerms;
  }
};

const getPermissionsMapForUsers = async (userIds = []) => {
  const map = {};
  userIds.forEach((id) => {
    map[id] = ["all_access"];
  });

  try {
    if (isSupabase) {
      const rows = await supabase.list("settings", { select: "setting_key,setting_value" });
      rows.forEach((row) => {
        if (row.setting_key && row.setting_key.startsWith("user_permissions_")) {
          const uid = row.setting_key.replace("user_permissions_", "");
          map[uid] = parsePermissions(row.setting_value);
        }
      });
      return map;
    }

    const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'user_permissions_%'");
    rows.forEach((row) => {
      const uid = row.setting_key.replace("user_permissions_", "");
      map[uid] = parsePermissions(row.setting_value);
    });
    return map;
  } catch (error) {
    console.error("Error getting permissions map:", error.message);
    return map;
  }
};

module.exports = {
  VALID_PERMISSIONS,
  parsePermissions,
  getUserPermissions,
  setUserPermissions,
  getPermissionsMapForUsers,
};
