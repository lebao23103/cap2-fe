import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../lib/api/auth';

export function useHeartbeat() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Ping ngay lập tức khi mount/login
        authService.heartbeat().catch(() => { });

        // Ping định kỳ mỗi 2 phút (backend cache là 5 phút)
        const interval = setInterval(() => {
            authService.heartbeat().catch(() => { });
        }, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);
}
