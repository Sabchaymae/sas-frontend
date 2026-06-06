import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const SidebarItem = ({ icon: Icon, label, path, isCollapsed, onClick }) => {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        twMerge(
          clsx(
            'flex items-center gap-3 px-4 py-3 transition-all duration-200 group border-l-4',
            'hover:bg-gray-100/80 mb-1',
            isActive ? 'bg-gray-100 text-primary font-medium border-primary' : 'text-gray-500 hover:text-text-dark border-transparent',
            isCollapsed && 'justify-center px-2'
          )
        )
      }
    >
      {Icon && (
        <Icon 
          size={20} 
          className="shrink-0 transition-transform duration-200 group-hover:scale-110" 
        />
      )}
      {!isCollapsed && <span className="text-sm whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;
