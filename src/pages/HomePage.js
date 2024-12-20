// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';

const HomePage = () => {
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFriends();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchFriends = async () => {
    const friendsCollection = collection(db, 'friends');
    const q = query(friendsCollection, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const friendsList = snapshot.docs.map((doc) => doc.data());
    setFriends(friendsList);
  };

  const fetchLeaderboard = async () => {
    const statsCollection = collection(db, 'stats');
    const snapshot = await getDocs(statsCollection);
    const leaderboardData = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10);
    setLeaderboard(leaderboardData);
  };

  const addFriend = async () => {
    if (!friendEmail.trim()) {
      alert('Please enter a valid email.');
      return;
    }

    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', friendEmail));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert('No user found with this email.');
        return;
      }

      const friendDoc = snapshot.docs[0];
      const friendId = friendDoc.id;

      const friendData = {
        userId: user.uid,
        friendId,
        friendEmail,
      };

      await setDoc(doc(db, 'friends', `${user.uid}_${friendId}`), friendData);
      setFriends([...friends, friendData]);
      setFriendEmail('');
      alert('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome, {user?.email}</h1>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '20px',
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          style={buttonStyle}
        >
          Profile
        </button>
        <button
          onClick={() => navigate('/workout')}
          style={{ ...buttonStyle, backgroundColor: '#2ecc71' }}
        >
          Start Workout
        </button>
        <button
          onClick={() => navigate('/stats')}
          style={{ ...buttonStyle, backgroundColor: '#9b59b6' }}
        >
          Stats
        </button>
      </div>

      {/* Friends Section */}
      <div style={{ marginTop: '40px', textAlign: 'left' }}>
        <h2>Your Friends</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Enter friend's email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            style={inputStyle}
          />
          <button onClick={addFriend} style={buttonStyle}>
            Add Friend
          </button>
        </div>
        <ul>
          {friends.map((friend, index) => (
            <li key={index} style={{ marginBottom: '10px', fontSize: '14px' }}>
              <strong>{friend.friendEmail}</strong>
              <button
                onClick={() => navigate(`/friend-stats/${friend.friendId}`)}
                style={{ ...buttonStyle, marginLeft: '10px', fontSize: '12px' }}
              >
                View Stats
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Leaderboard Section */}
      <div style={{ marginTop: '40px' }}>
        <h2>Leaderboard</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>Rank</th>
              <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>User</th>
              <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>Total Weight</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{user.email}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{user.totalWeight} lbs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Shared styles for buttons and inputs
const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
};

const inputStyle = {
  padding: '10px',
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: '5px',
  fontSize: '16px',
};

export default HomePage;
