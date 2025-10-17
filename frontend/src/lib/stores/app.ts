import { create } from "zustand";

interface AppState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  notifications: Notification[];
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: "system",
  sidebarOpen: false,
  notifications: [],

  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
