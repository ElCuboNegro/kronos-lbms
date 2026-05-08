export function getBaseUrl() {
  const saved = localStorage.getItem('server_url')
  if (saved) return saved
  return import.meta.env.VITE_API_URL || '/api'
}

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body, options = {}) {
  const isFormData = body instanceof FormData
  const headers = options.headers || {}

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) headers['Authorization'] = "Bearer " + token

  const base = getBaseUrl()
  let res;
  try {
    res = await fetch(base + path, {
      method,
      headers,
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Error de conexión con el servidor.')
    }
    throw err;
  }

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    throw new Error(data?.detail || "Error " + res.status)
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  login: async (email, password) => {
    const form = new URLSearchParams({ username: email, password })
    const res = await fetch(getBaseUrl() + "/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    if (!res.ok) throw new Error('Credenciales incorrectas')
    return await res.json()
  }
}
