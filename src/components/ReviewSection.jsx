import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, User, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import './ReviewSection.css';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitReview(formData);
      if (res && res._id) {
        setSuccessMsg('Thank you! Your review has been posted.');
        setFormData({ name: '', rating: 5, comment: '' });
        setShowForm(false);
        fetchReviews();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (error) {
      console.error("Failed to submit review", error);
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={16} className={i < rating ? "star-filled" : "star-empty"} />
    ));
  };

  return (
    <section className="review-section">
      <div className="container">
        <div className="review-header">
          <h2>Devotee Experiences</h2>
          <p>Read what people say about Shree Manvat Baba Mahashiv Mandir Trust</p>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <MessageCircle size={18} /> {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {successMsg && (
          <div className="review-success">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        {showForm && (
          <form className="review-form premium-shadow" onSubmit={handleSubmit}>
            <h3>Share Your Experience</h3>
            <div className="form-group">
              <label>Your Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map(num => (
                  <Star 
                    key={num} 
                    size={28} 
                    className={num <= formData.rating ? "star-filled interactive" : "star-empty interactive"}
                    onClick={() => setFormData({...formData, rating: num})}
                  />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea 
                required 
                rows="4" 
                placeholder="Tell us about your visit..."
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}

        <div className="reviews-grid">
          {reviews.length > 0 ? (
            reviews.map(review => (
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
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to share your experience!</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
