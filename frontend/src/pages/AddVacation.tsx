import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vacationsService } from '../services/api';
import './VacationForm.css';

const AddVacation: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (): boolean => {
    if (!destination || !description || !startDate || !endDate || !price) {
      setError('All fields are required');
      return false;
    }

    const priceNum = parseFloat(price);
    if (priceNum < 0 || priceNum > 10000) {
      setError('Price must be between 0 and 10,000');
      return false;
    }

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('destination', destination);
      formData.append('description', description);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('price', price);
      if (image) {
        formData.append('image', image);
      }

      await vacationsService.create(formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create vacation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vacation-form-container">
      <div className="vacation-form-card">
        <h2>➕ Add New Vacation</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, France"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the vacation experience..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              value={price}
              min="0"
              max="10000"
              step="0.01"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0 - 10,000"
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vacation'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVacation;
