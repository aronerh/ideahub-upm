type FormFieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  // Renders a <textarea> instead of an <input>, for longer answers.
  multiline?: boolean;
};

const controlClass =
  "rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-accent";

export function FormField({ name, label, error, multiline, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;
  const controlProps = {
    id: name,
    name,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    ...inputProps,
  };

  return (
    <div className="mt-4 flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      {multiline ? (
        <textarea rows={4} className={`${controlClass} resize-y`} {...controlProps} />
      ) : (
        <input className={controlClass} {...controlProps} />
      )}
      {error && (
        <p id={errorId} className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
