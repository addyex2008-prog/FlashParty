
import React, { useState } from 'react';
import { Vendor, Review, VendorPackage, EventType } from '../types';
import { MOCK_VENDORS } from '../services/mockData';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
  onSelect: (vendorId: string, packageId?: string) => void;
  userName?: string;
  eventType?: EventType;
}

type Tab = 'ABOUT' | 'PACKAGES' | 'REVIEWS';

const VendorDetailModal: React.FC<VendorDetailModalProps> = ({ vendor, onClose, onSelect, userName, eventType }) => {
  const [currentVendor, setCurrentVendor] = useState<Vendor>(vendor);
  const [activeTab, setActiveTab] = useState<Tab>('ABOUT');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  
  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const newUrls = files.map(file => URL.createObjectURL(file as Blob));
        setPreviewImages(prev => [...prev, ...newUrls]);
    }
  };

  const handleSubmitReview = () => {
    const review: Review = {
      id: Date.now().toString(),
      user: userName || '匿名訪客',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      images: previewImages
    };
    const updatedReviews = [review, ...currentVendor.reviews];
    const newReviewCount = currentVendor.reviewCount + 1;
    const totalScore = currentVendor.reviews.reduce((acc, r) => acc + r.rating, 0) + newRating;
    const finalRating = parseFloat((totalScore / newReviewCount).toFixed(1));

    const updatedVendor = { ...currentVendor, reviews: updatedReviews, reviewCount: newReviewCount, rating: finalRating };
    setCurrentVendor(updatedVendor);
    const idx = MOCK_VENDORS.findIndex(v => v.id === vendor.id);
    if (idx !== -1) MOCK_VENDORS[idx] = updatedVendor;

    setIsWritingReview(false);
    setNewComment('');
    setNewRating(5);
    setPreviewImages([]);
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={!interactive}
          onClick={(e) => { e.stopPropagation(); interactive && setNewRating(star); }}
          className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-125' : 'cursor-default'}`}
        >
          <svg className={`w-4 h-4 md:w-5 md:h-5 ${star <= rating ? 'text-primary fill-current drop-shadow-[0_0_5px_rgba(255,106,0,0.6)]' : 'text-white/10'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );

  const renderLightbox = () => {
    if (!lightboxImage) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in cursor-zoom-out" onClick={() => setLightboxImage(null)}>
            <div className="relative max-w-7xl max-h-screen">
                <img src={lightboxImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10" />
                <button onClick={() => setLightboxImage(null)} className="absolute -top-12 right-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="absolute bottom-[-40px] left-0 w-full text-center text-slate-400 text-base font-bold tracking-widest pointer-events-none">
                    點擊任意處關閉
                </div>
            </div>
        </div>
    );
  };

  const renderAbout = () => (
    <div className="animate-fade-in space-y-12">
      <p className="text-slate-300 text-base leading-loose tracking-wide font-medium">{currentVendor.description}</p>
      
      {/* Videos Section */}
      {currentVendor.portfolioVideos && currentVendor.portfolioVideos.length > 0 && (
         <div className="space-y-8">
            <h4 className="font-black text-white text-sm md:text-base uppercase tracking-[0.2em] flex items-center">
                <span className="w-1.5 h-6 bg-red-500 mr-4 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                影音展示 DEMO VIDEOS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {currentVendor.portfolioVideos.map((video, idx) => (
                   <div key={idx} className="rounded-3xl overflow-hidden border border-white/10 bg-black shadow-lg">
                       <video controls className="w-full h-64 object-cover">
                           <source src={video} type="video/mp4" />
                           Your browser does not support the video tag.
                       </video>
                   </div>
               ))}
            </div>
         </div>
      )}

      {/* Photos Section */}
      <div className="space-y-8">
        <h4 className="font-black text-white text-sm md:text-base uppercase tracking-[0.2em] flex items-center">
            <span className="w-1.5 h-6 bg-primary mr-4 shadow-[0_0_10px_rgba(255,106,0,0.8)]"></span>
            作品集錦 PORTFOLIO (點擊放大)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {currentVendor.portfolio.map((img, idx) => (
            <div 
                key={idx} 
                className="group relative aspect-square rounded-3xl overflow-hidden border border-white/5 cursor-zoom-in"
                onClick={() => setLightboxImage(img)}
            >
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPackages = () => {
    // Filter packages based on eventType
    // If a package has NO event types specified, it's considered "General" and shown for all types.
    // If it HAS event types, it must match the current requested type.
    const filteredPackages = currentVendor.packages?.filter(pkg => {
        if (!pkg.eventTypes || pkg.eventTypes.length === 0) return true;
        return eventType ? pkg.eventTypes.includes(eventType) : true;
    }) || [];

    return (
        <div className="animate-fade-in space-y-10">
            {eventType && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold text-primary">已為您篩選適用於「{eventType}」的方案</span>
                    </div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{filteredPackages.length} 筆結果</span>
                </div>
            )}

            {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {filteredPackages.map((pkg: VendorPackage) => (
                        <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:border-primary/50 transition-all">
                            <div 
                                className="w-full md:w-1/3 h-56 md:h-auto relative cursor-zoom-in overflow-hidden"
                                onClick={() => setLightboxImage(pkg.imageUrls[0])}
                            >
                                <img src={pkg.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-black text-white">{pkg.name}</h4>
                                            {/* Sold Count Badge */}
                                            <div className="inline-flex items-center gap-2 text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold mt-2 border border-red-500/30">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.45-.412-1.725a1 1 0 00-1.422-.865c-.087.055-.169.123-.243.205-.63.708-1.025 1.625-1.065 2.674a1 1 0 001.595.903c.313-.23.636-.445.966-.637.246-.143.497-.275.753-.393a4.996 4.996 0 01-1.397 3.513 4.97 4.97 0 01-3.525 1.453 1 1 0 00.005 2.001A7 7 0 009 19a7.001 7.001 0 006.312-10.43 1 1 0 00-.917-6.017zM9.5 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>
                                                已售出 {pkg.soldCount?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                        <span className="text-primary font-black text-2xl md:text-3xl">${pkg.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-base text-slate-400 mb-6 leading-relaxed whitespace-pre-wrap font-medium">{pkg.description}</p>
                                    
                                    {/* Show tags for specific event types if any */}
                                    {pkg.eventTypes && pkg.eventTypes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {pkg.eventTypes.map(type => (
                                                <span key={type} className={`text-[10px] px-3 py-1 rounded border font-bold ${type === eventType ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {pkg.includedItems && pkg.includedItems.length > 0 && (
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-4 flex items-center tracking-wider">
                                                <span className="w-1.5 h-4 bg-slate-500 mr-2"></span>
                                                包含項目細節 (可點圖放大檢視)
                                            </div>
                                            <div className="flex flex-wrap gap-3 mb-8">
                                                {pkg.includedItems.map(item => (
                                                    <div 
                                                        key={item.id} 
                                                        className={`flex items-center gap-4 bg-black/40 border border-white/5 rounded-full pl-2 pr-5 py-2 transition-all ${item.imageUrl ? 'cursor-zoom-in hover:bg-white/10 hover:border-primary/30' : ''}`}
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if(item.imageUrl) setLightboxImage(item.imageUrl); 
                                                        }}
                                                    >
                                                        {item.imageUrl ? (
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group/item">
                                                                <img src={item.imageUrl} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-500 font-bold">
                                                                無圖
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-slate-300 font-bold">
                                                            {item.name} <span className="text-primary ml-1">x{item.quantity}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => onSelect(currentVendor.id, pkg.id)}
                                    className="w-full py-4 bg-white/10 hover:bg-primary text-white font-black text-sm uppercase rounded-2xl transition-all tracking-[0.2em] flex items-center justify-center gap-3 group-hover:bg-primary"
                                >
                                    選用此方案 <span className="text-xl">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-[32px]">
                    <p className="text-slate-500 font-bold text-lg">此供應商沒有適用於「{eventType}」的特定套裝方案。</p>
                    <p className="text-sm text-slate-600 mt-2 font-bold">您可以考慮使用通用基本費率或其他供應商。</p>
                    <div className="mt-8">
                        <span className="text-4xl md:text-5xl font-black text-white">${currentVendor.rate.toLocaleString()}</span>
                        <span className="text-sm md:text-base text-slate-500 font-bold ml-3 uppercase">Base Rate</span>
                    </div>
                    <button 
                        onClick={() => onSelect(currentVendor.id)}
                        className="mt-10 px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all text-base"
                    >
                        以基本費率預約
                    </button>
                </div>
            )}
        </div>
    );
  };

  const renderReviews = () => (
      <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-10">
               <h4 className="font-black text-white text-sm md:text-base uppercase tracking-[0.2em] flex items-center">
                   <span className="w-1.5 h-6 bg-green-500 mr-4 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                   客戶真實評價
               </h4>
               <label className="flex items-center space-x-3 text-xs text-slate-600 cursor-pointer opacity-50 hover:opacity-100 transition-opacity font-bold">
                   <input type="checkbox" checked={isVerifiedUser} onChange={e => setIsVerifiedUser(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-black text-primary" />
                   <span>模擬已購</span>
               </label>
             </div>

             {isWritingReview ? (
               <div className="bg-white/5 border border-primary/20 rounded-[32px] p-8 mb-12 animate-fade-in shadow-[0_0_30px_rgba(255,106,0,0.05)]">
                 <div className="mb-8">
                   <label className="block text-xs text-primary font-bold uppercase tracking-widest mb-4">評分等級</label>
                   {renderStars(newRating, true)}
                 </div>
                 <div className="mb-8">
                   <textarea
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-base text-slate-200 focus:border-primary focus:ring-0 outline-none min-h-[120px]"
                     placeholder="與大家分享您的派對體驗..."
                   />
                 </div>
                 <div className="flex justify-end space-x-6">
                   <button onClick={() => setIsWritingReview(false)} className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest">取消</button>
                   <button onClick={handleSubmitReview} disabled={!newComment.trim()} className="px-10 py-4 bg-primary rounded-xl text-sm font-black text-white shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-30 uppercase tracking-widest">送出評價</button>
                 </div>
               </div>
             ) : (
                 isVerifiedUser && (
                    <button onClick={() => setIsWritingReview(true)} className="w-full mb-12 py-5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-white rounded-2xl transition-all font-bold text-sm uppercase tracking-widest">
                        撰寫評價
                    </button>
                 )
             )}

             <div className="space-y-8">
               {currentVendor.reviews.map(rev => (
                 <div key={rev.id} className="bg-white/5 p-8 rounded-3xl border border-white/5">
                   <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-sm md:text-base font-black border border-primary/20">
                          {rev.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-base md:text-lg text-white">{rev.user}</div>
                            <div className="text-[10px] md:text-xs text-slate-600 font-bold uppercase mt-1">{rev.date}</div>
                        </div>
                     </div>
                     {renderStars(rev.rating)}
                   </div>
                   <p className="text-sm md:text-base text-slate-400 leading-relaxed italic font-medium">"{rev.comment}"</p>
                 </div>
               ))}
               {currentVendor.reviews.length === 0 && (
                   <div className="text-center py-12 text-slate-600 font-bold text-base">暫無評價</div>
               )}
             </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
      {renderLightbox()}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-[0_0_80px_rgba(244,96,17,0.1)] w-full max-w-5xl h-[95vh] overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header Image Area */}
        <div className="relative h-40 md:h-56 shrink-0 group">
          <button onClick={onClose} className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl rounded-full p-3 hover:bg-white hover:text-black transition-all text-white z-20 border border-white/10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          {/* Main Cover Image */}
          <div className="w-full h-full relative overflow-hidden cursor-zoom-in" onClick={() => setLightboxImage(currentVendor.imageUrl)}>
             <img src={currentVendor.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent"></div>
          </div>
          
          {/* Vendor Info Overlay */}
          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end pointer-events-none">
             <div>
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2 inline-block border border-primary/50 shadow-lg">{currentVendor.category}</span>
                <h3 className="text-3xl md:text-4xl font-black text-white drop-shadow-2xl tracking-tighter">{currentVendor.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex text-yellow-500">{renderStars(currentVendor.rating)}</div>
                    <span className="text-xs text-slate-300 font-bold">({currentVendor.reviewCount} 評價)</span>
                </div>
             </div>
          </div>
        </div>
        
        {/* Tabs - Sticky and Clear */}
        <div className="flex border-b border-white/10 px-8 bg-white/5 overflow-x-auto whitespace-nowrap no-scrollbar shrink-0">
            <button 
                onClick={() => setActiveTab('ABOUT')} 
                className={`py-5 px-8 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'ABOUT' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                關於與作品
            </button>
            <button 
                onClick={() => setActiveTab('PACKAGES')} 
                className={`py-5 px-8 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'PACKAGES' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                服務方案 ({currentVendor.packages?.length || 0})
            </button>
            <button 
                onClick={() => setActiveTab('REVIEWS')} 
                className={`py-5 px-8 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'REVIEWS' ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                評價 ({currentVendor.reviewCount})
            </button>
        </div>

        {/* Content Area - Expanded */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-black/20">
            {activeTab === 'ABOUT' && renderAbout()}
            {activeTab === 'PACKAGES' && renderPackages()}
            {activeTab === 'REVIEWS' && renderReviews()}
        </div>

        {/* Footer Action - Only visible if not package based or generic selection allowed */}
        {currentVendor.rateType !== 'package' && (
             <div className="p-6 border-t border-white/10 bg-[#0a0a0a] shrink-0">
                <button 
                    onClick={() => onSelect(currentVendor.id)}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(244,96,17,0.3)] hover:scale-[1.01] transition-all text-base"
                >
                    選用此供應商 (基本費率 ${currentVendor.rate})
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetailModal;
