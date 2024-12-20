// src/pages/StatsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const StatsPage = () => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const querySnapshot = await getDocs(collection(db, 'workouts'));
      const workoutData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkouts(workoutData);
    };

    fetchWorkouts();
  }, []);

  return (
    <div>
      <h1>Stats</h1>
      {workouts.map((workout) => (
        <div key={workout.id}>
          <h3>{workout.date}</h3>
          <ul>
            {workout.exercises.map((exercise, index) => (
              <li key={index}>
                {exercise.name}: {exercise.sets.map((set) => `${set.reps}x${set.weight}`).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default StatsPage;
