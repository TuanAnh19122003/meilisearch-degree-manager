export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : ''
    };
    const res = await fetch(`http://localhost:5000${url}`, options);
    return res.json();
}
