"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, QrCode } from 'lucide-react';
import { CattleRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCattleStore } from '@/store/cattleStore';
import { useAuthStore } from '@/store/authStore';
import { translations, Language } from '@/lib/translations';
import { QRCodeSVG } from 'qrcode.react';
import { QRScannerModal } from '@/components/QRScannerModal';

export default function CattlePage() {
  const { cattle, addCattle, removeCattle, hasHydrated } = useCattleStore();
  const { user } = useAuthStore();
  
  const lang = (user?.language || 'en') as Language;
  const t = translations[lang] || translations.en;
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCowForQR, setSelectedCowForQR] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCow, setNewCow] = useState({
    name: '',
    tag: '',
    breed: 'HF',
    gender: 'Female',
    dob: ''
  });

  useEffect(() => {
    if (hasHydrated) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  const handleScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.tag) {
        setSearchQuery(parsed.tag);
        setIsScannerOpen(false);
      }
    } catch (e) {
      setSearchQuery(data);
      setIsScannerOpen(false);
    }
  };

  const handleAddCow = (e: React.FormEvent) => {
    e.preventDefault();
    addCattle({
      id: Date.now(),
      ...newCow,
      status: 'Active',
      production: '0L/day'
    });
    setIsModalOpen(false);
    setNewCow({ name: '', tag: '', breed: 'HF', gender: 'Female', dob: '' });
  };

  const filteredCattle = cattle.filter(cow => 
    cow.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cow.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.herd.searchPlaceholder}
            className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white text-black border border-black/5 shadow-sm outline-none focus:border-grass-green transition-all font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border border-black/5 font-bold text-black/60 hover:bg-black/5 transition-all"
            suppressHydrationWarning
          >
            <QrCode size={20} /> {t.herd.scanTag}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-patch-black text-white rounded-2xl font-black shadow-premium hover:scale-105 active:scale-95 transition-all"
            suppressHydrationWarning
          >
            <Plus size={20} /> {t.herd.addCattle}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
          <CattleRowSkeleton />
          <CattleRowSkeleton />
          <CattleRowSkeleton />
          <CattleRowSkeleton />
        </div>
      ) : cattle.length === 0 ? (
        <EmptyState 
          title={t.herd.noCattle} 
          description={t.herd.noCattleSub} 
          actionLabel={t.herd.addFirstCow}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] border border-black/5 shadow-sm overflow-hidden"
        >
          {/* MOBILE VIEW - Card Grid */}
          <div className="lg:hidden divide-y divide-black/5">
            {filteredCattle.map((cow) => (
              <div 
                key={cow.id} 
                className="p-6 active:bg-black/5 transition-colors"
                onClick={() => setSelectedCowForQR(cow)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-patch-black font-black text-xl">
                      {cow.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{cow.name}</h4>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Tag: {cow.tag}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    cow.status === 'Active' ? 'bg-green-100 text-grass-green' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {cow.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-tighter mb-1">Breed</p>
                      <p className="font-bold text-black/60">{cow.breed}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-tighter mb-1">Yield</p>
                      <p className="font-black text-black">{cow.production.split('/')[0]}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCattle(cow.id); }}
                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW - Data Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-black/30">{t.herd.tableHeader.details}</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-black/30">{t.herd.tableHeader.breed}</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-black/30">{t.herd.tableHeader.status}</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-black/30">{t.herd.tableHeader.avgProduction}</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-black/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <AnimatePresence mode="popLayout">
                  {filteredCattle.map((cow, i) => (
                    <motion.tr 
                      key={cow.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="hover:bg-black/[0.01] transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-patch-black flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:rotate-3 transition-transform">
                            {cow.tag.includes('-') ? cow.tag.split('-')[1] : cow.tag.slice(-4)}
                          </div>
                          <div>
                            <h4 className="font-black text-xl tracking-tight text-black">{cow.name}</h4>
                            <p className="text-sm text-black/30 font-bold uppercase tracking-widest mt-0.5">Tag ID: {cow.tag}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className="font-bold text-black/60 bg-black/5 px-3 py-1 rounded-lg text-sm">{cow.breed}</span>
                      </td>
                      <td className="px-8 py-7">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                          cow.status === 'Active' ? 'bg-green-100 text-grass-green' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cow.status === 'Active' ? 'bg-grass-green animate-pulse' : 'bg-gray-400'}`}></span>
                          {cow.status}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                         <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-black">{cow.production.split('/')[0]}</span>
                            <span className="text-black/30 text-xs font-bold uppercase tracking-widest">/ day</span>
                         </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setSelectedCowForQR(cow);
                            }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-xl text-black/30 hover:text-black transition-all"
                          >
                            <QrCode size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeCattle(cow.id);
                            }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-xl text-black/30 hover:text-red-500 transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedCowForQR && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCowForQR(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white z-[201] rounded-[48px] shadow-2xl overflow-hidden p-10 text-center"
            >
               <div className="mb-8">
                  <h3 className="text-2xl font-black mb-1 text-black">{selectedCowForQR.name}</h3>
                  <p className="text-xs font-bold text-black/30 uppercase tracking-widest">{selectedCowForQR.tag}</p>
               </div>
               
               <div className="bg-black/5 p-8 rounded-3xl mb-8 flex items-center justify-center">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      id: selectedCowForQR.id,
                      name: selectedCowForQR.name,
                      tag: selectedCowForQR.tag,
                      breed: selectedCowForQR.breed
                    })} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
               </div>

               <p className="text-xs text-black/40 font-medium mb-8">This QR code acts as a digital passport for the animal. Scan it to view medical and production history.</p>
               
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                        const svg = document.querySelector('svg');
                        const svgData = new XMLSerializer().serializeToString(svg!);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL('image/png');
                          const downloadLink = document.createElement('a');
                          downloadLink.download = `${selectedCowForQR.name}_QR.png`;
                          downloadLink.href = pngFile;
                          downloadLink.click();
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    }}
                    className="w-full py-4 bg-patch-black text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
                  >
                    Download Digital Passport
                  </button>
                  <button 
                    onClick={() => setSelectedCowForQR(null)}
                    className="w-full py-4 text-black/30 font-black hover:text-black transition-all"
                  >
                    Close
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Slide-over Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl p-10 overflow-y-auto"
            >
              <h2 className="text-3xl font-black mb-2 text-black">{t.herd.addModal.title}</h2>
              <p className="text-black/40 font-medium mb-10">{t.herd.addModal.sub}</p>

              <form onSubmit={handleAddCow} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">{t.herd.addModal.nameLabel}</label>
                  <input 
                    required
                    value={newCow.name}
                    onChange={(e) => setNewCow({...newCow, name: e.target.value})}
                    type="text" 
                    placeholder="e.g. Ganga"
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">{t.herd.addModal.tagLabel}</label>
                  <input 
                    required
                    value={newCow.tag}
                    onChange={(e) => setNewCow({...newCow, tag: e.target.value})}
                    type="text" 
                    placeholder="e.g. KL-0123"
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">{t.herd.addModal.breed}</label>
                    <select 
                      value={newCow.breed}
                      onChange={(e) => setNewCow({...newCow, breed: e.target.value})}
                      className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                    >
                      <option>HF</option>
                      <option>Jersey</option>
                      <option>Gir</option>
                      <option>Crossbreed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">{t.herd.addModal.gender}</label>
                    <select 
                      value={newCow.gender}
                      onChange={(e) => setNewCow({...newCow, gender: e.target.value})}
                      className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                    >
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">{t.herd.addModal.dob}</label>
                  <input 
                    required
                    value={newCow.dob}
                    onChange={(e) => setNewCow({...newCow, dob: e.target.value})}
                    type="date" 
                    className="w-full px-6 py-4 bg-black/5 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <div className="pt-6 flex flex-col gap-3">
                  <button type="submit" className="w-full py-5 bg-patch-black text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                    {t.herd.addModal.register}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-4 text-black/30 font-black hover:text-black transition-all"
                  >
                    {t.herd.addModal.cancel}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
