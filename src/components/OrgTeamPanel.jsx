import { useEffect, useMemo, useState } from "react";
import { findOrgMembers } from "../data/orgMembers.js";
import { INSTITUTION_MEMBER_ROLES } from "../data/institutions/institutionTypes.js";
import { useInstitutionPresence } from "../hooks/useInstitutionPresence.js";

function roleLabel(role) {
  return INSTITUTION_MEMBER_ROLES[role]?.label ?? (role === "admin" ? "Správce" : "Editor");
}

function personName(member) {
  return String(member.contact_name || "").trim() || String(member.name || "").trim() || "Kolega";
}

/**
 * Společná správa úřadu / podniku — kdo je připojený a kdo je právě aktivní.
 */
export default function OrgTeamPanel({
  institutionId = null,
  businessIco = null,
  userId = null,
  displayName = "Ty",
  title = "Správa týmu",
  emptyHint = "Zatím jsi tu sama. Další kolega se připojí stejnou registrací.",
  peers: peersProp = null,
}) {
  const [members, setMembers] = useState([]);
  const enabled = Boolean((institutionId || businessIco) && userId) && peersProp == null;
  const { peers: livePeers } = useInstitutionPresence({
    institutionId,
    businessIco,
    userId,
    displayName,
    enabled,
  });
  const peers = peersProp ?? livePeers;

  useEffect(() => {
    let cancelled = false;
    if (!institutionId && !businessIco) {
      setMembers([]);
      return undefined;
    }
    findOrgMembers({ institutionId, businessIco }).then((rows) => {
      if (!cancelled) setMembers(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [institutionId, businessIco]);

  const rows = useMemo(() => {
    const onlineIds = new Set(peers.map((p) => p.userId));
    if (userId) onlineIds.add(userId);
    const list = members.length
      ? members
      : userId
        ? [{ id: userId, contact_name: displayName, name: displayName, org_role: "admin", email: "" }]
        : [];
    return list.map((member) => ({
      ...member,
      online: onlineIds.has(member.id),
    }));
  }, [members, peers, userId, displayName]);

  const onlineCount = rows.filter((row) => row.online).length;

  return (
    <section className="rounded-2xl border border-[#C5DDD4] bg-white p-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-stone-900">{title}</h3>
        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
          Pod jedním účtem může pracovat víc lidí najednou. Tady vidíš, kdo je připojený a kdo je zrovna aktivní.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-stone-500">{emptyHint}</p>
      ) : (
        <>
          <p className="text-[11px] text-stone-500">
            Připojeno {rows.length === 1 ? "1 osoba" : `${rows.length} lidí`}
            {onlineCount > 0 ? ` · aktivní teď: ${onlineCount}` : ""}
          </p>
          <ul className="space-y-2">
            {rows.map((member) => {
              const mine = member.id === userId;
              return (
                <li
                  key={member.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/70 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {personName(member)}
                      {mine ? <span className="text-[11px] font-medium text-stone-400"> · ty</span> : null}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {roleLabel(member.org_role)}
                      {member.email ? ` · ${member.email}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                      member.online
                        ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                        : "text-stone-400 bg-white border border-stone-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${member.online ? "bg-emerald-600" : "bg-stone-300"}`}
                      aria-hidden
                    />
                    {member.online ? "Aktivní" : "Offline"}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
