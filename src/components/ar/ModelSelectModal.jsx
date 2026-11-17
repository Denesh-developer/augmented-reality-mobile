import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Check, Smartphone, Cpu, Layers } from 'lucide-react';
import phonesData from '../../data/phones.json';

export const ModelSelectModal = ({ isOpen, onClose, onSelectModel, currentPhoneId }) => {
    const { t } = useTranslation();
    const phones = phonesData;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [displayLimit, setDisplayLimit] = useState(40);

    // Dynamic brand list strictly derived from the 2021-2026 database
    const brands = useMemo(() => {
        const set = new Set();
        phones.forEach(p => { if (p.brand) set.add(p.brand); });
        return ['all', ...Array.from(set).sort()];
    }, [phones]);

    // Intelligent, forgiving, tokenized search across all phone properties
    const filtered = useMemo(() => {
        const rawQ = searchQuery.trim().toLowerCase();
        const compactQ = rawQ.replace(/[^a-z0-9]/g, '');
        const tokens = rawQ.split(/\s+/).filter(Boolean);
        const b = selectedBrand.toLowerCase();

        return phones.filter((p) => {
            const brandMatches = b === 'all' || p.brand.toLowerCase() === b;
            
            if (!rawQ) {
                return brandMatches;
            }

            const searchable = [
                p.brand,
                p.model,
                p.displayName,
                p.year,
                p.soc,
                p.chipset,
                p.rearCamera,
                p.frontCamera,
                p.batteryCapacity,
                p.charging,
                p.screenSize,
                p.displayType,
                p.ram,
                p.storage,
                ...(p.variants || []),
                ...(p.keywords || [])
            ].join(' ').toLowerCase();

            const compactSearchable = searchable.replace(/[^a-z0-9]/g, '');

            // 1. All space-separated words match
            const allTokensMatch = tokens.every(tok => searchable.includes(tok));
            // 2. Compact match (e.g. "hot11s" in "infinixhot11s", "s24ultra" in "samsunggalaxys24ultra")
            const compactMatch = compactQ.length >= 3 && compactSearchable.includes(compactQ);

            const queryMatches = allTokensMatch || compactMatch;

            // If user typed a search query, prioritize finding it regardless of the brand filter tab
            if (b !== 'all') {
                return brandMatches ? queryMatches : queryMatches;
            }

            return queryMatches;
        });
    }, [phones, searchQuery, selectedBrand]);

    if (!isOpen) return null;
    const visiblePhones = filtered.slice(0, displayLimit);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="relative max-w-xl w-full glass-card border border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                        <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                            <span>Select Smartphone Model</span>
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                {phones.length} Models
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                            2021–2026 Curated Database with authentic 3D teardown topologies
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="pt-4 pb-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Search by model, brand, processor, camera, RAM (e.g. Hot 11S, iPhone 13, S24 Ultra)..." 
                            value={searchQuery} 
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setDisplayLimit(40);
                            }} 
                            className="w-full bg-navy-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Brand Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-3 text-xs scrollbar-none">
                    {brands.map((b) => (
                        <button 
                            key={b} 
                            onClick={() => {
                                setSelectedBrand(b);
                                setDisplayLimit(40);
                            }} 
                            className={`px-3 py-1.5 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                                selectedBrand === b
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                                    : 'bg-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>

                {/* Search Results Summary */}
                <div className="text-[11px] text-slate-400 pb-2 flex justify-between items-center">
                    <span>Showing {visiblePhones.length} of {filtered.length} matching models</span>
                    {selectedBrand !== 'all' && (
                        <button 
                            onClick={() => setSelectedBrand('all')} 
                            className="text-cyan-400 hover:underline"
                        >
                            Reset filter
                        </button>
                    )}
                </div>

                {/* Models List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 px-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                                <Smartphone className="w-8 h-8 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-lg font-bold text-white font-heading tracking-wide">
                                    Your mobile is not in our database
                                </h4>
                                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                                    {searchQuery ? (
                                        <>We couldn't find <span className="text-cyan-300 font-mono font-semibold">"{searchQuery}"</span> in our curated models.</>
                                    ) : (
                                        <>No matching models found in this category.</>
                                    )} In future, definitely we will upgrade our database!
                                </p>
                            </div>
                            <div className="pt-2 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedBrand('all');
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition-all flex items-center gap-2 shadow-cyan-sm"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Browse Available Models ({phones.length})</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        visiblePhones.map((phone) => {
                            const isSelected = phone.id === currentPhoneId;
                            const title = phone.displayName || (phone.model.toLowerCase().startsWith(phone.brand.toLowerCase()) ? phone.model : `${phone.brand} ${phone.model}`);
                            return (
                                <div 
                                    key={phone.id} 
                                    onClick={() => {
                                        onSelectModel(phone);
                                        onClose();
                                    }} 
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                        isSelected
                                            ? 'bg-cyan-950/60 border-cyan-400 shadow-cyan-sm'
                                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div 
                                            className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center flex-shrink-0" 
                                            style={{ backgroundColor: phone.color }}
                                        >
                                            <Smartphone className="w-4 h-4 text-white drop-shadow"/>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-sm text-white font-heading truncate">
                                                    {title}
                                                </span>
                                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                                    {phone.year}
                                                </span>
                                                {phone.cameraLayout && (
                                                    <span className="text-[9px] font-mono text-slate-300 bg-white/5 px-1 py-0.5 rounded border border-white/10">
                                                        {phone.cameraLayout.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                                {phone.chassisForm === 'box_ultra' && (
                                                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                                                        S-Pen Ultra
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                                                <span className="flex items-center gap-1 text-slate-300 font-medium">
                                                    <Cpu className="w-3 h-3 text-cyan-400"/>
                                                    {phone.soc || phone.chipset}
                                                </span>
                                                <span>•</span>
                                                <span className="text-slate-300">{phone.batteryCapacity}</span>
                                                <span>•</span>
                                                <span className="text-slate-400">{phone.rearCamera}</span>
                                                {phone.variants && phone.variants.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-cyan-400/90 font-mono text-[10px]">
                                                            {phone.variants.slice(0, 2).join(', ')}{phone.variants.length > 2 ? ` (+${phone.variants.length - 2})` : ''}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected ? (
                                        <div className="w-6 h-6 rounded-full bg-cyan-400 text-navy-950 flex items-center justify-center shadow-sm flex-shrink-0 ml-2">
                                            <Check className="w-4 h-4 stroke-[3]"/>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-cyan-400 font-medium flex-shrink-0 ml-2">
                                            Select
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* Load More Button */}
                    {filtered.length > displayLimit && (
                        <div className="pt-2 text-center">
                            <button 
                                onClick={() => setDisplayLimit((prev) => prev + 50)} 
                                className="text-xs font-mono text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/80 px-4 py-2 rounded-xl border border-cyan-500/30 transition-colors"
                            >
                                Show More (+{filtered.length - displayLimit} remaining)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
