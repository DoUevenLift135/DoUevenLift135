// src/components/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filter, setFilter] = useState('global'); // global or friends
  const [sortOption, setSortOption] = useState('totalWeight'); // totalWeight, totalTime, totalWorkouts
  const [friends, setFriends] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    if (filter === 'friends') {
      fetchFriendsLeaderboard();
    } else {
      fetchGlobalLeaderboard();
    }
  }, [filter, sortOption]);

  // Fetch global leaderboard
  const fetchGlobalLeaderboard = async () => {
    try {
      const statsCollection = collection(db, 'stats');
      const snapshot = await getDocs(statsCollection);
      const data = snapshot.docs.map((doc) => doc.data());
      setLeaderboardData(sortLeaderboard(data));
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
    }
  };

  // Fetch friends-only leaderboard
  const fetchFriendsLeaderboard = async () => {
    try {
      const friendsCollection = collection(db, 'friends');
      const q = query(friendsCollection, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const friendIds = snapshot.docs.map((doc) => doc.data().friendId);

      const statsCollection = collection(db, 'stats');
      const friendsStatsQuery = query(statsCollection, where('userId', 'in', friendIds));
      const friendsSnapshot = await getDocs(friendsStatsQuery);
      const data = friendsSnapshot.docs.map((doc) => doc.data());
      setLeaderboardData(sortLeaderboard(data));
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error);
    }
  };

  // Sort leaderboard based on selected option
  const sortLeaderboard = (data) => {
    return data.sort((a, b) => b[sortOption] - a[sortOption]); // Descending order
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Leaderboard</h1>

      {/* Filter Options */}
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={() => setFilter('global')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'global' ? '#3498db' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          Global
        </button>
        <button
          onClick={() => setFilter('friends')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'friends' ? '#3498db' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Friends
        </button>
      </div>

      {/* Sorting Options */}
      <div style={{ margin: '20px 0' }}>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        >
          <option value="totalWeight">Total Weight Lifted</option>
          <option value="totalTime">Total Workout Time</option>
          <option value="totalWorkouts">Total Workouts</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '20px 0',
          fontSize: '16px',
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>Rank</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>User</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px' }}>
              {sortOption === 'totalWeight'
                ? 'Total Weight (lbs)'
                : sortOption === 'totalTime'
                ? 'Total Time (mins)'
                : 'Total Workouts'}
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{user.email}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {sortOption === 'totalWeight'
                  ? user.totalWeight
                  : sortOption === 'totalTime'
                  ? user.totalTime
                  : user.totalWorkouts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
