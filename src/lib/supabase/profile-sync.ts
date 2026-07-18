import type { StudentProfile } from "@/data/types";
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

  if (profile.courses.length > 0) {
    const { error: coursesError } = await supabase.from("courses").upsert(
      profile.courses.map((course) => ({
        id: course.id,
        user_id: user.id,
        name: course.name,
        credits: course.credits,
        grade: course.grade,
        updated_at: new Date().toISOString(),
      }))
    );
    if (coursesError) throw coursesError;
  }
}
