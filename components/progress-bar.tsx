import { Progress } from "@/components/ui/progress"

export function ProgressBar() {
  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-semibold mb-2">Calculating predictions...</h3>
      <Progress value={33} className="w-full" />
    </div>
  )
}

