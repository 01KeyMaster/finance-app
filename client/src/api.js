export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('finance.token')
  const headers = { ...(options.headers || {}) }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`/api${path}`, { ...options, headers })
}
