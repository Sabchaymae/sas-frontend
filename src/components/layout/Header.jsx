import { Bell, Search, ChevronRight, Users, LogOut, ChevronDown, Menu, MessageSquare, Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import Button from '../common/Button';
import Input from '../common/Input';
import useAuth from '@/hooks/useAuth';
import useChatStore from '@/store/useChatStore';
import useInvitationStore from '@/store/useInvitationStore';
import useNotificationStore from '@/store/useNotificationStore';

const Header = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { totalUnreadMessages, conversations, markConversationAsRead } = useChatStore();
  const { fetchInvitations, invitations, acceptInvitation, rejectInvitation, loading } = useInvitationStore();
  const { notifications } = useNotificationStore();

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Conversations avec messages non lus
  const unreadConversations = conversations.filter(c => (c.unread_count || 0) > 0);

  const breadcrumbMap = {
    'users': 'Utilisateurs',
    'settings': 'Paramètres',
    'dashboard': 'Tableau de bord',
    'stock': 'Gestion du stock'
  };

  return (
    <header className="min-h-[4rem] py-3 lg:py-0 bg-white border-b border-gray-100 sticky top-0 z-40 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:h-16">
        {/* Left: Menu Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden p-2 -ml-2" 
            onClick={onMenuClick}
            icon={Menu}
          />
          
          <nav className="flex items-center gap-3 text-sm font-medium overflow-x-auto whitespace-nowrap no-scrollbar py-1">
            <Link to="/dashboard" className="text-gray-500 hover:text-[#1428C9] transition-all duration-200 shrink-0 font-semibold">Accueil</Link>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const name = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

              return (
                <div key={to} className="flex items-center gap-3 shrink-0 animate-in fade-in slide-in-right" style={{ animationDelay: `${index * 50}ms` }}>
                  <ChevronRight size={14} className="text-gray-300" />
                  {last ? (
                    <span className="font-bold text-[#111827]">{name}</span>
                  ) : (
                    <Link to={to} className="text-gray-500 hover:text-[#1428C9] transition-all duration-200 font-semibold">
                      {name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-2 md:gap-4 w-full lg:w-auto">
          <Input
            icon={Search}
            placeholder="Rechercher..."
            containerClassName="flex-1 lg:w-80 lg:flex-none"
            className="py-2"
          />

          <div className="flex items-center gap-1 shrink-0">
            {/* Invitations Notification Bell */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="relative p-2 md:p-2.5 rounded-sm hover:bg-gray-50 text-gray-500 hover:text-[#1428C9] transition-all duration-200 outline-none" aria-label="Invitations">
                  <Users size={20} />
                  {invitations.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5 animate-in zoom-in">
                      {invitations.length > 99 ? '99+' : invitations.length}
                    </span>
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-[100] w-80 bg-white rounded-sm border border-gray-100 shadow-xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                  sideOffset={12}
                  align="end"
                >
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#1428C9]" />
                      <p className="text-sm font-bold text-[#111827]">Invitations Groupes</p>
                    </div>
                    {invitations.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">
                        {invitations.length} en attente
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-xs text-gray-400">Chargement...</div>
                    ) : invitations.length > 0 ? (
                      invitations.map((inv) => (
                        <div key={inv.id} className="w-full flex flex-col gap-2 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-[#F0F3FF] transition-all duration-200">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-sm bg-gradient-to-tr from-blue-500/10 to-purple-500/10 flex items-center justify-center text-[#1428C9] font-bold text-sm shrink-0">
                              <Users size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#111827] truncate">Groupe: {inv.conversation?.name}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">Invité par {inv.inviter?.prenom} {inv.inviter?.nom}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={async () => {
                                const success = await acceptInvitation(inv.id);
                                if (success) {
                                  navigate('/dashboard/communication');
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#1428C9] text-white rounded text-xs font-bold hover:bg-[#1020A8] transition-all"
                            >
                              <Check size={14} /> Accepter
                            </button>
                            <button
                              onClick={() => rejectInvitation(inv.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              <X size={14} /> Refuser
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Users size={28} className="mb-2 opacity-30" />
                        <p className="text-xs font-semibold">Aucune invitation</p>
                      </div>
                    )}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Messages Notification Bell */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="relative p-2 md:p-2.5 rounded-sm hover:bg-gray-50 text-gray-500 hover:text-[#1428C9] transition-all duration-200 outline-none" aria-label="Notifications messages">
                  <Bell size={20} />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#1428C9] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5 animate-in zoom-in">
                      {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                    </span>
                  )}
                  {totalUnreadMessages === 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-gray-300 rounded-full border-2 border-white" />
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-[100] w-80 bg-white rounded-sm border border-gray-100 shadow-xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                  sideOffset={12}
                  align="end"
                >
                  {/* Header du dropdown */}
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#1428C9]" />
                      <p className="text-sm font-bold text-[#111827]">Messages internes</p>
                    </div>
                    {totalUnreadMessages > 0 && (
                      <span className="px-2 py-0.5 bg-[#1428C9]/10 text-[#1428C9] text-xs font-bold rounded-full">
                        {totalUnreadMessages} non lu{totalUnreadMessages > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Liste des conversations non lues */}
                  <div className="max-h-72 overflow-y-auto">
                    {unreadConversations.length > 0 ? (
                      unreadConversations.map((conv) => {
                        const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
                        const lastMsg = conv.last_message?.content || 'Nouveau message';
                        return (
                          <DropdownMenu.Item key={conv.id} className="outline-none">
                            <button
                              onClick={() => {
                                markConversationAsRead(conv.id);
                                navigate('/dashboard/communication');
                              }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F0F3FF] transition-all duration-200 text-left"
                            >
                              <div className="w-9 h-9 rounded-sm bg-gradient-to-tr from-[#1428C9]/10 to-blue-500/10 flex items-center justify-center text-[#1428C9] font-bold text-sm border border-[#1428C9]/10 shrink-0">
                                {name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-bold text-[#111827] truncate">{name}</span>
                                  <span className="text-[10px] text-gray-400 shrink-0">{conv.last_message_at_human || ''}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg}</p>
                              </div>
                              <span className="w-5 h-5 bg-[#1428C9] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                {conv.unread_count}
                              </span>
                            </button>
                          </DropdownMenu.Item>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <MessageSquare size={28} className="mb-2 opacity-30" />
                        <p className="text-xs font-semibold">Aucun nouveau message</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-50">
                    <DropdownMenu.Item className="outline-none">
                      <Link
                        to="/dashboard/communication"
                        className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-[#1428C9] hover:bg-[#F0F3FF] rounded-sm transition-all duration-200"
                      >
                        <MessageSquare size={14} />
                        Ouvrir la messagerie
                      </Link>
                    </DropdownMenu.Item>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Profile Dropdown */}
            <div className="flex items-center pl-2 md:pl-4 border-l border-gray-100 ml-1 md:ml-0">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="outline-none group">
                  <div className="flex items-center gap-3 p-1 rounded-sm hover:bg-gray-50 transition-all cursor-pointer">
                    <Avatar.Root className="flex-none">
                      <Avatar.Image
                        className="w-9 h-9 md:w-10 md:h-10 rounded-sm object-cover ring-2 ring-transparent group-hover:ring-[#1428C9]/10 transition-all"
                        src={user?.avatar || "https://randomuser.me/api/portraits/women/79.jpg"}
                        alt={user?.first_name || "vienna"}
                      />
                      <Avatar.Fallback
                        className="flex w-9 h-9 md:w-10 md:h-10 rounded-sm items-center justify-center text-white text-xs font-bold bg-gradient-to-tr from-[#1428C9] to-blue-400"
                      >
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-bold text-[#111827] leading-none">{user?.full_name || 'Utilisateur'}</p>
                      <p className="text-[11px] text-gray-400 mt-1 capitalize">{user?.role || 'Rôle'}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                  </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-[100] w-64 bg-white rounded-sm border border-gray-100 p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
                    sideOffset={12}
                    align="end"
                  >
                    <div className="px-4 py-3 mb-1 border-b border-gray-50">
                      <p className="text-sm font-bold text-[#111827] leading-none">{user?.full_name || 'Utilisateur'}</p>
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{user?.email || 'email@example.com'}</p>
                    </div>
                    <div className="p-1">
                      <DropdownMenu.Item className="outline-none">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold text-gray-600 hover:bg-[#F0F3FF] hover:text-[#1428C9] transition-all duration-200">
                          <Users size={18} />
                          <span>Mon Profil</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200">
                          <LogOut size={18} />
                          <span>Déconnexion</span>
                        </button>
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
