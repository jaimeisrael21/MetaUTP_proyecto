"use client";

// Capa de acceso a datos. Hoy vive en localStorage (sitio 100% estático, sin
// backend, para eliminar riesgo de demo en vivo). Está aislada en este único
// archivo a propósito: si más adelante se agrega un backend real (ej.
// Supabase), solo hay que reescribir las funciones de este archivo — el resto
// de la app llama a estas funciones, nunca a localStorage directamente.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { emptyProfile, emptyProfileFacts, type StudentProfile } from "@/data/types";
import { persistProfileForAuthenticatedUser } from "@/lib/supabase/profile-sync";

const PROFILE_KEY = "metautp:profile";
const SESSION_KEY = "metautp:session";
const STORE_EVENT = "metautp:storage-change";

export interface Session {
  loggedIn: boolean;
  name?: string;
  email?: string;
}

const emptySession: Session = { loggedIn: false };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.) — se
    // ignora silenciosamente, la app sigue funcionando en memoria durante la
    // sesión.
  }
}

export function getProfile(): StudentProfile {
  return normalizeProfile(readJson(PROFILE_KEY, emptyProfile));
}

export function saveProfile(profile: StudentProfile) {
  writeJson(PROFILE_KEY, profile);
  void persistProfileForAuthenticatedUser(profile).catch(() => {
    // La copia local mantiene el recorrido disponible si la red o Supabase fallan.
  });
}

export function updateProfile(patch: Partial<StudentProfile>): StudentProfile {
  const next = { ...getProfile(), ...patch };
  saveProfile(next);
  return next;
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: PROFILE_KEY }));
}

export function getSession(): Session {
  return readJson(SESSION_KEY, emptySession);
}

export function setSession(session: Session) {
  writeJson(SESSION_KEY, session);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: SESSION_KEY }));
}

function subscribeToKey(key: string, onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === key) onStoreChange();
  }
  function handleLocalChange(event: Event) {
    if ((event as CustomEvent<string>).detail === key) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORE_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORE_EVENT, handleLocalChange);
  };
}

function profileSnapshot() {
  return window.localStorage.getItem(PROFILE_KEY);
}

function sessionSnapshot() {
  return window.localStorage.getItem(SESSION_KEY);
}

function serverSnapshot() {
  return null;
}

function subscribeProfile(onStoreChange: () => void) {
  return subscribeToKey(PROFILE_KEY, onStoreChange);
}

function subscribeSession(onStoreChange: () => void) {
  return subscribeToKey(SESSION_KEY, onStoreChange);
}

function subscribeHydration() {
  return () => undefined;
}

function clientHydrated() {
  return true;
}

function serverHydrated() {
  return false;
}

function parseSnapshot<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function normalizeProfile(profile: StudentProfile): StudentProfile {
  return {
    ...emptyProfile,
    ...profile,
    preferredCategories: profile.preferredCategories ?? [],
    courses: profile.courses ?? [],
    facts: { ...emptyProfileFacts, ...(profile.facts ?? {}) },
  };
}

/**
 * Hook de perfil del estudiante. Maneja hidratación de forma segura (SSR
 * siempre entrega emptyProfile; el valor real de localStorage llega después
 * del primer render en cliente) para evitar mismatches de hidratación.
 */
export function useProfile() {
  const rawProfile = useSyncExternalStore(subscribeProfile, profileSnapshot, serverSnapshot);
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  const profile = useMemo(
    () => normalizeProfile(parseSnapshot(rawProfile, emptyProfile)),
    [rawProfile]
  );

  const update = useCallback((patch: Partial<StudentProfile>) => {
    const next = { ...getProfile(), ...patch };
    saveProfile(next);
  }, []);

  return { profile, update, hydrated };
}

export function useSession() {
  const rawSession = useSyncExternalStore(subscribeSession, sessionSnapshot, serverSnapshot);
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  const session = useMemo(() => parseSnapshot(rawSession, emptySession), [rawSession]);

  const login = useCallback((data: { name?: string; email?: string }) => {
    const next: Session = { loggedIn: true, ...data };
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  return { session, login, logout, hydrated };
}
