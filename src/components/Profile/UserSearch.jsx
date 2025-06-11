import React, { useState, useEffect } from 'react';
import { useSearchUsersQuery, useCreateConversationMutation } from '../../features/profile/chatApi';

const UserSearch = ({ onConversationCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [createConversation] = useCreateConversationMutation();

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useSearchUsersQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2, // Skip query if search term is too short
  });

  const handleCreateConversation = async (participantId) => {
    try {
      const newConv = await createConversation(participantId).unwrap();
      onConversationCreated(newConv); // Pass the new conversation back to ChatInterface
      setSearchTerm(''); // Clear search input
      setDebouncedSearchTerm('');
    } catch (err) {
      console.error('Failed to create conversation:', err);
      alert(err.data?.message || 'Failed to create conversation.');
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Start a New Chat</h3>
      <input
        type="text"
        placeholder="Search users by username, first name, or last name..."
        className="w-full border border-gray-300 rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && debouncedSearchTerm.length >= 2 && <p>Searching users...</p>}
      {isError && debouncedSearchTerm.length >= 2 && (
        <p className="text-red-500">Error: {error.message || 'Failed to search users'}</p>
      )}

      {users && users.length > 0 ? (
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white rounded-md shadow-sm">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleCreateConversation(user.id)}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm mr-3">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName} ({user.username})
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        debouncedSearchTerm.length >= 2 &&
        !isLoading &&
        !isError && <p className="text-center text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default UserSearch;
