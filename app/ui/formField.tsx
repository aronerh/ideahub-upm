"use client";

import { type ChangeEvent, useState } from "react";

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
  "rounded-lg border border-line bg-page px-3 py-2 text-[0.9375rem] text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-danger";

export function FormField({ name, label, error, multiline, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;
  const [length, setLength] = useState(inputProps.defaultValue?.length ?? 0);
  const controlProps = {
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setLength(event.target.value.length),
    id: name,
    name,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    ...inputProps,
  };

  return (
    <div className="mt-4 flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-ink">
          {label}
        </label>
        {inputProps.maxLength && (
          <span aria-hidden="true" className="text-xs tabular-nums text-ink-soft">
            {length} / {inputProps.maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea rows={4} className={`${controlClass} resize-y`} {...controlProps} />
      ) : (
        <input className={controlClass} {...controlProps} />
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
