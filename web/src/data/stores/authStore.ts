import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApiRepository } from '../repositories/AuthApiRepository';
// We'll need to decode the JWT to get user info like role
import { jwtDecode } from 'jwt-decode'; 

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');
    
    function setAuthData(userData: any, userToken: string) {
        user.value = userData;
        token.value = userToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    }

    function clearAuthData() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    async function login(credentials: any) {
        const { user, token } = await authApiRepository.login(credentials);
        setAuthData(user, token);
    }

    async function register(data: any) {
        await authApiRepository.register(data);
    }

    function logout() {
        clearAuthData();
    }
    
    // Check token on startup
    try {
        if (token.value) {
            const decoded: any = jwtDecode(token.value);
            if (decoded.exp * 1000 < Date.now()) {
                // Token expired
                clearAuthData();
            }
        }
    } catch (e) {
        // Invalid token
        clearAuthData();
    }


    return {
        token,
        user,
        isLoggedIn,
        isAdmin,
        login,
        register,
        logout,
    };
});
