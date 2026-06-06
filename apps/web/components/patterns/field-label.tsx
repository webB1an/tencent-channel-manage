export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-md font-semibold text-text">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}
