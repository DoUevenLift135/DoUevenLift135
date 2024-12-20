// src/pages/LoginPage.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // Toggle between signup and login
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isSignup) {
        // Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully! Please log in.');
        setIsSignup(false); // Switch to login mode after successful signup
      } else {
        // Log In
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/home'); // Navigate to the home page on successful login
      }
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message); // Display any error that occurs
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>{isSignup ? 'Sign Up' : 'Log In'}</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onClick={handleAuth}
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
        {isSignup ? 'Sign Up' : 'Log In'}
      </button>
      <p style={{ margin: '10px 0', color: 'red' }}>{errorMessage}</p>
      <p
        onClick={() => setIsSignup(!isSignup)}
        style={{
          color: '#3498db',
          cursor: 'pointer',
          textDecoration: 'underline',
          marginTop: '10px',
        }}
      >
        {isSignup
          ? 'Already have an account? Log In'
          : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
};

export default LoginPage;
