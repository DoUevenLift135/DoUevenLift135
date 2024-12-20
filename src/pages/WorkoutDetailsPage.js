// src/pages/WorkoutDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams();
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  // Fetch workout details
  const fetchWorkoutDetails = async () => {
    try {
      const workoutDoc = doc(db, 'workouts', workoutId);
      const snapshot = await getDoc(workoutDoc);

      if (snapshot.exists()) {
        setWorkoutDetails(snapshot.data());
      } else {
        alert('Workout not found.');
        navigate(-1); // Go back to the previous page
      }
    } catch (error) {
      console.error('Error fetching workout details:', error);
      alert('Failed to fetch workout details. Please try again.');
    }
  };

  // Format time duration into HH:MM:SS
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Workout Details</h1>

      {workoutDetails ? (
        <>
          {/* Workout Summary */}
          <div style={{ marginTop: '20px' }}>
            <h2>Summary</h2>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(workoutDetails.date.toDate()).toLocaleDateString()}
            </p>
            <p>
              <strong>Duration:</strong> {formatDuration(workoutDetails.duration)}
            </p>
            <p>
              <strong>Total Weight Lifted:</strong> {workoutDetails.totalWeight || 0} lbs
            </p>
          </div>

          {/* Exercises List */}
          <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '600px', margin: '40px auto' }}>
            <h2>Exercises</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {workoutDetails.exercises.map((exercise, index) => (
                <li
                  key={index}
                  style={{
                    padding: '10px',
                    margin: '10px 0',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                  }}
                >
                  <h3 style={{ margin: '5px 0' }}>{exercise.name}</h3>
                  <ul>
                    {exercise.sets.map((set, idx) => (
                      <li key={idx}>
                        Set {idx + 1}: {set.reps} reps @ {set.weight} lbs
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)} // Navigate back to the previous page
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
            Back
          </button>
        </>
      ) : (
        <p>Loading workout details...</p>
      )}
    </div>
  );
};

export default WorkoutDetailsPage;
