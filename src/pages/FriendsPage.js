// src/pages/FriendsPage.js
import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  // Fetch friends
  const fetchFriends = async () => {
    const friendsCollection = collection(db, 'friends');
    const q = query(friendsCollection, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);

    const friendData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const friendId = doc.data().friendId;
        const friendDoc = await getDocs(query(collection(db, 'users'), where('userId', '==', friendId)));
        return friendDoc.docs[0].data();
      })
    );

    setFriends(friendData);
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    const requestsCollection = collection(db, 'friendRequests');
    const q = query(requestsCollection, where('toUserId', '==', user.uid));
    const snapshot = await getDocs(q);
    setFriendRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId, fromUserId) => {
    const requestDoc = doc(db, 'friendRequests', requestId);
    await updateDoc(requestDoc, { status: 'accepted' });

    await setDoc(doc(db, 'friends', `${user.uid}_${fromUserId}`), {
      userId: user.uid,
      friendId: fromUserId,
    });

    fetchFriends();
    fetchFriendRequests();
  };

  // Decline friend request
  const declineFriendRequest = async (requestId) => {
    await deleteDoc(doc(db, 'friendRequests', requestId));
    fetchFriendRequests();
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Friends</h1>

      {/* Friend Requests */}
      <div>
        <h2>Friend Requests</h2>
        {friendRequests.map((req) => (
          <div key={req.id} style={{ marginBottom: '10px' }}>
            <span>{req.fromUserId}</span>
            <button onClick={() => acceptFriendRequest(req.id, req.fromUserId)}>Accept</button>
            <button onClick={() => declineFriendRequest(req.id)}>Decline</button>
          </div>
        ))}
      </div>

      {/* Friends List */}
      <div>
        <h2>Your Friends</h2>
        {friends.map((friend) => (
          <div key={friend.userId} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <img
              src={friend.profilePic}
              alt={friend.username}
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
            />
            <span>{friend.username}</span>
            <button onClick={() => console.log('Unfriend functionality goes here')}>Unfriend</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsPage;
