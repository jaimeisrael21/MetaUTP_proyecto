const LEADING_BYTE_ORDER_MARK = /^(?:\uFEFF|\u00EF\u00BB\u00BF)+/u;
const ASCII_HEADER_VALUE = /^[\x21-\x7E]+$/;

function normalizePublicEnvironmentValue(value: string | undefined) {
  return value?.replace(LEADING_BYTE_ORDER_MARK, "").trim() ?? "";
}

export function getSupabasePublicConfig() {
  const url = normalizePublicEnvironmentValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const publishableKey = normalizePublicEnvironmentValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!url || !publishableKey || !ASCII_HEADER_VALUE.test(publishableKey)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") return null;
  } catch {
    return null;
  }

  return { url, publishableKey };
}
