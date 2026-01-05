export type FieldErrorItem = { field?: string; message: string };

export function normalizeApiErrors(payload: any): FieldErrorItem[] {
  if (!payload) return [{ message: "Something went wrong" }];

  // Case A: Backend returns array directly
  if (Array.isArray(payload)) {
    return payload
      .filter(Boolean)
      .map((e) => ({
        field: typeof e?.field === "string" ? e.field : undefined,
        message: String(e?.message ?? "Invalid input"),
      }));
  }

  // Case B: { details: [...] }
  if (Array.isArray(payload.details)) {
    return payload.details.map((e: any) => ({
      field: typeof e?.field === "string" ? e.field : undefined,
      message: String(e?.message ?? "Invalid input"),
    }));
  }

  // Case C: { errors: [...] }
  if (Array.isArray(payload.errors)) {
    return payload.errors.map((e: any) => ({
      field: typeof e?.field === "string" ? e.field : undefined,
      message: String(e?.message ?? "Invalid input"),
    }));
  }

  // Case D: { error: "..." }
  if (typeof payload.error === "string") {
    return [{ message: payload.error }];
  }

  // Fallback
  return [{ message: "Something went wrong" }];
}
