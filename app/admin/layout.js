export const metadata = {
  title: "Admin — Invoice Dashboard",
  description: "View and manage payment invoices",
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ height: '100dvh', overflow: 'auto' }}>
      {children}
    </div>
  );
}
