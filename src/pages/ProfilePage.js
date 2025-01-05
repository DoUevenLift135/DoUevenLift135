// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [profilePic, setProfilePic] = useState(auth.currentUser?.photoURL || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    fetchCurrentUsername();
  }, []);

  // Fetch current username from Firestore
  const fetchCurrentUsername = async () => {
    const userDoc = doc(db, 'users', user.uid);
    const snapshot = await getDocs(query(collection(db, 'users'), where('userId', '==', user.uid)));
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      setUsername(userData.username || '');
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (newUsername) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', newUsername));
    const snapshot = await getDocs(q);
    return snapshot.empty; // True if username is available
  };

  // Handle username update
  const handleUpdateUsername = async () => {
    if (!newUsername) {
      setErrorMessage('Please enter a valid username.');
      return;
    }

    try {
      // Check if the new username is available
      const isAvailable = await checkUsernameAvailability(newUsername);
      if (!isAvailable) {
        setErrorMessage('Username is already taken.');
        return;
      }

      // Update Firestore and Firebase Authentication
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, { username: newUsername });
      await updateProfile(user, { displayName: newUsername });

      setUsername(newUsername);
      setNewUsername('');
      setErrorMessage('');
      setSuccessMessage('Username updated successfully!');
    } catch (error) {
      setErrorMessage('Failed to update username. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Your Profile</h1>

      {/* Display Current Username */}
      <p>
        <strong>Current Username:</strong> {username || 'Not set'}
      </p>

      {/* Update Username */}
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter new username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          style={{
            padding: '10px',
            width: '80%',
            maxWidth: '400px',
            marginBottom: '10px',
            fontSize: '16px',
          }}
        />
        <br />
        <button
          onClick={handleUpdateUsername}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Update Username
        </button>
        {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
