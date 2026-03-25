import { useEffect } from 'react'

export interface ToastMessage {
  id: string
  text: string
  type?: 'success' | 'error' | 'info'
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const bg =
    toast.type === 'error'
      ? 'bg-error/90 border-error/50'
      : toast.type === 'success'
        ? 'bg-success/90 border-success/50'
        : 'bg-charcoal/95 border-champagne/20'

  return (
    <div
      className={`pointer-events-auto px-4 py-2.5 rounded-lg border backdrop-blur-sm text-xs text-ivory font-medium shadow-xl animate-fade-in ${bg}`}
    >
      {toast.text}
    </div>
  )
}
