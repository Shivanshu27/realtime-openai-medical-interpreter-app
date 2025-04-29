import React from 'react';
import { useDispatch } from 'react-redux';
import { setUserRole } from '../redux/userSlice';

const RoleSelection = () => {
  const dispatch = useDispatch();

  const handleRoleSelect = (role) => {
    dispatch(setUserRole(role));
  };

  return (
    <div className="role-selection">
      <h2>Select Your Role</h2>
      <p>Choose your role in the conversation</p>
      <button onClick={() => handleRoleSelect('doctor')}>
        I am the Doctor (English)
      </button>
      <button onClick={() => handleRoleSelect('patient')}>
        I am the Patient (Spanish)
      </button>
    </div>
  );
};

export default RoleSelection;
