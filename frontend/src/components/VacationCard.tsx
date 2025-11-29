import React from 'react';
import { Vacation } from '../types';
import { getImageUrl } from '../services/api';
import './VacationCard.css';

interface VacationCardProps {
  vacation: Vacation;
  isAdmin?: boolean;
  onFollow?: (id: number) => void;
  onUnfollow?: (id: number) => void;
  onEdit?: (vacation: Vacation) => void;
  onDelete?: (id: number) => void;
}

const VacationCard: React.FC<VacationCardProps> = ({
  vacation,
  isAdmin = false,
  onFollow,
  onUnfollow,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatus = () => {
    const now = new Date();
    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);
    
    if (now < start) return { text: 'Upcoming', class: 'upcoming' };
    if (now > end) return { text: 'Ended', class: 'ended' };
    return { text: 'Active Now', class: 'active' };
  };

  const status = getStatus();

  return (
    <div className="vacation-card">
      <div className="card-image">
        <img 
          src={getImageUrl(vacation.imageFileName)} 
          alt={vacation.destination}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
        <span className={`status-badge ${status.class}`}>{status.text}</span>
        <span className="followers-badge">
          ❤️ {vacation.followersCount} followers
        </span>
      </div>
      
      <div className="card-content">
        <h3 className="destination">{vacation.destination}</h3>
        <p className="description">{vacation.description}</p>
        
        <div className="dates">
          <span>📅 {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}</span>
        </div>
        
        <div className="price">
          💰 ${vacation.price.toLocaleString()}
        </div>
        
        <div className="card-actions">
          {!isAdmin && (
            <button
              className={`follow-btn ${vacation.isFollowing ? 'following' : ''}`}
              onClick={() => vacation.isFollowing 
                ? onUnfollow?.(vacation.id) 
                : onFollow?.(vacation.id)
              }
            >
              {vacation.isFollowing ? '💔 Unfollow' : '❤️ Follow'}
            </button>
          )}
          
          {isAdmin && (
            <>
              <button 
                className="edit-btn"
                onClick={() => onEdit?.(vacation)}
              >
                ✏️ Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => onDelete?.(vacation.id)}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacationCard;
