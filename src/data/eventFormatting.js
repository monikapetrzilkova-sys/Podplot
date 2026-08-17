/** Formátování událostí — wrapper nad českým datem/časem */

export {
  formatCzechEventSchedule as formatEventDateLabel,
  formatCzechEventScheduleFromParts,
  eventDateSortValue,
  isEventPast,
  combineDateAndTime,
  minDateInputValue as minEventDateValue,
  TIME_TBD_LABEL,
} from "./czechDateTime.js";

/** Po tolika nahlášeních (od různých uživatelů) se akce smaže. */
export const EVENT_REPORT_DELETE_THRESHOLD = 3;
