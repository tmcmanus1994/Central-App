export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1611] mb-2">Access Denied</h1>
        <p className="text-[#5A5248] text-sm">
          This panel is for staff and elder accounts only.
        </p>
        <a
          href="/login"
          className="inline-block mt-6 text-sm text-[#C8973A] underline"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}
