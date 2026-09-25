import { Link } from "react-router-dom";
import { TemplatePreviewTile } from "../components/landing/TemplatePreviewTile";
import { WorkflowRibbon } from "../components/landing/WorkflowRibbon";
import { HubIcon } from "../components/icons/HubIcon";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { APP_NAME, APP_TAGLINE } from "../lib/brand";
import { LANDING_HERO_FEATURES } from "../lib/contentCatalog";
import { MOCKUP_IMAGES, MOCKUP_TEMPLATE_PREVIEWS } from "../lib/mockupVisuals";

export function HomePage() {
  const { user } = useAuth();
  const startHref = user ? "/create" : "/register";

  return (
    <div className="pb-0">
      {/* Hero — full-width singer photo + headline */}
      <section
        className="hub-landing-hero relative min-h-[520px] md:min-h-[580px]"
        style={{ ["--hero-image" as string]: `url(${MOCKUP_IMAGES.heroSinger})` }}
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-center px-4 py-16 md:px-8 md:py-24 lg:max-w-2xl lg:pl-12">
          <p className="text-sm font-medium text-blue-400">AI-powered lyric videos</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
            {APP_TAGLINE}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
            {APP_NAME} detects language, writes lyrics, syncs every line, and opens a studio editor—
            from a phone clip or a full track.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={startHref}>
              <Button type="button" size="lg" leadingIcon="create">
                Get Started Free
              </Button>
            </Link>
            <Link to="/search">
              <Button type="button" variant="outline" size="lg" leadingIcon="play">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Four feature icons */}
      <section className="border-b border-slate-800/80 bg-slate-900/50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
          {LANDING_HERO_FEATURES.map((f) => (
            <div key={f.title} className="text-center md:text-left">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 md:mx-0">
                <HubIcon name={f.icon} size={24} />
              </span>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular templates */}
      <section id="templates" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">Popular Templates</h2>
              <p className="mt-2 text-slate-400">Original styles—Gospel, Afrobeat, cinematic, and more</p>
            </div>
            <Link to={user ? "/dashboard/templates" : "/register"}>
              <Button type="button" variant="secondary">
                View all templates
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOCKUP_TEMPLATE_PREVIEWS.slice(0, 8).map((t) => (
              <TemplatePreviewTile key={t.name} template={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA band */}
      <section id="pricing" className="scroll-mt-24 border-t border-slate-800 bg-slate-900/80 py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white">Free to start — upgrade when you scale</h2>
          <p className="mt-2 text-sm text-slate-500">Creator · Artist · Team plans</p>
          <p className="mt-4 text-slate-400">Upload in minutes. No design skills required.</p>
          <Link to={startHref} className="mt-6 inline-block">
            <Button type="button" size="lg" leadingIcon="upload">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <WorkflowRibbon />
    </div>
  );
}
