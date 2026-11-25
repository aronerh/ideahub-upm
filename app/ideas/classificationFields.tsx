import { type IdeaClassification, sectors, stages } from "@/lib/ideas/classification";

// IH-14: sector and stage, side by side, in the publish and edit forms. Investors filter by them.
export function ClassificationFields({
  values,
  errors,
}: {
  values?: Partial<IdeaClassification>;
  errors?: Partial<Record<keyof IdeaClassification, string>>;
}) {
  return (
    <div className="grid gap-x-4 sm:grid-cols-2">
      <SelectField name="sector" label="Sector" defaultValue={values?.sector} error={errors?.sector}>
        <option value="" disabled>
          Pick a sector
        </option>
        {sectors.map((sector) => (
          <option key={sector.value} value={sector.value}>
            {sector.label}
          </option>
        ))}
      </SelectField>
      <SelectField name="stage" label="Stage" defaultValue={values?.stage} error={errors?.stage}>
        <option value="" disabled>
          Pick a stage
        </option>
        {stages.map((stage) => (
          <option key={stage.value} value={stage.value}>
            {stage.label} · {stage.hint}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  error,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="mt-4 flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-line bg-page px-3 py-2 text-[0.9375rem] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-danger"
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
