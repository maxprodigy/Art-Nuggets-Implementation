# useAuthButton Hook

## Overview

The `useAuthButton` hook provides a consistent way to handle authentication-aware buttons across the application. It automatically determines the appropriate button text and action based on the user's authentication status and history.

## Usage

```typescript
import { useAuthButton } from "@/hooks/useAuthButton";

function MyComponent() {
  const router = useRouter();
  const authButton = useAuthButton({
    authenticatedText: "Go to Dashboard",
    authenticatedAction: () => router.push("/dashboard"),
  });

  return (
    <button onClick={authButton.action}>
      {authButton.text}
    </button>
  );
}
```

## Button Behavior

| User State | Button Text | Action |
|------------|-------------|---------|
| **Authenticated** | Custom text (e.g., "Go to Courses") | Custom action (e.g., navigate to courses) |
| **Unauthenticated (New User)** | "Sign Up" | Navigate to `/auth/signup` |
| **Unauthenticated (Returning User)** | "Login" | Navigate to `/auth/login` |

## Implementation Details

- **Authentication Detection**: Uses Zustand auth store with `_hasHydrated` flag to prevent hydration mismatches
- **History Detection**: Uses `useState` and `useEffect` to safely check `localStorage.getItem("auth-storage")` on client-side only
- **SSR-Safe**: Prevents hydration mismatches by checking `_hasHydrated` flag before using auth state
- **Centralized State**: Uses auth store for authentication status, avoiding duplicate localStorage checks
- **Consistent Behavior**: Same logic applied across all components (Hero, Benefits, Footer, Navbar)
- **Flexible Configuration**: Each component can specify its own authenticated text and action

## Components Using This Hook

- **HeroSection**: Shows "Go to Courses" when authenticated
- **BenefitsSection**: Shows "Go to Courses" when authenticated  
- **Footer**: Shows "Contract Review" when authenticated

## Related Hooks

- **`useNavbarAuth`**: Specialized hook for Navbar component that shows "Logout" when authenticated

## Benefits

1. **🔄 Reusable**: One hook handles all authentication logic
2. **🧹 DRY**: No code duplication across components
3. **🎯 Consistent**: Same behavior everywhere
4. **🐛 Maintainable**: Easy to update logic in one place
5. **📱 Flexible**: Easy to customize per component
6. **🚀 Efficient**: Minimal re-renders
