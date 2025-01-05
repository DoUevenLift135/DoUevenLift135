// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // Username or email
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Check if the identifier is a username or email
      let email = identifier;
      if (!identifier.includes('@')) {
        // If it's not an email, fetch the email associated with the username
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('username', '==', identifier));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setErrorMessage('Username not found.');
          return;
        }

        // Extract the email from the user's Firestore document
        email = snapshot.docs[0].data().email;
      }

      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Log In</h1>
      <input
        type="text"
        placeholder="Username or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        style={{
          padding: '10px',
          margin: '10px 0',
          width: '80%',
          maxWidth: '400px',
          fontSize: '16px',
        }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: '10px',
          margin: '10px 0',
          width: '80%',
          maxWidth: '400px',
          fontSize: '16px',
        }}
      />
      <br />
      <button
        onClick={handleLogin}
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
        Log In
      </button>
      <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
      <p
        onClick={() => navigate('/signup')}
        style={{
          color: '#3498db',
          cursor: 'pointer',
          textDecoration: 'underline',
          marginTop: '20px',
        }}
      >
        Don't have an account? Sign Up
      </p>
    </div>
  );
};

export default LoginPage;
