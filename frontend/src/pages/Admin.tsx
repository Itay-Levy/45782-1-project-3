import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vacationsService } from '../services/api';
import { Vacation } from '../types';
import VacationCard from '../components/VacationCard';
import Pagination from '../components/Pagination';
import './Admin.css';

const Admin: React.FC = () => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchVacations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vacationsService.getAll(currentPage, 10);
      setVacations(response.vacations);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to load vacations');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const handleEdit = (vacation: Vacation) => {
    navigate(`/admin/edit/${vacation.id}`);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await vacationsService.delete(id);
      setVacations(vacations.filter(v => v.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete vacation');
    }
  };

  if (loading) {
    return <div className="loading">Loading vacations...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🛠️ Admin Panel</h1>
        <button 
          className="add-btn"
          onClick={() => navigate('/admin/add')}
        >
          ➕ Add New Vacation
        </button>
      </div>

      {deleteConfirm && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <p>Are you sure you want to delete this vacation?</p>
            <div className="confirm-actions">
              <button 
                className="confirm-yes"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
              <button 
                className="confirm-no"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {vacations.length === 0 ? (
        <div className="no-vacations">
          <p>No vacations found. Add your first vacation!</p>
        </div>
      ) : (
        <>
          <div className="vacations-grid">
            {vacations.map(vacation => (
              <VacationCard
                key={vacation.id}
                vacation={vacation}
                isAdmin={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

export default Admin;
