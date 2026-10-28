type FormFieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
};

export function FormField({ name, label, error, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="mt-4 flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-accent"
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
