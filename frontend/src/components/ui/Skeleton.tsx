"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className }: { className: string }) => {
  return (
    <div className={`bg-black/5 animate-pulse rounded-xl ${className}`}></div>
  );
};

export const CattleRowSkeleton = () => (
  <div className="flex items-center gap-8 px-8 py-6 border-b border-black/5">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-24 h-3" />
      </div>
    </div>
    <Skeleton className="w-20 h-4" />
    <Skeleton className="w-24 h-6 rounded-full" />
    <Skeleton className="w-20 h-4" />
    <div className="w-20 flex justify-end gap-2">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);
