import AdminHeader from './AdminHeader';
import AdminBottomNav from './AdminBottomNav';

const AdminPageShell = ({ activeTab, children, contentClassName = '' }) => {
  return (
    <div className="min-h-screen bg-maya-cream pb-32">
      <AdminHeader />

      <div className={`max-w-md mx-auto px-3 py-4 sm:p-4 flex flex-col gap-3 sm:gap-4 ${contentClassName}`}>
        {children}
      </div>

      <AdminBottomNav activeTab={activeTab} />
    </div>
  );
};

export default AdminPageShell;