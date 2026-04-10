type Props = {
  title: string;
  description?: string;
};

export function DashboardPageHeader({ title, description }: Props) {
  return (
    <header className="mb-10 border-b border-[var(--color-border)] pb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
    </header>
  );
}
