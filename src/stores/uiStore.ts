import { create } from 'zustand'

interface UIState {
    // Sidebar & navigation
    isSidebarOpen: boolean
    isMobileMenuOpen: boolean

    // Modals
    activeModal: string | null
    modalData: Record<string, unknown> | null

    // Theme
    theme: 'light' | 'dark' | 'system'

    // Toast notifications
    toasts: Toast[]

    // Actions
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toggleMobileMenu: () => void
    setMobileMenuOpen: (open: boolean) => void
    openModal: (modalId: string, data?: Record<string, unknown>) => void
    closeModal: () => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

export const useUIStore = create<UIState>((set, get) => ({
    // Initial state
    isSidebarOpen: true,
    isMobileMenuOpen: false,
    activeModal: null,
    modalData: null,
    theme: 'system',
    toasts: [],

    // Sidebar actions
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    // Mobile menu actions
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

    // Modal actions
    openModal: (modalId, data) => set({ activeModal: modalId, modalData: data ?? null }),
    closeModal: () => set({ activeModal: null, modalData: null }),

    // Theme
    setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else if (theme === 'light') {
            root.classList.remove('dark')
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }
    },

    // Toast notifications
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7)
        const newToast: Toast = { ...toast, id }

        set((state) => ({ toasts: [...state.toasts, newToast] }))

        // Auto remove after duration
        const duration = toast.duration ?? 5000
        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id)
            }, duration)
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }))
    },
}))

// Convenience hooks
export const useToast = () => {
    const addToast = useUIStore((state) => state.addToast)

    return {
        success: (title: string, message?: string) =>
            addToast({ type: 'success', title, message }),
        error: (title: string, message?: string) =>
            addToast({ type: 'error', title, message }),
        warning: (title: string, message?: string) =>
            addToast({ type: 'warning', title, message }),
        info: (title: string, message?: string) =>
            addToast({ type: 'info', title, message }),
    }
}

export const useModal = () => {
    const { activeModal, modalData, openModal, closeModal } = useUIStore()
    return { activeModal, modalData, openModal, closeModal }
}
