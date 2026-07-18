import { emptyAcademicMetrics, emptyDataProvenance, emptyProfile, emptyProfileFacts, type StudentProfile } from "@/data/types";
import type { Json } from "./database.types";
import { getSupabaseBrowserClient } from "./browser";

export async function persistProfileForAuthenticatedUser(profile: StudentProfile) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: profile.name || null,
    career: profile.career || null,
    cycle: profile.cycle,
    cumulative_gpa: profile.cumulativeGpa,
    approved_credits: profile.approvedCredits,
    academic_period: profile.academicPeriod,
    academic_metrics: profile.academicMetrics as unknown as Json,
    data_provenance: profile.dataProvenance as unknown as Json,
    context_configured: profile.contextConfigured,
    preferred_categories: profile.preferredCategories ?? [],
    profile_facts: profile.facts as unknown as Json,
    goal: profile.goal,
    goal_note: profile.goalNote || null,
    onboarded: profile.onboarded,
    profile_refined: profile.profileRefined,
    academic_setup_complete: profile.academicSetupComplete,
    updated_at: new Date().toISOString(),
  });

  if (profileError) throw profileError;

  const persistedCourses = profile.courses.filter((course) => course.name.trim() && course.credits > 0);
  if (persistedCourses.length > 0) {
    const { error: coursesError } = await supabase.from("courses").upsert(
      persistedCourses.map((course) => ({
        id: course.id,
        user_id: user.id,
        name: course.name,
        credits: course.credits,
        grade: course.grade,
        period: course.period ?? "current",
        weekly_hours: course.weeklyHours ?? 0,
        source: course.source ?? "manual",
        updated_at: new Date().toISOString(),
      }))
    );
    if (coursesError) throw coursesError;
  }

  const keepIds = persistedCourses.map((course) => course.id);
  const staleCoursesQuery = supabase.from("courses").delete().eq("user_id", user.id);
  const { error: deleteError } = keepIds.length > 0
    ? await staleCoursesQuery.not("id", "in", `(${keepIds.join(",")})`)
    : await staleCoursesQuery;
  if (deleteError) throw deleteError;
}

export async function loadProfileForAuthenticatedUser(): Promise<StudentProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: stored, error: profileError }, { data: storedCourses, error: coursesError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("courses").select("*").eq("user_id", user.id).order("created_at"),
  ]);
  if (profileError) throw profileError;
  if (coursesError) throw coursesError;
  if (!stored) return null;
  const facts = (stored.profile_facts && typeof stored.profile_facts === "object" && !Array.isArray(stored.profile_facts) ? stored.profile_facts : {}) as Partial<StudentProfile["facts"]>;
  const metrics = (stored.academic_metrics && typeof stored.academic_metrics === "object" && !Array.isArray(stored.academic_metrics) ? stored.academic_metrics : {}) as Partial<StudentProfile["academicMetrics"]>;
  const provenance = (stored.data_provenance && typeof stored.data_provenance === "object" && !Array.isArray(stored.data_provenance) ? stored.data_provenance : {}) as Partial<StudentProfile["dataProvenance"]>;
  return {
    ...emptyProfile,
    name: stored.full_name ?? (user.user_metadata.full_name as string | undefined) ?? "",
    career: stored.career ?? "",
    cycle: stored.cycle,
    cumulativeGpa: Number(stored.cumulative_gpa),
    approvedCredits: stored.approved_credits,
    academicPeriod: stored.academic_period,
    academicMetrics: { ...emptyAcademicMetrics, ...metrics },
    dataProvenance: { ...emptyDataProvenance, ...provenance },
    courses: (storedCourses ?? []).map((course) => ({ id: course.id, name: course.name, credits: Number(course.credits), grade: Number(course.grade), period: course.period as "current" | "previous" | "historical", weeklyHours: Number(course.weekly_hours), source: course.source as "manual" | "ocr" | "demo" | "institutional" })),
    preferredCategories: stored.preferred_categories as StudentProfile["preferredCategories"],
    facts: { ...emptyProfileFacts, ...facts },
    goal: stored.goal as StudentProfile["goal"],
    goalNote: stored.goal_note ?? "",
    onboarded: stored.onboarded,
    profileRefined: stored.profile_refined,
    academicSetupComplete: stored.academic_setup_complete,
    contextConfigured: stored.context_configured,
  };
}
