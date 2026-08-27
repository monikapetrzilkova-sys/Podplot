/** Lokální záloha inzerátů, výpomoci a vlastních akcí. */

import { loadStoredList, persistStoredList } from "./listStorage.js";

const POSTS_KEY = "podplot-user-posts-v1";
const HELP_KEY = "podplot-help-posts-v1";
const EVENTS_KEY = "podplot-user-events-v1";

export function loadUserPosts(userId) {
  return loadStoredList(POSTS_KEY, userId);
}

export function persistUserPosts(userId, posts) {
  persistStoredList(POSTS_KEY, userId, posts);
}

export function loadHelpPosts(userId) {
  return loadStoredList(HELP_KEY, userId);
}

export function persistHelpPosts(userId, posts) {
  persistStoredList(HELP_KEY, userId, (posts ?? []).filter((p) => p?.mine));
}

export function loadUserEvents(userId) {
  return loadStoredList(EVENTS_KEY, userId);
}

export function persistUserEvents(userId, events) {
  persistStoredList(EVENTS_KEY, userId, (events ?? []).filter((e) => e?.mine));
}
