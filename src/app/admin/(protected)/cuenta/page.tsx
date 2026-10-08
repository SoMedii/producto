import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default function AdminCuentaPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Mi cuenta</h1>
      <p className="mt-1 text-sm text-muted">Cambia tu contrasena de acceso al panel.</p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
