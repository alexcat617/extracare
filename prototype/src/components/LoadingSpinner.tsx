export function LoadingSpinner({ className = 'h-12 w-12 border-4' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-cvs-gray-border border-t-cvs-blue ${className}`}
      aria-hidden
    />
  )
}
