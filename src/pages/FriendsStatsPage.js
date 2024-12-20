// src/pages/FriendStatsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const FriendStatsPage = () => {
  const { friendId } = useParams();
  const [friendStats, setFriendStats] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriendStats();
    fetchWorkoutHistory();
  }, [friendId]);

  // Fetch friend stats
  const fetchFriendStats = async () => {
    try {
      const statsCollection = collection(db, 'stats');
      const q = query(statsCollection, where('userId', '==', friendId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setFriendStats(snapshot.docs[0].data());
      } else {
        setFriendStats(null);
      }
    } catch (error) {
      console.error('Error fetching friend stats:', error);
    }
  };

  // Fetch workout history
  const fetchWorkoutHistory = async () => {
    try {
      const workoutsCollection = collection(db, 'workouts');
      const q = query(workoutsCollection, where('userId', '==', friendId));
      const snapshot = await getDocs(q);

      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkoutHistory(workouts);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Friend's Stats</h1>

      {/* Friend Overview */}
      {friendStats ? (
        <div style={{ marginTop: '20px' }}>
          <h2>Overview</h2>
          <p>
            <strong>Total Workouts:</strong> {friendStats.totalWorkouts || 0}
          </p>
          <p>
            <strong>Total Weight Lifted:</strong> {friendStats.totalWeight || 0} lbs
          </p>
          <p>
            <strong>Total Workout Time:</strong> {friendStats.totalTime || 0} minutes
          </p>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}

      {/* Workout History */}
      <div style={{ marginTop: '40px' }}>
        <h2>Workout History</h2>
        {workoutHistory.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {workoutHistory.map((workout) => (
              <li
                key={workout.id}
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  textAlign: 'left',
                }}
              >
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(workout.date.toDate()).toLocaleDateString()}
                </p>
                <p>
                  <strong>Duration:</strong> {Math.floor(workout.duration / 60)}m{' '}
                  {workout.duration % 60}s
                </p>
                <button
                  onClick={() => navigate(`/workout-details/${workout.id}`)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No workout history available.</p>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/home')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default FriendStatsPage;
