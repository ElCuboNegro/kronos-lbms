export function getBaseUrl() {
  const saved = localStorage.getItem('server_url')
  if (saved) return saved
  return import.meta.env.VITE_API_URL || '/api'
}

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const base = getBaseUrl()
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Error de conexión con el servidor (Revisa tu red o CORS).')
    }
    throw err;
  }

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : await res.text()

  if (!res.ok) throw new Error(data?.detail || 'Error del servidor')
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),

  login: async (email, password) => {
    const form = new URLSearchParams({ username: email, password })
    const base = getBaseUrl()
    let res;
    try {
      res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      })
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Error de conexión con el servidor (Revisa tu red o CORS).')
      }
      throw err;
    }

    if (res.status === 502) {
      throw new Error('Servidor fuera de línea o reiniciándose (502 Bad Gateway)')
    }

    let data;
    try {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        throw new Error('La URL del servidor es incorrecta (respondió con HTML en lugar de JSON). Verifica que apunte al Backend (ej. puerto 8001) y no al Frontend.');
      }
      data = await res.json()
    } catch (err) {
      throw new Error(err.message || 'Respuesta inválida del servidor')
    }

    if (!res.ok) throw new Error(data?.detail || 'Credenciales incorrectas')
    return data
  },
}
