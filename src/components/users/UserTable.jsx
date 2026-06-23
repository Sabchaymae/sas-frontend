import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import UserTableHeader from './UserTableHeader';
import UserTableRow from './UserTableRow';
import UserCard from './UserCard';
import Skeleton from '../common/Skeleton';

<<<<<<< HEAD
const UserTable = memo(({ users, onEdit, onView, onDelete, isLoading, canView = true, canEdit = true, canDelete = true }) => {
=======
const UserTable = memo(({ users, onEdit, onView, onDelete, isLoading, onToggleStatus, currentPage, totalPages, totalCount, perPage, onPageChange }) => {
>>>>>>> import/master
  if (isLoading) {
    return (
      <div className="mt-8 space-y-6">
        {/* Mobile Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-sm border border-gray-100 h-[280px]">
              <div className="flex items-start gap-4 mb-5">
                <Skeleton className="w-14 h-14" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden lg:block bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <UserTableHeader />
            <tbody className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(11)].map((_, j) => (
                    <td key={j} className="px-2 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-gray-100 p-12 mt-8 text-center">
        <p className="text-gray-400 font-medium">Aucun utilisateur trouvé</p>
      </div>
    );
  }

<<<<<<< HEAD
=======
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + users.length - 1, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

>>>>>>> import/master
  return (
    <div className="mt-8 space-y-6">
      {/* Mobile/Tablet View (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
<<<<<<< HEAD
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
=======
        {users.map((user, index) => {
          const uniqueKey = user.id || user.identifiant || `user-${index}`;
          return (
            <UserCard
              key={uniqueKey}
              user={user}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          );
        })}
>>>>>>> import/master
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden lg:block bg-white rounded-sm border border-gray-100 transition-all shadow-sm max-w-full overflow-hidden">
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="w-full text-left border-collapse table-fixed lg:table-auto">
            <UserTableHeader />
            <tbody className="divide-y divide-gray-50">
<<<<<<< HEAD
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onView={onView}
                  onDelete={onDelete}
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))}
=======
              {users.map((user, index) => {
                const uniqueKey = user.id || user.identifiant || `user-${index}`;
                return (
                  <UserTableRow
                    key={uniqueKey}
                    user={user}
                    onEdit={onEdit}
                    onView={onView}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                  />
                );
              })}
>>>>>>> import/master
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
<<<<<<< HEAD
        <p className="text-xs font-medium text-gray-400 italic text-center sm:text-left">
          Affichage de <span className="text-[#111827] font-bold">1</span> à <span className="text-[#111827] font-bold">{users.length}</span> sur <span className="text-[#111827] font-bold">{users.length}</span>
        </p>
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="text-gray-300 hover:text-gray-400 transition-colors cursor-not-allowed">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1428C9] text-white rounded-sm text-sm font-bold flex items-center justify-center">1</button>
            <button className="w-8 h-8 sm:w-9 sm:h-9 text-sm font-bold text-gray-400 hover:text-[#111827] transition-colors flex items-center justify-center">2</button>
            <button className="hidden xs:flex w-8 h-8 sm:w-9 sm:h-9 text-sm font-bold text-gray-400 hover:text-[#111827] transition-colors flex items-center justify-center">3</button>
            <span className="text-sm font-bold text-gray-300 px-1">...</span>
          </div>
          <button className="text-gray-300 hover:text-[#1428C9] transition-colors">
=======
        <p key="pagination-text" className="text-xs font-medium text-gray-400 italic text-center sm:text-left">
          Affichage de <span className="text-[#111827] font-bold">{startIndex}</span> à <span className="text-[#111827] font-bold">{endIndex}</span> sur <span className="text-[#111827] font-bold">{totalCount}</span>
        </p>
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            key="pagination-prev" 
            onClick={() => onPageChange(currentPage - 1)} 
            className={currentPage === 1 
              ? "text-gray-300 hover:text-gray-400 transition-colors cursor-not-allowed"
              : "text-gray-600 hover:text-[#1428C9] transition-colors cursor-pointer"
            }
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          <div key="pagination-buttons" className="flex items-center gap-2 sm:gap-4">
            {getPageNumbers().map(page => (
              <button 
                key={`pagination-${page}`}
                onClick={() => onPageChange(page)}
                className={page === currentPage 
                  ? "w-8 h-8 sm:w-9 sm:h-9 bg-[#1428C9] text-white rounded-sm text-sm font-bold flex items-center justify-center"
                  : "w-8 h-8 sm:w-9 sm:h-9 text-sm font-bold text-gray-400 hover:text-[#111827] transition-colors flex items-center justify-center"
                }
              >
                {page}
              </button>
            ))}
          </div>
          <button 
            key="pagination-next" 
            onClick={() => onPageChange(currentPage + 1)} 
            className={currentPage === totalPages 
              ? "text-gray-300 hover:text-gray-400 transition-colors cursor-not-allowed"
              : "text-gray-600 hover:text-[#1428C9] transition-colors cursor-pointer"
            }
            disabled={currentPage === totalPages}
          >
>>>>>>> import/master
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default UserTable;
