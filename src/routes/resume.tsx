import { createFileRoute, Link } from "@tanstack/react-router";
import {
  profile,
  skills,
  jobs,
  projects,
  education,
  certifications,
  technicalTools,
} from "@/content/portfolio";
import { ContactTerminal } from "@/components/game/ContactTerminal";

const title = "Resume — Franz Lyster L. Tagalogon | IT Support & Web Developer";
const description =
  "Franz Lyster Tagalogon's résumé: IT support, web development, education, cybersecurity certifications, technical tools, projects and contact.";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumePage,
});

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xs text-accent sm:text-sm">{label}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResumePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="pixel-btn bg-secondary text-foreground">
          ◀ BACK TO GAME
        </Link>
        <span className="font-display text-[0.5rem] text-muted-foreground">CONTINUE? 9</span>
      </div>

      <header className="pixel-box mt-8 bg-card p-5">
        <h1 className="text-glow font-display text-base text-accent sm:text-2xl">{profile.name}</h1>
        <p className="mt-3 text-cyan-crt">{profile.title}</p>
        <p className="text-cyan-crt">
          {profile.phone} · {profile.email}
        </p>
        <p className="mt-3">{profile.summary}</p>
      </header>

      <Section label="SKILLS">
        <ul className="grid gap-2 sm:grid-cols-2">
          {skills.map((s) => (
            <li key={s} className="border-4 border-border bg-secondary px-3 py-2">
              <span className="text-accent">★</span> {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="EDUCATION">
        <article className="border-4 border-border bg-card p-4">
          <h3 className="font-display text-[0.6rem] text-accent">{education.degree}</h3>
          <p className="mt-2 text-cyan-crt">{education.school}</p>
          <p className="text-muted-foreground">{education.period}</p>
        </article>
      </Section>

      <Section label="CERTIFICATIONS">
        <div className="grid gap-3 sm:grid-cols-2">
          {certifications.map((cert) => (
            <article key={cert.name} className="border-4 border-border bg-card p-4">
              <h3 className="font-display text-[0.55rem] text-accent">{cert.name}</h3>
              {cert.issuer && <p className="mt-2 text-cyan-crt">{cert.issuer}</p>}
              <p className="mt-1 text-muted-foreground">{cert.date}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section label="TECHNICAL TOOLS">
        <ul className="flex flex-wrap gap-2">
          {technicalTools.map((tool) => (
            <li key={tool} className="border-4 border-border bg-secondary px-3 py-2">
              <span className="text-cyan-crt">◆</span> {tool}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="DELIVERED WEBSITES">
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <article key={p.label} className="pixel-box bg-card p-3">
              <img
                src={p.image}
                alt={`${p.name} preview`}
                width={640}
                height={512}
                loading="lazy"
                className="h-40 w-full border-4 border-border object-cover"
              />
              <h3 className="mt-3 font-display text-[0.6rem] text-accent">{p.name}</h3>
              <p className="mt-2">{p.blurb}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li key={t} className="border-4 border-border bg-secondary px-2 py-0.5 text-base">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="pixel-btn inline-block bg-primary text-primary-foreground"
                  >
                    VISIT SITE
                  </a>
                ) : (
                  <span className="font-display text-[0.5rem] text-accent">COMING SOON</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section label="WORK HISTORY">
        <div className="space-y-4">
          {jobs.map((j) => (
            <article key={j.role} className="border-4 border-border bg-card p-4">
              <h3 className="font-display text-[0.6rem] text-accent">{j.role}</h3>
              {j.company && <p className="text-cyan-crt">{j.company}</p>}
              <p className="text-muted-foreground">{j.period}</p>
              <ul className="mt-2 space-y-1">
                {j.bullets.map((b) => (
                  <li key={b}>▪ {b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section label="CONTACT">
        <div className="pixel-box bg-card p-5">
          <a
            href={`mailto:${profile.email}`}
            className="pixel-btn mb-5 inline-block bg-primary text-primary-foreground"
          >
            HIRE / CONTACT ME
          </a>
          <ContactTerminal />
        </div>
      </Section>
    </main>
  );
}
