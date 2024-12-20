// src/pages/ProfilePage.js
import React from 'react';
import { auth } from '../firebaseConfig';

const ProfilePage = () => {
  const user = auth.currentUser;

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Username: {user?.displayName || 'N/A'}</p>
    </div>
  );
};

export default ProfilePage;
