export type ApiSerializerResponse<T> = {
  status_code: number
  message?: string
  data: T
  meta?: unknown
}

function getTokenFromAuthStorage() {
  try {
    const raw = localStorage.getItem("auth-storage")
    if (!raw) return null
    return JSON.parse(raw)?.state?.token ?? null
  } catch {
    return null
  }
}

export async function uploadImagesToR2(params: {
  files: File[]
  folder?: string
  token?: string
}): Promise<string[]> {
  const { files, folder = "products", token: passedToken } = params

  const token = passedToken ?? getTokenFromAuthStorage()
  if (!token) throw new Error("Not authenticated")

  const fd = new FormData()
  fd.append("folder", folder)
  for (const file of files) fd.append("files", file)

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })

  let json: ApiSerializerResponse<string[]>
  try {
    json = (await res.json()) as ApiSerializerResponse<string[]>
  } catch {
    throw new Error("Upload failed: invalid server response")
  }

  if (!res.ok) {
    throw new Error(json?.message || "Failed to upload images")
  }

  // ✅ ApiSerializer uses status_code
  if (typeof json.status_code !== "number" || json.status_code < 200 || json.status_code >= 300) {
    throw new Error(json?.message || "Failed to upload images")
  }

  if (!Array.isArray(json.data)) {
    throw new Error("Upload failed: invalid data format")
  }

  return json.data
}
