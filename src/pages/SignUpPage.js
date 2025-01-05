// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.empty; // Return true if username is available
  };

  // Handle Sign-Up
  const handleSignUp = async () => {
    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setErrorMessage('Username is already taken.');
        return;
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile picture to Firebase Storage (if provided)
      let profilePicUrl = '';
      if (profilePic) {
        const profilePicRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(profilePicRef, profilePic);
        profilePicUrl = await getDownloadURL(profilePicRef);
      }

      // Update Firebase Authentication profile
      await updateProfile(user, {
        displayName: username,
        photoURL: profilePicUrl,
      });

      // Add user to Firestore
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        userId: user.uid,
        username,
        email,
        profilePic: profilePicUrl,
      });

      alert('Sign-up successful!');
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Sign Up</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: '10px', margin: '10px 0', width: '80%', maxWidth: '400px', fontSize: '16px' }}
      />
      <br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: '10px', margin: '10px 0', width: '80%', maxWidth: '400px', fontSize: '16px' }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: '10px', margin: '10px 0', width: '80%', maxWidth: '400px', fontSize: '16px' }}
      />
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfilePic(e.target.files[0])}
        style={{ margin: '10px 0' }}
      />
      <br />
      <button
        onClick={handleSignUp}
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
        Sign Up
      </button>
      <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
    </div>
  );
};

export default SignUpPage;
