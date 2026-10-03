import { DashboardLayout } from "@/components/dashboard-shell";
import { learningRecommendations } from "@/lib/mock-data";

export default function LearningPathPage() {
  return (
    <DashboardLayout title="Learning Path" subtitle="Recommended study sequence">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Recommended sequence</h3>
        <ol className="mt-6 space-y-4">
          {learningRecommendations.map((step, index) => (
            <li key={step} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 font-semibold text-white">{index + 1}</div>
              <span className="text-lg font-medium text-slate-800">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </DashboardLayout>
  );
}
