/**
 * Sdílená správa úřadu / podniku — víc lidí na jednom subjektu.
 */

import { ensureSupabase } from "../lib/supabaseClient.js";
import { normalizeIco } from "./aresLookup.js";

export async function findOrgMembers({ institutionId = null, businessIco = null } = {}) {
  const sb = await ensureSupabase();
  if (!sb) return [];
  let query = sb
    .from("profiles")
    .select("id, name, email, institution_id, business_ico, org_role, contact_name");
  if (institutionId) query = query.eq("institution_id", institutionId);
  else if (businessIco) query = query.eq("business_ico", normalizeIco(businessIco));
  else return [];
  let { data, error } = await query.limit(40);
  if (error && /contact_name/.test(String(error.message || ""))) {
    query = sb.from("profiles").select("id, name, email, institution_id, business_ico, org_role");
    if (institutionId) query = query.eq("institution_id", institutionId);
    else query = query.eq("business_ico", normalizeIco(businessIco));
    ({ data, error } = await query.limit(40));
  }
  if (error) {
    if (!String(error.message || "").includes("does not exist")) {
      console.warn("[org members]", error.message);
    }
    return [];
  }
  return data ?? [];
}

export function nextOrgRole(existingMembers = []) {
  return existingMembers.length ? "editor" : "admin";
}
