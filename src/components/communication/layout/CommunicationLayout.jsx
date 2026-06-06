import React from 'react';
import { motion } from 'framer-motion';

const CommunicationLayout = ({ sidebar, children, details, showDetails }) => {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm relative">
      {/* Sidebar — Conversation List */}
      <div className="w-[300px] min-w-[260px] border-r border-gray-100 flex flex-col bg-gray-50/40 shrink-0">
        {sidebar}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {children}
      </div>

      {/* Details Panel — Animated Drawer */}
      <motion.div
        initial={false}
        animate={{ width: showDetails ? 300 : 0, opacity: showDetails ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="absolute xl:relative top-0 right-0 h-full z-30 border-l border-gray-100 bg-white overflow-hidden shrink-0"
      >
        <div className="w-[300px] h-full">
          {details}
        </div>
      </motion.div>
    </div>
  );
};

export default CommunicationLayout;
