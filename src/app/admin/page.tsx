import Link from "next/link";
import { Calendar, Utensils, Package, Star, ArrowRight } from "lucide-react";

const ADMIN_MODULES = [
  {
    title: "Upcoming Events",
    description: "Manage timeline events, scans, and appointments.",
    href: "/admin/events",
    Icon: Calendar,
    colorClass: "bg-indigo-100 text-indigo-700"
  },
  {
    title: "Safe Meals",
    description: "Curate approved recipes and dietary guidelines.",
    href: "/admin/meals",
    Icon: Utensils,
    colorClass: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "Gear Pipeline",
    description: "Manage product recommendations and nursery inventory.",
    href: "/admin/products",
    Icon: Package,
    colorClass: "bg-amber-100 text-amber-700"
  },
  {
    title: "Milestones",
    description: "Track developmental milestones and weekly updates.",
    href: "/admin/milestones",
    Icon: Star,
    colorClass: "bg-pink-100 text-pink-700"
  }
];

export default function AdminIndexPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-slate-900 font-semibold tracking-tight text-3xl">
          Admin Hub
        </h1>
        <p className="text-slate-500 mt-2">Manage the underlying database collections powering ParentHq.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_MODULES.map((module) => (
          <Link key={module.title} href={module.href} className="block group">
            <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
              <div>
                <div className={`${module.colorClass} p-3 rounded-xl w-fit mb-4`}>
                  <module.Icon size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-slate-900 font-bold text-lg">{module.title}</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="p-2 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
