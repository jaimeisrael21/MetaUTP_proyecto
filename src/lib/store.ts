"use client";

// Capa de acceso a datos. Hoy vive en localStorage (sitio 100% estático, sin
// backend, para eliminar riesgo de demo en vivo). Está aislada en este único
// archivo a propósito: si más adelante se agrega un backend real (ej.
// Supabase), solo hay que reescribir las funciones de este archivo — el resto
// de la app llama a estas funciones, nunca a localStorage directamente.

import { useCallback, useEffect, useState } from "react";
import { emptyProfile, type StudentProfile } from "@/data/types";

const PROFILE_KEY = "metautp:profile";
const SESSION_KEY = "metautp:session";

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
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.) — se
    // ignora silenciosamente, la app sigue funcionando en memoria durante la
    // sesión.
  }
}

export function getProfile(): StudentProfile {
  return readJson(PROFILE_KEY, emptyProfile);
}

export function saveProfile(profile: StudentProfile) {
  writeJson(PROFILE_KEY, profile);
}

export function updateProfile(patch: Partial<StudentProfile>): StudentProfile {
  const next = { ...getProfile(), ...patch };
  saveProfile(next);
  return next;
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
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
}

/**
 * Hook de perfil del estudiante. Maneja hidratación de forma segura (SSR
 * siempre entrega emptyProfile; el valor real de localStorage llega después
 * del primer render en cliente) para evitar mismatches de hidratación.
 */
export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      return next;
    });
  }, []);

  return { profile, update, hydrated };
}

export function useSession() {
  const [session, setSessionState] = useState<Session>(emptySession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setHydrated(true);
  }, []);

  const login = useCallback((data: { name?: string; email?: string }) => {
    const next: Session = { loggedIn: true, ...data };
    setSession(next);
    setSessionState(next);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(emptySession);
  }, []);

  return { session, login, logout, hydrated };
}
