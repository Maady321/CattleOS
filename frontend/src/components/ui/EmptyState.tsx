"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState = ({ title, description, actionLabel, onAction, icon: Icon = Inbox }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-[40px] border border-black/5 shadow-sm">
      <div className="w-24 h-24 bg-black/[0.02] rounded-[32px] flex items-center justify-center text-black/10 mb-8">
        <Icon size={48} />
      </div>
      <h3 className="text-2xl font-black mb-2">{title}</h3>
      <p className="text-black/40 font-medium max-w-sm mb-10 leading-relaxed">{description}</p>
      {actionLabel && (
        <button 
          onClick={onAction}
          className="bg-patch-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-premium"
        >
          <Plus size={20} /> {actionLabel}
        </button>
      )}
    </div>
  );
};
