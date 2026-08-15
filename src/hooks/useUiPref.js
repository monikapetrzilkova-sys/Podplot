import { useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";

export function useUiPref(key, defaultValue = false) {
  const { getUiPref, setUiPref, toggleUiPref } = useApp();
  const value = getUiPref(key, defaultValue);
  const setValue = useCallback((next) => setUiPref(key, next), [key, setUiPref]);
  const toggle = useCallback(() => toggleUiPref(key, defaultValue), [key, toggleUiPref, defaultValue]);
  return [value, setValue, toggle];
}
