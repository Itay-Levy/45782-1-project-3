import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { vacationsService } from '../services/api';
import { ReportData } from '../types';
import './Reports.css';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await vacationsService.getReport();
        setReportData(data);
      } catch (err) {
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const blob = await vacationsService.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vacations-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download CSV');
    }
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📊 Vacations Report</h1>
        <button className="download-btn" onClick={handleDownloadCsv}>
          📥 Download CSV
        </button>
      </div>

      <div className="chart-container">
        <h3>Followers per Vacation Destination</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={reportData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="destination" 
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              allowDecimals={false}
              label={{ value: 'Followers', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="followersCount" 
              name="Followers"
              fill="url(#colorGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="report-table">
        <h3>Detailed Data</h3>
        <table>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Followers</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td>{item.destination}</td>
                <td>{item.followersCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
