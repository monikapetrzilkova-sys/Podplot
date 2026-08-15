import { getRole } from "../data/roles.js";
import { RoleIcon } from "../data/icons.jsx";

export default function RoleBadge({ roleId, size = "sm" }) {
  const role = getRole(roleId);
  const sizeClass = size === "lg" ? "text-xs px-2.5 py-1 gap-1.5" : "text-[10px] px-2 py-0.5 gap-1";

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${role.badge} ${sizeClass}`}>
      <RoleIcon roleId={roleId} className={size === "lg" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {role.label}
    </span>
  );
}

export function Avatar({ initials, roleId, size = "md", photo = null }) {
  const role = getRole(roleId);
  const sizes = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-base",
  };

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`${sizes[size]} rounded-full object-cover shrink-0 ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shrink-0 ${role.bg} ${role.text} ring-2 ring-white`}
    >
      {initials}
    </div>
  );
}
