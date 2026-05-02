const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
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
    let res;
    try {
      res = await fetch(`${BASE}/auth/login`, {
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

    const data = await res.json()
    if (!res.ok) throw new Error(data?.detail || 'Credenciales incorrectas')
    return data
  },
}
