import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, User, CheckCircle, X, Sparkles, Send, Plus } from 'lucide-react';
import { api } from '../services/api';
import './ReviewSection.css';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await api.getReviews();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    // Ensure comment is at least 5 chars to satisfy legacy backend validation
    let commentText = (formData.comment || '').trim();
    if (commentText.length < 5) {
      commentText = commentText.padEnd(5, ' ');
    }

    try {
      const res = await api.submitReview({
        ...formData,
        comment: commentText
      });
      if (res && (res._id || res.review || (res.message && res.message.includes('Thank you')))) {
        setSuccessMsg('धन्यवाद! आपकी समीक्षा स्वीकृति हेतु सफलतापूर्वक जमा कर दी गई है।');
        setFormData({ name: '', rating: 5, comment: '' });
        setShowModal(false);
        fetchReviews();
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        const errMsg = res?.errors?.[0]?.message || res?.message || 'समीक्षा जमा करने में असमर्थ। कृपया पुनः प्रयास करें।';
        setFormError(errMsg);
      }
    } catch (error) {
      console.error("Failed to submit review", error);
      setFormError('समीक्षा पोस्ट करने में त्रुटि। कृपया पुनः प्रयास करें।');
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={16} className={i < rating ? "star-filled" : "star-empty"} />
    ));
  };

  const ratingLabels = {
    1: '⭐ 1/5 - असंतोषजनक',
    2: '⭐⭐ 2/5 - सामान्य',
    3: '⭐⭐⭐ 3/5 - अच्छा',
    4: '⭐⭐⭐⭐ 4/5 - बहुत बढ़िया',
    5: '⭐⭐⭐⭐⭐ 5/5 - उत्कृष्ट अनुभव'
  };

  return (
    <section className="review-section">
      <div className="container">
        <div className="review-header">
          <h2>भक्तों के अनुभव एवं समीक्षाएं</h2>
          <p>श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट के विषय में श्रद्धालुओं के विचार पढ़ें</p>
          <button className="btn btn-review-cta" onClick={() => setShowModal(true)}>
            <Sparkles size={18} /> अपना अनुभव साझा करें (+ समीक्षा लिखें)
          </button>
        </div>

        {successMsg && (
          <div className="review-success">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        {/* Clean & Beautiful Modal Popup for Review Submission */}
        {showModal && (
          <div className="review-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="review-modal-header">
                <div className="review-modal-title">
                  <span className="modal-icon-badge">🛕</span>
                  <div>
                    <h3>अपना अनुभव साझा करें</h3>
                    <p>श्री मन्वत बाबा मंदिर दर्शन का अपना अनुभव लिखें</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="modal-close-btn" 
                  onClick={() => setShowModal(false)}
                  aria-label="बंद करें"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="review-modal-form">
                {formError && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.88rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>⚠️</span> <span>{formError}</span>
                  </div>
                )}

                <div className="form-group-clean">
                  <label>आपका शुभ नाम <span className="req-star">*</span></label>
                  <div className="input-field-wrapper">
                    <User size={18} className="field-icon" />
                    <input 
                      type="text" 
                      required 
                      minLength={2}
                      placeholder="जैसे: राम शर्मा, लखनऊ"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="clean-input"
                    />
                  </div>
                </div>

                <div className="form-group-clean">
                  <label>रेटिंग (स्टार दें) <span className="req-star">*</span></label>
                  <div className="rating-selector-box">
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Star 
                          key={num} 
                          size={32} 
                          className={num <= formData.rating ? "star-filled interactive-star" : "star-empty interactive-star"}
                          onClick={() => setFormData({...formData, rating: num})}
                        />
                      ))}
                    </div>
                    <span className="rating-hint">{ratingLabels[formData.rating]}</span>
                  </div>
                </div>

                <div className="form-group-clean">
                  <label>आपकी समीक्षा / अनुभव <span className="req-star">*</span></label>
                  <textarea 
                    required 
                    minLength={2}
                    rows="4" 
                    placeholder="अपनी मंदिर यात्रा, दर्शन एवं व्यवस्था के बारे में अपने विचार लिखें..."
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    className="clean-textarea"
                  ></textarea>
                </div>

                <div className="modal-form-actions">
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                    रद्द करें
                  </button>
                  <button type="submit" className="btn-modal-submit" disabled={submitting}>
                    {submitting ? 'पोस्ट हो रहा है...' : (
                      <>
                        <Send size={16} /> समीक्षा पोस्ट करें
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="reviews-grid">
          {reviews.length > 0 ? (
            <>
              {reviews.map(review => (
                <div key={review._id} className="review-card premium-shadow">
                  <div className="review-card-header">
                    <div className="reviewer-avatar">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{review.name}</h4>
                      <div className="review-stars">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}

              {/* Add CTA card to open Modal */}
              <div 
                className="review-card cta-review-card" 
                onClick={() => setShowModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  border: '2px dashed #fed7aa',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '1.75rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem', boxShadow: '0 4px 12px rgba(255,96,0,0.15)' }}>
                  <Plus size={24} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9a3412', margin: '0 0 0.35rem 0' }}>अपनी समीक्षा जोड़ें</h4>
                <p style={{ fontSize: '0.88rem', color: '#c2410c', margin: 0, lineHeight: 1.4 }}>क्या आपने मंदिर दर्शन किया? अपना अनुभव साझा करें!</p>
              </div>
            </>
          ) : (
            <p className="no-reviews">अभी कोई समीक्षा नहीं है। अपने अनुभव साझा करने वाले पहले व्यक्ति बनें!</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
