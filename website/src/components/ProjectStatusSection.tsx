import { motion } from "motion/react";
import { CheckCircle2, Clock3, Flag, AlertTriangle, FileCheck2 } from "lucide-react";
import type { ComponentType } from "react";
import { projectStatus } from "../data/projectStatus";

type StatusBlockProps = {
  title: string;
  items: string[];
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

function StatusBlock({ title, items, icon: Icon, tone }: StatusBlockProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`size-5 ${tone}`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-white/5 bg-black/40 p-3 text-sm text-gray-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectStatusSection() {
  return (
    <section id="status" className="relative bg-gradient-to-b from-black to-zinc-950 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-500">Project Status</p>
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">Repository-Based Status Overview</h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-400">
            All claims in this section are sourced from repository evidence and maintained via one structured status file.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatusBlock title="Available Now" items={projectStatus.availableNow} icon={CheckCircle2} tone="text-emerald-400" />
          <StatusBlock title="In Progress" items={projectStatus.inProgress} icon={Clock3} tone="text-amber-400" />
          <StatusBlock title="Planned" items={projectStatus.planned} icon={Flag} tone="text-sky-400" />
          <StatusBlock title="Limitations" items={projectStatus.limitations} icon={AlertTriangle} tone="text-rose-400" />
        </div>

        <div id="evidence" className="mt-10 rounded-2xl border border-sky-500/25 bg-sky-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck2 className="size-5 text-sky-400" />
            <h3 className="text-xl font-semibold text-white">Proof Points</h3>
          </div>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {projectStatus.proofPoints.map((item) => (
              <li key={item} className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-gray-300">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {projectStatus.featureSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
              <h3 className="mb-2 text-xl font-semibold text-white">{section.title}</h3>
              <p className="mb-4 text-sm text-gray-400">{section.description}</p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-gray-300">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
