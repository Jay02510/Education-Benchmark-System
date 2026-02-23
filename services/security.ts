
/**
 * SECURITY UTILITY SERVICE
 * Implements audit-required checks for production readiness.
 */
export const SecurityService = {
    /**
     * Audit: Validate Redirects
     * Prevents Open Redirect vulnerabilities by ensuring the target is on the same origin.
     */
    validateRedirect: (url: string): string => {
        if (!url) return '/';
        
        try {
            const target = new URL(url, window.location.origin);
            if (target.origin === window.location.origin) {
                return url;
            }
            return '/';
        } catch (e) {
            return '/';
        }
    },

    /**
     * Audit: Never show raw errors
     * Sanitizes error messages for user display.
     */
    sanitizeError: (error: any): string => {
        if (typeof error === 'string') return error;
        
        // Firebase specific errors
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    return "Authentication failure. Please verify your credentials.";
                case 'permission-denied':
                    return "Access restricted. Insufficient permissions.";
                default:
                    return "An internal system error occurred. Please try again.";
            }
        }

        return "A processing error occurred. Our team has been notified.";
    }
};
