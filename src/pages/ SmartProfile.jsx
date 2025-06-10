import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserProfile from './UserProfile';
import ViewUserProfile from './ViewUserProfile';

const SmartProfile = () => {
  const { username } = useParams();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  // If logged-in user's username matches the route param
  if (username === user.username) {
    return <UserProfile />;
  }

  return <ViewUserProfile />;
};

export default SmartProfile;
