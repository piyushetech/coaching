import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { setAuth, clearAuth, setLoading } from '../store/authSlice';
import { connectSocket, disconnectSocket } from '../services/socket';
import { parentApi, nannyApi } from '../services/endpoints';
import { tokenStorage } from '../services/storage';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const token = await tokenStorage.getItem('accessToken');
        if (!token) {
          dispatch(setLoading(false));
          return;
        }

        const profileRes =
          (await parentApi.getProfile().catch(() => null)) ||
          (await nannyApi.getProfile().catch(() => null));

        if (profileRes?.data?.data) {
          const profile = profileRes.data.data;
          dispatch(
            setAuth({
              user: profile.user,
              profile,
            })
          );
          await connectSocket();
        } else {
          dispatch(clearAuth());
        }
      } catch {
        dispatch(clearAuth());
      } finally {
        dispatch(setLoading(false));
      }
    };

    init();
    return () => disconnectSocket();
  }, [dispatch]);
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await tokenStorage.setItem('accessToken', accessToken);
  await tokenStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = async () => {
  await tokenStorage.deleteItem('accessToken');
  await tokenStorage.deleteItem('refreshToken');
};
