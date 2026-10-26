interface Props {
  checked: boolean;
  onChange: (on: boolean) => void;
  label: string;
  hint?: string;
}

export function Switch({ checked, onChange, label, hint }: Props) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
      <span className="track" aria-hidden="true" />
      <span className="lbl">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </button>
  );
}
