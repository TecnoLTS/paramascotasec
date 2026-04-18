export default function Loading() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-10 w-56 rounded-full bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <div className="h-80 rounded-3xl bg-slate-200" />
          <div className="h-[32rem] rounded-3xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
