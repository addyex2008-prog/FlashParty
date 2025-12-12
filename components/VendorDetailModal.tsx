import React, { useState } from 'react';
import { Vendor, Review } from '../types';
import { MOCK_VENDORS } from '../services/mockData';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
  onSelect: (vendorId: string) => void;
  userName?: string; // To pre-fill the reviewer name
}

const VendorDetailModal: React.FC<VendorDetailModalProps> = ({ vendor, onClose, onSelect, userName }) => {
  // Local state to display updates immediately
  const [currentVendor, setCurrentVendor] = useState<Vendor>(vendor);
  
  // Review Form State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Dev Testing Flag (Simulate "Verified Purchase")
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);

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
      user: userName || '訪客',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      images: previewImages
    };

    const updatedReviews = [review, ...currentVendor.reviews];
    const newReviewCount = currentVendor.reviewCount + 1;
    // Calculate new average
    const totalScore = currentVendor.reviews.reduce((acc, r) => acc + r.rating, 0) + newRating;
    const calculatedRating = totalScore / newReviewCount;
    const finalRating = parseFloat(calculatedRating.toFixed(1));

    const updatedVendor = {
      ...currentVendor,
      reviews: updatedReviews,
      reviewCount: newReviewCount,
      rating: finalRating
    };

    // Update local state
    setCurrentVendor(updatedVendor);

    // Update global mock data (mutable update for demo purposes)
    const idx = MOCK_VENDORS.findIndex(v => v.id === vendor.id);
    if (idx !== -1) {
      MOCK_VENDORS[idx] = updatedVendor;
    }

    // Reset Form
    setIsWritingReview(false);
    setNewComment('');
    setNewRating(5);
    setPreviewImages([]);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => interactive && setNewRating(star)}
            className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : 'cursor-default'}`}
          >
            <svg 
              className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-slate-600'}`} 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up flex flex-col custom-scrollbar">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full p-2 hover:bg-black/70 text-white z-10 shadow-sm border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={currentVendor.imageUrl} alt={currentVendor.name} className="w-full h-56 object-cover rounded-t-xl opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-4 relative -mt-8">
            <div>
              <h3 className="text-3xl font-bold text-white drop-shadow-md">{currentVendor.name}</h3>
              <div className="flex items-center mt-2 space-x-2">
                 {renderStars(currentVendor.rating)}
                 <span className="text-sm text-slate-400 font-medium">({currentVendor.reviewCount} 則評價)</span>
                 <span className="text-slate-600">|</span>
                 <span className="text-xs text-indigo-200 bg-indigo-900/50 border border-indigo-500/30 px-2 py-1 rounded font-medium">
                   {currentVendor.category}
                 </span>
              </div>
            </div>
            <div className="text-right pt-8">
              <div className="text-2xl font-bold text-orange-500">
                {currentVendor.rateType === 'hourly' ? `$${currentVendor.rate}/hr` : `$${currentVendor.rate}`}
              </div>
              <div className="text-xs text-slate-500">基本報價</div>
            </div>
          </div>

          <p className="text-slate-300 mb-8 leading-relaxed border-b border-slate-800 pb-6">{currentVendor.description}</p>

          {/* Portfolio */}
          <div className="mb-8">
            <h4 className="font-bold text-slate-200 mb-3 text-lg border-l-4 border-orange-500 pl-3">精選作品集</h4>
            <div className="grid grid-cols-2 gap-3">
              {currentVendor.portfolio.map((img, idx) => (
                <img key={idx} src={img} alt="Portfolio" className="w-full h-40 object-cover rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500/50 transition-colors" />
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-6">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-slate-200 text-lg border-l-4 border-indigo-500 pl-3">客戶評價</h4>
               
               {/* Dev Toggle for testing */}
               <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                   <input type="checkbox" checked={isVerifiedUser} onChange={e => setIsVerifiedUser(e.target.checked)} className="rounded bg-slate-800 border-slate-700"/>
                   <span>(開發用: 模擬已購買)</span>
               </label>
             </div>

             {/* Review Button Logic */}
             {!isWritingReview && (
                 isVerifiedUser ? (
                    <button 
                    onClick={() => setIsWritingReview(true)}
                    className="w-full mb-6 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-indigo-500 px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center"
                    >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    撰寫評價
                    </button>
                 ) : (
                    <div className="mb-6 p-3 bg-slate-800/50 rounded-lg text-center text-xs text-slate-500 border border-slate-800">
                        僅有完成訂單的客戶可撰寫評價
                    </div>
                 )
             )}

             {/* Write Review Form */}
             {isWritingReview && (
               <div className="bg-slate-800 border border-indigo-500/30 rounded-xl p-5 mb-6 shadow-lg animate-fade-in">
                 <h5 className="font-bold text-indigo-300 mb-3 text-sm">撰寫您的評價</h5>
                 <div className="mb-4">
                   <label className="block text-xs text-slate-400 mb-1">評分</label>
                   {renderStars(newRating, true)}
                 </div>
                 <div className="mb-4">
                   <label className="block text-xs text-slate-400 mb-1">評論內容</label>
                   <textarea
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     className="w-full bg-slate-900 border-slate-700 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 text-slate-200 border"
                     rows={3}
                     placeholder="請分享您的體驗..."
                   />
                 </div>
                 
                 <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-2">上傳照片 (選填)</label>
                    <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded text-xs flex items-center transition-colors">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            選擇圖片
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <span className="text-xs text-slate-500">已選擇 {previewImages.length} 張</span>
                    </div>
                    {previewImages.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                            {previewImages.map((src, i) => (
                                <img key={i} src={src} className="w-16 h-16 object-cover rounded border border-slate-600" alt="preview" />
                            ))}
                        </div>
                    )}
                 </div>

                 <div className="flex justify-end space-x-2 pt-2 border-t border-slate-700">
                   <button 
                     onClick={() => setIsWritingReview(false)}
                     className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                   >
                     取消
                   </button>
                   <button 
                     onClick={handleSubmitReview}
                     disabled={!newComment.trim()}
                     className="px-6 py-2 text-sm bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                   >
                     送出評價
                   </button>
                 </div>
               </div>
             )}

             {/* Reviews List */}
             <div className="space-y-4">
               {currentVendor.reviews.length > 0 ? currentVendor.reviews.map(rev => (
                 <div key={rev.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                   <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold border border-slate-600">
                          {rev.user.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-200">{rev.user}</span>
                     </div>
                     <span className="text-xs text-slate-500">{rev.date}</span>
                   </div>
                   <div className="mb-2">
                     {renderStars(rev.rating)}
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed">{rev.comment}</p>
                   {rev.images && rev.images.length > 0 && (
                       <div className="flex gap-2 mt-3">
                           {rev.images.map((img, idx) => (
                               <img key={idx} src={img} alt="review attachment" className="w-16 h-16 object-cover rounded border border-slate-600 cursor-pointer hover:opacity-80" />
                           ))}
                       </div>
                   )}
                 </div>
               )) : <p className="text-slate-500 italic text-center py-6 bg-slate-800/30 rounded-lg border border-slate-800 border-dashed">目前尚無評論，成為第一個評論的人！</p>}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end rounded-b-xl">
          <button 
            onClick={() => {
              onSelect(currentVendor.id);
            }}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg hover:shadow-[0_0_15px_rgba(234,88,12,0.5)] font-bold shadow-lg transform active:scale-95 transition-all w-full md:w-auto"
          >
            選擇此供應商
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;