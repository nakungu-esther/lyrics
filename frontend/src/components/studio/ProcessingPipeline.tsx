import {
  PIPELINE_STEPS,
  pipelineStepIndex,
  stepStatus,
  type PipelinePhase,
} from "../../lib/pipelineSteps";
import { HubIcon } from "../icons/HubIcon";
import { ProgressBar } from "../ui/ProgressBar";
import { Card } from "../ui/Card";

type ProcessingPipelineProps = {
  phase: PipelinePhase;
  message: string;
  progress: number;
  showRenderStep?: boolean;
};

export function ProcessingPipeline({
  phase,
  message,
  progress,
  showRenderStep = false,
}: ProcessingPipelineProps) {
  const failed = phase === "FAILED";
  const current = pipelineStepIndex(phase);
  const steps = showRenderStep ? PIPELINE_STEPS : PIPELINE_STEPS.filter((s) => s.id !== "render");

  return (
    <Card padding="lg" className="sticky top-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300/90">
        AI processing
      </h3>
      <p className="mt-1 text-xs text-zinc-500">Automatic — no manual steps required</p>
      <ProgressBar value={progress} className="mt-4" label={message} />
      <ul className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const status = stepStatus(i, current, failed);
          return (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  status === "done"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : status === "active"
                      ? "bg-indigo-500/25 text-indigo-200 animate-pulse-soft"
                      : status === "error"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {status === "done" ? (
                  <HubIcon name="check" size={16} strokeWidth={2.5} />
                ) : status === "error" ? (
                  <HubIcon name="alert" size={16} />
                ) : (
                  <HubIcon name={step.icon} size={16} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    status === "active"
                      ? "font-medium text-white"
                      : status === "done"
                        ? "text-zinc-300"
                        : "text-zinc-500"
                  }
                >
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
