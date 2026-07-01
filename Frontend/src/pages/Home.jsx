import { AppData } from '../context/AppContext'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { isAuth, logoutUser } = AppData();
  const navigate = useNavigate();

  return (
    <div className='flex w-[100px] m-auto mt-40'>
      {isAuth && (
        <button
          className='bg-red-500 text-white p-2 rounded-md'
          onClick={() => logoutUser(navigate)}
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default Home;
