import {
  ACCOUNT_TYPE_DOODLE_ICONS,
  ROLE_DOODLE_ICONS,
  BUSINESS_SUBTYPE_DOODLE_ICONS,
  DoodleSousedIcon,
} from "./doodle/doodleIcons.jsx";
import { normalizeAccountType } from "../data/accountTypes.js";

/** Monochromatická doodle ikona typu profilu / účtu */
export default function AccountTypeIcon({
  accountType,
  roleId = null,
  businessSubtype = null,
  className = "w-5 h-5",
}) {
  const Icon =
    (roleId && ROLE_DOODLE_ICONS[roleId]) ||
    (businessSubtype && BUSINESS_SUBTYPE_DOODLE_ICONS[businessSubtype]) ||
    ACCOUNT_TYPE_DOODLE_ICONS[normalizeAccountType(accountType)] ||
    DoodleSousedIcon;

  return <Icon className={className} />;
}
