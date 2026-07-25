export function scoreColorClass(percentage: number) {
  if (percentage >= 70) return "text-emerald-600";
  if (percentage >= 40) return "text-amber-600";
  return "text-rose-600";
}

export function scoreBarColorClass(percentage: number) {
  if (percentage >= 70) return "bg-emerald-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-rose-500";
}
