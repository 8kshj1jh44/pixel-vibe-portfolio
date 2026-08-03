import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage, contactSchema } from "@/lib/contact.functions";
import { profile } from "@/content/portfolio";

export function ContactTerminal() {
  const send = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const field =
    "w-full border-4 border-border bg-screen px-3 py-2 text-lg text-lime-crt outline-none focus:border-cyan-crt";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Check your entries");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await send({ data: parsed.data });
      setStatus("sent");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-lime-crt">
        &gt; CONNECTION ESTABLISHED. TYPE YOUR MESSAGE, PLAYER.
      </p>

      <div className="border-4 border-border bg-screen p-3 font-body text-lime-crt">
        <p>PHONE ... {profile.phone}</p>
        <p>EMAIL ... {profile.email}</p>
      </div>

      {status === "sent" ? (
        <div className="border-4 border-accent bg-secondary p-4">
          <p className="font-display text-[0.6rem] text-accent">MESSAGE SENT!</p>
          <p className="mt-2">Thanks for reaching out — I&apos;ll reply as soon as I can.</p>
          <button
            type="button"
            className="pixel-btn mt-3 bg-primary text-primary-foreground"
            onClick={() => setStatus("idle")}
          >
            SEND ANOTHER
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="font-display text-[0.55rem] text-accent">NAME</span>
            <input
              className={field}
              value={form.name}
              maxLength={100}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="font-display text-[0.55rem] text-accent">EMAIL</span>
            <input
              className={field}
              type="email"
              value={form.email}
              maxLength={255}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="font-display text-[0.55rem] text-accent">MESSAGE</span>
            <textarea
              className={`${field} h-28`}
              value={form.message}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          {status === "error" && <p className="text-destructive">! {error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="pixel-btn bg-primary text-primary-foreground disabled:opacity-60"
          >
            {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
          </button>
        </form>
      )}
    </div>
  );
}
