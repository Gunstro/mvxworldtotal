import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useUIStore, type Toast } from '@/stores/uiStore'

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
}

const styleMap = {
    success: 'bg-success-50 border-success-200 text-success-600',
    error: 'bg-danger-50 border-danger-200 text-danger-600',
    warning: 'bg-warning-50 border-warning-200 text-warning-600',
    info: 'bg-primary-50 border-primary-200 text-primary-600',
}

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useUIStore((state) => state.removeToast)
    const Icon = iconMap[toast.type]

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        animate-slide-up
        ${styleMap[toast.type]}
      `}
        >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900">{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-surface-600 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    )
}

export function ToastContainer() {
    const toasts = useUIStore((state) => state.toasts)

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    )
}
