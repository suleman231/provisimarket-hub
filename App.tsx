
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Store, Category, Product, User } from './types';
import { MOCK_STORES, CATEGORIES, CURRENT_USER } from './constants';
import { searchMarketplace } from './services/geminiService';

// Tell TypeScript about the Leaflet global variable provided via script tag
declare const L: any;

const Toast: React.FC<{ message: string, type: 'success' | 'info', onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 duration-300">
      <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${type === 'success' ? 'bg-white border-green-100' : 'bg-white border-blue-100'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          {type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          )}
        </div>
        <p className="text-sm font-black text-gray-800">{message}</p>
      </div>
    </div>
  );
};

const ShoppingDrawer: React.FC<{ isOpen: boolean, onClose: () => void, items: { product: Product, storeName: string }[], onRemove: (id: string) => void }> = ({ isOpen, onClose, items, onRemove }) => {
  const totalPrice = items.reduce((sum, item) => sum + item.product.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">Your Provisions</h2>
            <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">{items.length} Items Selected</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p className="font-bold">Your list is empty</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product.id}-${idx}`} className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 group">
                <img src={item.product.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">@{item.storeName}</p>
                  <p className="text-sm font-bold text-gray-400 mt-0.5">${item.product.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => onRemove(item.product.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Estimated Total</span>
            <span className="text-3xl font-black text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
          <button 
            disabled={items.length === 0}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95"
            onClick={() => window.print()}
          >
            Export Shopping List
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileDropdown: React.FC<{ user: User, onSelect: (tab: string) => void, isOpen: boolean, setIsOpen: (v: boolean) => void }> = ({ user, onSelect, isOpen, setIsOpen }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
      >
        <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200 object-cover" alt="Avatar" />
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
            <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
            <p className="text-[10px] text-indigo-500 font-medium">Merchant Account</p>
          </div>
          <div className="py-1">
            <button onClick={() => { onSelect('dashboard'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Merchant Hub
            </button>
            <button onClick={() => { onSelect('settings'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </button>
          </div>
          <div className="py-1 border-t border-gray-50">
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC<{ onTabChange: (t: string) => void, activeTab: string, user: User, cartCount: number, onOpenCart: () => void }> = ({ onTabChange, activeTab, user, cartCount, onOpenCart }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onTabChange('home')}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">ProvisiMarket</h1>
      </div>
      
      <div className="hidden md:flex gap-4">
        <button onClick={() => onTabChange('home')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100'}`}>Market</button>
        <button onClick={() => onTabChange('stores')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'stores' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100'}`}>Stores</button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onOpenCart} className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors group">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
           {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">{cartCount}</span>}
        </button>
        <div className="h-6 w-[1px] bg-gray-100 mx-2" />
        <ProfileDropdown user={user} onSelect={onTabChange} isOpen={isProfileMenuOpen} setIsOpen={setIsProfileMenuOpen} />
      </div>
    </nav>
  );
};

const StoreMap: React.FC<{ location: { lat: number, lng: number }, name: string }> = ({ location, name }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([location.lat, location.lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance.current);
      L.marker([location.lat, location.lng]).addTo(mapInstance.current)
        .bindPopup(`<b>${name}</b>`)
        .openPopup();
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location, name]);

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

const StoreCard: React.FC<{ store: Store, onClick: (s: Store) => void }> = ({ store, onClick }) => (
  <div onClick={() => onClick(store)} className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all cursor-pointer group">
    <div className="relative h-48">
      <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
        <span className="text-yellow-500 text-xs">★</span>
        <span className="text-sm font-black">{store.rating}</span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-black text-gray-900">{store.name}</h3>
      <p className="text-[10px] text-indigo-600 font-black mb-2 uppercase tracking-[0.2em]">{store.ownerName}</p>
      <p className="text-sm text-gray-500 mb-4 line-clamp-1 italic">{store.address}</p>
      <div className="flex flex-wrap gap-2">
        {store.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const ProductCard: React.FC<{ product: Product, storeName: string, onRate: (id: string, stars: number) => void, onAdd: (p: Product, s: string) => void }> = ({ product, storeName, onRate, onAdd }) => (
  <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 hover:shadow-xl transition-all group">
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      {!product.inStock && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-white text-[10px] font-black uppercase tracking-widest border-2 border-white/50 px-3 py-1 rounded-full">Out of Stock</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <h4 className="font-black text-gray-900 text-sm line-clamp-1">{product.name}</h4>
        <span className="text-indigo-600 font-black text-sm">${product.price.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => onRate?.(product.id, star)} className={`hover:scale-125 transition-transform ${star <= Math.round(product.rating) ? 'fill-current' : 'text-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </button>
          ))}
        </div>
        <span className="text-[10px] text-gray-300 font-bold">({product.ratingCount})</span>
      </div>
      <p className="text-xs text-gray-400 line-clamp-1 italic">{product.description}</p>
      {storeName && <p className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mt-2">@ {storeName}</p>}
      <button 
        disabled={!product.inStock} 
        onClick={() => onAdd(product, storeName)}
        className="w-full mt-4 py-2 bg-gray-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Add to List
      </button>
    </div>
  </div>
);

const ChatInterface = () => {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{role: string, content: string, links?: string[]}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setChatLog(prev => [...prev, { role: 'user', content: query }]);
    setQuery('');
    setLoading(true);
    const result = await searchMarketplace(query);
    setChatLog(prev => [...prev, { role: 'assistant', content: result.text, links: result.links }]);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col h-[500px] overflow-hidden">
      <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-100">AI</div>
        <div>
          <h3 className="text-sm font-black text-gray-900">Marketplace Concierge</h3>
          <p className="text-[10px] text-green-500 flex items-center gap-1 font-bold uppercase tracking-wider"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Intelligent Search</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatLog.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm font-medium">I can help you find stores, compare prices, or find specific items!</p>
          </div>
        )}
        {chatLog.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-50' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm font-medium'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.links && msg.links.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <p className="text-[9px] font-black uppercase text-indigo-400 mb-2 tracking-[0.2em]">External Sources</p>
                  <div className="flex flex-col gap-2">
                    {msg.links.map((link, idx) => (
                      <a key={idx} href={link} target="_blank" className="text-[11px] text-indigo-600 hover:underline truncate bg-indigo-50/50 p-1.5 rounded-lg flex items-center gap-2" rel="noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {new URL(link).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] animate-pulse">Assistant is searching...</div>}
      </div>
      <div className="p-5 border-t border-gray-50 bg-white">
        <div className="flex gap-2">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Compare milk prices..." className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          <button onClick={handleSearch} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 transition-transform active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('prov_stores');
    return saved ? JSON.parse(saved) : MOCK_STORES;
  });
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('prov_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  const [cart, setCart] = useState<{product: Product, storeName: string}[]>(() => {
    const saved = localStorage.getItem('prov_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => localStorage.setItem('prov_stores', JSON.stringify(stores)), [stores]);
  useEffect(() => localStorage.setItem('prov_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('prov_cart', JSON.stringify(cart)), [cart]);
  
  // Advanced Filter States
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadContext, setUploadContext] = useState<{ id: string, type: 'main' | 'gallery' | 'storeCover' | 'userAvatar' } | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductData, setNewProductData] = useState<Partial<Product>>({
    name: '', price: 0, unit: 'pcs', category: 'Produce', description: '', image: 'https://via.placeholder.com/300?text=No+Image',
    gallery: [], inStock: true, quantity: 0
  });

  const selectedStore = useMemo(() => stores.find(s => s.id === selectedStoreId) || null, [stores, selectedStoreId]);
  const filteredStores = useMemo(() => stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))), [searchTerm, stores]);
  
  const myStore = useMemo(() => stores.find(s => s.ownerId === user.id) || stores[0], [stores, user]);

  const allProducts = useMemo(() => {
    let prods: (Product & { store: Store })[] = [];
    stores.forEach(s => s.products.forEach(p => prods.push({ ...p, store: s })));
    return prods.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchesRating = p.rating >= minRating;
      const matchesStock = !onlyInStock || p.inStock;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock;
    });
  }, [selectedCategory, searchTerm, minPrice, maxPrice, minRating, onlyInStock, stores]);

  const handleUpdateProduct = (storeId: string, productId: string, updates: Partial<Product>) => {
    setStores(prevStores => prevStores.map(s => s.id !== storeId ? s : { ...s, products: s.products.map(p => p.id === productId ? { ...p, ...updates } : p) }));
  };

  const handleUpdateStore = (storeId: string, updates: Partial<Store>) => {
    setStores(prevStores => prevStores.map(s => s.id === storeId ? { ...s, ...updates } : s));
  };

  const handleAddNewProduct = () => {
    const id = 'p' + Math.random().toString(36).substr(2, 9);
    const product: Product = { ...newProductData as Product, id, rating: 5.0, ratingCount: 0 };
    setStores(prevStores => prevStores.map(s => s.id === myStore.id ? { ...s, products: [...s.products, product] } : s));
    setIsAddingProduct(false);
    setToast({ message: "New item launched successfully!", type: 'success' });
  };

  const handleAddToCart = (product: Product, storeName: string) => {
    setCart(prev => [...prev, { product, storeName }]);
    setToast({ message: `${product.name} added to your list!`, type: 'success' });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleRateProduct = (productId: string, stars: number) => {
    setStores(prevStores => prevStores.map(store => ({
      ...store,
      products: store.products.map(p => {
        if (p.id !== productId) return p;
        const newTotalCount = p.ratingCount + 1;
        const newAvgRating = ((p.rating * p.ratingCount) + stars) / newTotalCount;
        return { ...p, rating: parseFloat(newAvgRating.toFixed(1)), ratingCount: newTotalCount };
      })
    })));
    setToast({ message: `Rated ${stars} stars!`, type: 'info' });
  };

  const handleAddGalleryImage = (productId: string) => {
    const url = window.prompt("Enter image URL:");
    if (url && url.trim()) {
      handleUpdateProduct(myStore.id, productId, { gallery: [...(myStore.products.find(p => p.id === productId)?.gallery || []), url.trim()] });
      setToast({ message: "Gallery image added.", type: 'success' });
    }
  };

  const triggerFileUpload = (id: string, type: 'main' | 'gallery' | 'storeCover' | 'userAvatar') => {
    setUploadContext({ id, type });
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadContext) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const { id, type } = uploadContext;
      if (type === 'main') {
        if (isAddingProduct && id === 'new') setNewProductData(prev => ({ ...prev, image: base64String }));
        else handleUpdateProduct(myStore.id, id, { image: base64String });
      } else if (type === 'gallery') {
        const prod = myStore.products.find(p => p.id === id);
        if (prod) handleUpdateProduct(myStore.id, id, { gallery: [...prod.gallery, base64String] });
      } else if (type === 'storeCover') handleUpdateStore(myStore.id, { image: base64String });
      else if (type === 'userAvatar') setUser(prev => ({ ...prev, avatar: base64String }));
      setUploadContext(null);
      e.target.value = '';
      setToast({ message: "Photo updated.", type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const resetFilters = () => {
    setMinPrice(0); setMaxPrice(1000); setMinRating(0); setOnlyInStock(false); setSelectedCategory('All'); setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col antialiased">
      <Navbar onTabChange={(t) => { setActiveTab(t); setSelectedStoreId(null); }} activeTab={activeTab} user={user} cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ShoppingDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={handleRemoveFromCart} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-10">
        {activeTab === 'home' && !selectedStoreId && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <header className="space-y-1">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Marketplace Feed</h2>
                <p className="text-gray-400 font-medium">Find quality provisions from vetted local merchants.</p>
              </header>

              <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input type="text" placeholder="Search products, brands or stores..." className="w-full pl-12 pr-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button onClick={() => setSelectedCategory('All')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>All Categories</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{cat}</button>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Price</label>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={minPrice || ''} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-20 px-3 py-1.5 text-xs bg-gray-50 border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                      <span className="text-gray-300">-</span>
                      <input type="number" placeholder="Max" value={maxPrice || ''} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-20 px-3 py-1.5 text-xs bg-gray-50 border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">In Stock</label>
                    <button onClick={() => setOnlyInStock(!onlyInStock)} className={`w-12 h-6 rounded-full relative transition-colors ${onlyInStock ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${onlyInStock ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <button onClick={resetFilters} className="ml-auto text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-700 tracking-[0.2em] flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Reset</button>
                </div>
              </div>

              {allProducts.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200 space-y-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                  <div className="space-y-2"><p className="text-2xl font-black text-gray-900 leading-none">No results</p><p className="text-gray-400 font-medium">Adjust filters or search criteria.</p></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
                  {allProducts.map(p => <ProductCard key={p.id} product={p} storeName={p.store.name} onRate={handleRateProduct} onAdd={handleAddToCart} />)}
                </div>
              )}
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-24"><ChatInterface /></div>
            </aside>
          </div>
        )}

        {activeTab === 'stores' && !selectedStoreId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {filteredStores.map(store => <StoreCard key={store.id} store={store} onClick={(s) => setSelectedStoreId(s.id)} />)}
          </div>
        )}

        {selectedStoreId && selectedStore && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <button onClick={() => setSelectedStoreId(null)} className="flex items-center gap-3 text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em] hover:translate-x-[-4px] transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Back to Market
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="h-64 relative"><img src={selectedStore.image} className="w-full h-full object-cover" alt={selectedStore.name} /></div>
                  <div className="p-10 space-y-8">
                    <div><h2 className="text-4xl font-black text-gray-900 leading-tight">{selectedStore.name}</h2><p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-2">{selectedStore.ownerName}</p></div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><p className="text-sm text-gray-500 font-medium leading-relaxed">{selectedStore.address}</p></div>
                      <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><p className="text-sm text-gray-500 font-bold">{selectedStore.phone}</p></div>
                    </div>
                    <div className="pt-8 border-t border-gray-100"><p className="text-[10px] font-black uppercase text-gray-300 mb-4 tracking-[0.2em]">Map Location</p><StoreMap location={selectedStore.location} name={selectedStore.name} /></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {selectedStore.products.map(p => <ProductCard key={p.id} product={p} storeName={selectedStore.name} onRate={handleRateProduct} onAdd={handleAddToCart} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8"><div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200">{myStore.name.charAt(0)}</div><div><h2 className="text-4xl font-black text-gray-900 leading-none">{myStore.name}</h2><p className="text-indigo-500 font-black uppercase text-xs tracking-[0.2em] mt-3">Verified Merchant Portal</p></div></div>
                <button onClick={() => setIsAddingProduct(!isAddingProduct)} className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${isAddingProduct ? 'bg-red-500 text-white shadow-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:scale-105'}`}>{isAddingProduct ? 'Discard Item' : 'Add New Listing'}</button>
            </div>
            {isAddingProduct && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-[3rem] p-10 shadow-inner space-y-10 animate-in slide-in-from-top-6 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">Display Image</label>
                        <div className="relative group rounded-[2.5rem] overflow-hidden aspect-square bg-white border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-[1.02]"><img src={newProductData.image} className="w-full h-full object-cover" alt="" /><button onClick={() => triggerFileUpload('new', 'main')} className="absolute inset-0 bg-indigo-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg><span className="text-[10px] font-black uppercase tracking-widest">Select File</span></button></div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name</label><input type="text" className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-bold" value={newProductData.name} onChange={e => setNewProductData({...newProductData, name: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label><select className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-bold bg-white" value={newProductData.category} onChange={e => setNewProductData({...newProductData, category: e.target.value as Category})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price ($)</label><input type="number" step="0.01" className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-bold" value={newProductData.price} onChange={e => setNewProductData({...newProductData, price: parseFloat(e.target.value)})} /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</label><input type="text" className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-bold" value={newProductData.unit} onChange={e => setNewProductData({...newProductData, unit: e.target.value})} /></div>
                        <div className="space-y-2 sm:col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label><textarea rows={3} className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm resize-none text-sm font-medium" value={newProductData.description} onChange={e => setNewProductData({...newProductData, description: e.target.value})} /></div>
                    </div>
                </div>
                <div className="flex justify-end pt-10 border-t border-indigo-100 gap-6"><button onClick={() => setIsAddingProduct(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Cancel</button><button onClick={handleAddNewProduct} className="bg-indigo-600 text-white px-12 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105">Publish Listing</button></div>
              </div>
            )}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50"><h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational Inventory</h4></div>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-white text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]"><tr><th className="px-10 py-6">Product</th><th className="px-6 py-6">Status</th><th className="px-10 py-6 text-right">Price</th></tr></thead><tbody className="divide-y divide-gray-50">{myStore.products.map(product => (<tr key={product.id} className="hover:bg-gray-50/30 group transition-all"><td className="px-10 py-8 min-w-[400px]"><div className="flex items-start gap-6"><div className="relative w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100 mt-1 shadow-md group-hover:scale-105 transition-transform"><img src={product.image} className="w-full h-full object-cover" /><button onClick={() => triggerFileUpload(product.id, 'main')} className="absolute inset-0 bg-indigo-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></button></div><div className="flex-1 space-y-3"><input className="text-lg font-black text-gray-900 bg-transparent border-none focus:ring-1 focus:ring-indigo-100 rounded-lg px-2 w-full" value={product.name} onChange={e => handleUpdateProduct(myStore.id, product.id, { name: e.target.value })} /><div className="flex items-center gap-4"><select className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 border-none rounded-xl px-4 py-1.5 focus:ring-0 appearance-none" value={product.category} onChange={e => handleUpdateProduct(myStore.id, product.id, { category: e.target.value as Category })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><textarea value={product.description} onChange={(e) => handleUpdateProduct(myStore.id, product.id, { description: e.target.value })} className="w-full text-xs text-gray-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-100 rounded-xl p-2 resize-none h-16 italic" /></div></div></td><td className="px-6 py-8"><button onClick={() => handleUpdateProduct(myStore.id, product.id, { inStock: !product.inStock })} className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${product.inStock ? 'bg-green-100 text-green-700 shadow-green-50' : 'bg-red-50 text-red-500 shadow-red-50'}`}>{product.inStock ? 'Live' : 'Draft'}</button></td><td className="px-10 py-8 text-right"><div className="flex flex-col gap-2 items-end"><div className="flex items-center gap-1.5"><span className="text-xl font-black text-indigo-600">$</span><input type="number" step="0.01" value={product.price} onChange={(e) => handleUpdateProduct(myStore.id, product.id, { price: parseFloat(e.target.value) || 0 })} className="w-24 bg-transparent text-3xl font-black text-indigo-600 outline-none text-right" /></div><span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">per {product.unit}</span></div></td></tr>))}</tbody></table></div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-12 py-6 animate-in fade-in zoom-in-95 duration-500">
            <header className="text-center space-y-4"><h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Settings</h2><p className="text-gray-400 font-medium italic">Manage your store presence and credentials.</p></header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1"><div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 text-center space-y-8"><div className="relative inline-block group"><img src={user.avatar} className="w-40 h-40 rounded-[2.5rem] border-8 border-indigo-50/50 object-cover shadow-2xl mx-auto" alt="" /><button onClick={() => triggerFileUpload(user.id, 'userAvatar')} className="absolute inset-0 bg-indigo-900/60 rounded-[2.5rem] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></button></div><div><h3 className="text-2xl font-black text-gray-900 leading-none">{user.name}</h3><p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-2">{user.role}</p></div><div className="pt-8 border-t border-gray-50 space-y-6 text-left"><div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Email</label><input type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500" /></div></div></div></div>
                <div className="lg:col-span-2"><div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 space-y-10"><h4 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Public Profile</h4><div className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-300">Business Name</label><input type="text" value={myStore.name} onChange={e => handleUpdateStore(myStore.id, { name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500" /></div><div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-300">Hotline</label><input type="text" value={myStore.phone} onChange={e => handleUpdateStore(myStore.id, { phone: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500" /></div></div><div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-300">Address</label><input type="text" value={myStore.address} onChange={e => handleUpdateStore(myStore.id, { address: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500" /></div><div className="pt-6"><label className="text-[10px] font-black uppercase text-gray-300 block mb-4">Cover Image</label><div className="relative group rounded-[3rem] overflow-hidden aspect-[21/9] bg-gray-100 border-4 border-white shadow-2xl"><img src={myStore.image} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-indigo-950/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><button onClick={() => triggerFileUpload(myStore.id, 'storeCover')} className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-110 active:scale-95 transition-transform">Update Hero</button></div></div></div></div><div className="pt-10 border-t border-gray-50 flex justify-end"><button onClick={() => setToast({ message: "Store synchronized.", type: 'success' })} className="bg-indigo-600 text-white px-14 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 transition-transform">Synchronize</button></div></div></div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button for Mobile Utility */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-200 z-[100] flex items-center gap-3 animate-bounce"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        View List ({cart.length})
      </button>
    </div>
  );
}
