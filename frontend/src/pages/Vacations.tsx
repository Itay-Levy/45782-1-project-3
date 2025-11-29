import React, { useState, useEffect, useCallback } from 'react';
import { vacationsService } from '../services/api';
import { Vacation } from '../types';
import VacationCard from '../components/VacationCard';
import Pagination from '../components/Pagination';
import './Vacations.css';

const Vacations: React.FC = () => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVacations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vacationsService.getAll(currentPage, 10, filter);
      setVacations(response.vacations);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load vacations');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const handleFollow = async (id: number) => {
    try {
      await vacationsService.follow(id);
      setVacations(vacations.map(v => 
        v.id === id 
          ? { ...v, isFollowing: true, followersCount: v.followersCount + 1 }
          : v
      ));
    } catch (err) {
      console.error('Failed to follow vacation');
    }
  };

  const handleUnfollow = async (id: number) => {
    try {
      await vacationsService.unfollow(id);
      setVacations(vacations.map(v => 
        v.id === id 
          ? { ...v, isFollowing: false, followersCount: v.followersCount - 1 }
          : v
      ));
    } catch (err) {
      console.error('Failed to unfollow vacation');
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(filter === newFilter ? '' : newFilter);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading">Loading vacations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="vacations-page">
      <div className="page-header">
        <h1>🌴 Explore Vacations</h1>
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'following' ? 'active' : ''}`}
            onClick={() => handleFilterChange('following')}
          >
            ❤️ Following
          </button>
          <button 
            className={`filter-btn ${filter === 'notStarted' ? 'active' : ''}`}
            onClick={() => handleFilterChange('notStarted')}
          >
            🗓️ Not Started
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            ✈️ Active Now
          </button>
        </div>
      </div>

      {vacations.length === 0 ? (
        <div className="no-vacations">
          <p>No vacations found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="vacations-grid">
            {vacations.map(vacation => (
              <VacationCard
                key={vacation.id}
                vacation={vacation}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Vacations;
