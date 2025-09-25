import { writable } from 'svelte/store';

export const user = writable(null);

export function loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) user.set(JSON.parse(userData));
    else user.set(null);
}

export function clearUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user.set(null);
}
