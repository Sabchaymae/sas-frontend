import React from 'react';
import { motion } from 'framer-motion';

const CommunicationLayout = ({ sidebar, children, details, showDetails }) => {
  return (
<<<<<<< HEAD
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
=======
    <div className="flex h-full w-full overflow-hidden relative rounded-xl"
      style={{
        background: 'transparent', // Rendre le fond transparent
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1428C9 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #1428C9 0%, transparent 60%)' }} />
      </div>

      {/* Sidebar */}
      <div
        className="w-full md:w-[300px] min-w-0 md:min-w-[260px] flex flex-col shrink-0 relative z-10 overflow-hidden border-r border-gray-200"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '2px 0 15px rgba(0,0,0,0.05)',
        }}
      >
        {sidebar}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {children}
      </div>

      {/* Details panel — animated drawer */}
      <motion.div
        initial={{ x: 300 }} // Start from off-screen right
        animate={{
          width: showDetails ? 300 : 0,
          opacity: showDetails ? 1 : 0,
          x: showDetails ? 0 : 300 // Slide in/out
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute xl:relative top-0 right-0 h-full z-30 overflow-hidden shrink-0 max-w-full"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderLeft: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '-2px 0 15px rgba(0,0,0,0.05)',
        }}
      >
        <div className="w-full md:w-[300px] h-full">
>>>>>>> import/master
          {details}
        </div>
      </motion.div>
    </div>
  );
};

export default CommunicationLayout;
