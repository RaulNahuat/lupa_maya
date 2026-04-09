import { LogOut } from 'lucide-react';

const AdminHeader = ({ user = { name: 'Michel García', role: 'Administrador', avatar: null } }) => {
  return (
    <div className="bg-white px-6 py-6 rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b relative z-20">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-maya-gold font-black text-2xl">
              {user.name.charAt(0)}
            </div>
          )}
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-maya-dark font-black text-lg leading-tight">{user.name}</h2>
          <span className="text-maya-gold font-bold text-sm tracking-wide">{user.role}</span>
        </div>
      </div>
      
      <button className="px-5 py-2.5 rounded-full border-2 border-maya-orange-light text-maya-gold font-bold text-sm hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm">
        Cerrar sesión
      </button>
    </div>
  );
};

export default AdminHeader;
