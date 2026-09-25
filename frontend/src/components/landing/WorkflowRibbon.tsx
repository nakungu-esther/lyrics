import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";
import { WORKFLOW_STEPS } from "../../lib/mockupVisuals";

export function WorkflowRibbon() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950/90 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Your journey
        </p>
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 md:gap-x-0">
          {WORKFLOW_STEPS.map((step, i) => (
            <li key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2 px-2 md:px-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-blue-400">
                  <HubIcon name={step.icon as HubIconName} size={ICON_SIZE.sm} />
                </span>
                <span className="max-w-[4.5rem] text-center text-[10px] font-medium leading-tight text-slate-400 md:max-w-none md:text-xs">
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <span
                  className="hidden h-px w-6 bg-slate-700 md:block lg:w-10"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
