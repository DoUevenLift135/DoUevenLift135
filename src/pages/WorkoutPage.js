// src/pages/WorkoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

const predefinedExercises = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-ups',
  'Overhead Press',
  'Barbell Rows',
  'Bicep Curls',
  'Tricep Dips',
];

const WorkoutPage = () => {
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [workoutSaved, setWorkoutSaved] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(null);
  const [exerciseDatabase, setExerciseDatabase] = useState([]);

  const navigate = useNavigate();

  // Load the exercise database on component mount
  useEffect(() => {
    const loadExerciseDatabase = async () => {
      const exerciseCollection = collection(db, 'exerciseDatabase');
      const snapshot = await getDocs(exerciseCollection);
      const exercisesFromDB = snapshot.docs.map((doc) => doc.data().name);
      setExerciseDatabase([...predefinedExercises, ...exercisesFromDB]);
    };
    loadExerciseDatabase();
  }, []);

  // Start Workout Timer
  useEffect(() => {
    if (!workoutStartTime) {
      setWorkoutStartTime(Date.now());
    }
  }, [workoutStartTime]);

  // Add an exercise
  const handleAddExercise = async () => {
    const exerciseName = newExerciseName.trim();
    if (!exerciseName) {
      alert('Please enter a valid exercise name.');
      return;
    }

    if (!exerciseDatabase.includes(exerciseName)) {
      // Add the new exercise to the shared exercise database
      try {
        const exerciseCollection = collection(db, 'exerciseDatabase');
        await addDoc(exerciseCollection, { name: exerciseName });
        setExerciseDatabase([...exerciseDatabase, exerciseName]);
        console.log('New exercise added to database:', exerciseName);
      } catch (error) {
        console.error('Error adding exercise to database:', error);
      }
    }

    const newExercise = {
      name: exerciseName,
      sets: [],
    };

    setExercises([...exercises, newExercise]);
    setNewExerciseName(''); // Clear input after adding
    setCurrentExerciseIndex(exercises.length); // Navigate to the new exercise
  };

  // Add a new set to the current exercise
  const handleAddSet = (reps, weight) => {
    if (currentExerciseIndex === null || !exercises[currentExerciseIndex]) {
      alert('Please select or create an exercise first before adding sets.');
      return;
    }

    const updatedExercises = [...exercises];
    updatedExercises[currentExerciseIndex].sets.push({ reps, weight });
    setExercises(updatedExercises);
  };

  // Save the workout to Firestore
  const handleSaveWorkout = async () => {
    try {
      const workoutEndTime = Date.now();
      const durationInSeconds = Math.floor((workoutEndTime - workoutStartTime) / 1000);
      setWorkoutDuration(durationInSeconds);

      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to save a workout.');
        return;
      }

      const workoutData = {
        userId: user.uid,
        date: Timestamp.now(),
        exercises,
        duration: durationInSeconds,
      };

      await addDoc(collection(db, 'workouts'), workoutData);
      setWorkoutSaved(true);
      console.log('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  // Format time duration into HH:MM:SS
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  // Handle Forget Workout and Navigate to Home
  const handleForgetWorkout = () => {
    if (window.confirm('Are you sure you want to discard this workout?')) {
      setExercises([]);
      setCurrentExerciseIndex(null);
      setWorkoutStartTime(null);
      setWorkoutSaved(false);
      navigate('/home');
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
      {/* Red X Button */}
      <button
        onClick={handleForgetWorkout}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        X
      </button>

      <h1>Your Workout</h1>

      {/* Show Select Exercise if no exercise is selected */}
      {currentExerciseIndex === null && !workoutSaved && (
        <div className="form-section">
          <h3>Select Exercise</h3>
          <select
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
          >
            <option value="">Type or Select an Exercise</option>
            {exerciseDatabase.map((exercise, index) => (
              <option key={index} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or write a custom exercise"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <button
            onClick={() => {
              if (newExerciseName.trim()) {
                handleAddExercise();
              } else {
                alert('Please select or type an exercise name.');
              }
            }}
          >
            Add Exercise
          </button>
        </div>
      )}

      {/* Show Current Exercise and Add a Set if an exercise is selected */}
      {currentExerciseIndex !== null && !workoutSaved && (
        <>
          {/* Current Exercise Section */}
          <div>
            <h2>
              Current Exercise: {exercises[currentExerciseIndex]?.name}
              <button
                onClick={() => setCurrentExerciseIndex(null)} // Return to Select Exercise
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  marginLeft: '10px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </h2>
            <ul>
              {exercises[currentExerciseIndex]?.sets.map((set, index) => (
                <li key={index}>
                  {set.reps} reps @ {set.weight} lbs
                </li>
              ))}
            </ul>
          </div>

          {/* Add a Set Section */}
          <div className="form-section">
            <h3>Current Set Info</h3>
            <input
              type="number"
              placeholder="Reps"
              id="reps"
            />
            <input
              type="number"
              placeholder="Weight"
              id="weight"
            />
          </div>

          {/* Navigation and Log This Set Buttons */}
          <div className="nav-buttons" style={{ marginTop: '20px' }}>
            <button
              onClick={() =>
                setCurrentExerciseIndex(
                  (prevIndex) => (prevIndex - 1 + exercises.length) % exercises.length
                )
              }
              disabled={exercises.length <= 1}
              style={{ marginRight: '10px' }}
            >
              Previous Exercise
            </button>
            <button
              onClick={() => {
                const reps = document.getElementById('reps').value;
                const weight = document.getElementById('weight').value;
                if (reps && weight) {
                  handleAddSet(Number(reps), Number(weight));
                  document.getElementById('reps').value = '';
                  document.getElementById('weight').value = '';
                } else {
                  alert('Please enter reps and weight.');
                }
              }}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
              }}
            >
              Log This Set
            </button>
            <button
              onClick={() =>
                setCurrentExerciseIndex((prevIndex) => (prevIndex + 1) % exercises.length)
              }
              disabled={exercises.length <= 1}
              style={{ marginLeft: '10px' }}
            >
              Next Exercise
            </button>
          </div>
        </>
      )}

      {/* Save Workout Button */}
      {!workoutSaved && exercises.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={handleSaveWorkout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Save Workout
          </button>
        </div>
      )}

      {/* Workout Overview After Saving */}
      {workoutSaved && (
        <div>
          <h2>Workout Overview</h2>
          <p>Total Workout Time: {formatDuration(workoutDuration)}</p>
          <ul>
            {exercises.map((exercise, index) => (
              <li key={index}>
                <strong>{exercise.name}</strong>
                <ul>
                  {exercise.sets.map((set, idx) => (
                    <li key={idx}>
                      {set.reps} reps @ {set.weight} lbs
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/home')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Home
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
