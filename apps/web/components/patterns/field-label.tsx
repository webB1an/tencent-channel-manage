export function FieldLabel({ children, required, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-md font-semibold text-text">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}
