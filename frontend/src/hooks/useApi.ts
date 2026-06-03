import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      endpoint: string,
      body?: any,
      token?: string
    ): Promise<ApiResponse<T> | null> => {
      setLoading(true);
      setError(null);

      try {
        const headers: any = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const options: any = {
          method,
          headers,
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'An error occurred');
          return errorData;
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Network error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { request, loading, error };
}

export function useAuth() {
  const { request, loading, error } = useApi();

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string, interests?: string[]) => {
      return request('POST', '/api/auth/signup', {
        name,
        email,
        password,
        phone,
        interests,
      });
    },
    [request]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      return request('POST', '/api/auth/login', { email, password });
    },
    [request]
  );

  const getProfile = useCallback(
    async (token: string) => {
      return request('GET', '/api/auth/profile', undefined, token);
    },
    [request]
  );

  const updateProfile = useCallback(
    async (token: string, data: any) => {
      return request('PUT', '/api/auth/profile', data, token);
    },
    [request]
  );

  return { signup, login, getProfile, updateProfile, loading, error };
}

export function useProducts() {
  const { request, loading, error } = useApi();

  const getProducts = useCallback(
    async (category?: string, search?: string, page?: number) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (page) params.append('page', page.toString());
      params.append('limit', '20');

      return request('GET', `/api/products/fashion?${params.toString()}`);
    },
    [request]
  );

  const getProduct = useCallback(
    async (id: number) => {
      return request('GET', `/api/products/fashion/${id}`);
    },
    [request]
  );

  const createProduct = useCallback(
    async (token: string, product: any) => {
      return request('POST', '/api/products/fashion', product, token);
    },
    [request]
  );

  return { getProducts, getProduct, createProduct, loading, error };
}

export function useCommunities() {
  const { request, loading, error } = useApi();

  const getCommunities = useCallback(
    async (type?: string, search?: string, page?: number) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (search) params.append('search', search);
      if (page) params.append('page', page.toString());
      params.append('limit', '20');

      return request('GET', `/api/communities?${params.toString()}`);
    },
    [request]
  );

  const createCommunity = useCallback(
    async (token: string, community: any) => {
      return request('POST', '/api/communities', community, token);
    },
    [request]
  );

  const joinCommunity = useCallback(
    async (token: string, id: number) => {
      return request('POST', `/api/communities/${id}/join`, {}, token);
    },
    [request]
  );

  const getUserCommunities = useCallback(
    async (token: string) => {
      return request('GET', '/api/communities/user/my-communities', undefined, token);
    },
    [request]
  );

  return { getCommunities, createCommunity, joinCommunity, getUserCommunities, loading, error };
}

export function usePost() {
  const { request, loading, error } = useApi();

  const getFeed = useCallback(
    async (token?: string, page?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      params.append('limit', '20');

      return request('GET', `/api/posts/feed?${params.toString()}`, undefined, token);
    },
    [request]
  );

  const createPost = useCallback(
    async (token: string, post: any) => {
      return request('POST', '/api/posts', post, token);
    },
    [request]
  );

  const likePost = useCallback(
    async (token: string, id: number) => {
      return request('POST', `/api/posts/${id}/like`, {}, token);
    },
    [request]
  );

  const unlikePost = useCallback(
    async (token: string, id: number) => {
      return request('POST', `/api/posts/${id}/unlike`, {}, token);
    },
    [request]
  );

  const addComment = useCallback(
    async (token: string, postId: number, content: string) => {
      return request('POST', `/api/posts/${postId}/comments`, { content }, token);
    },
    [request]
  );

  return { getFeed, createPost, likePost, unlikePost, addComment, loading, error };
}

export function useOrders() {
  const { request, loading, error } = useApi();

  const createOrder = useCallback(
    async (token: string, order: any) => {
      return request('POST', '/api/orders', order, token);
    },
    [request]
  );

  const confirmPayment = useCallback(
    async (token: string, payment: any) => {
      return request('POST', '/api/orders/confirm', payment, token);
    },
    [request]
  );

  const getMyOrders = useCallback(
    async (token: string, page?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      params.append('limit', '20');

      return request('GET', `/api/orders/me/orders?${params.toString()}`, undefined, token);
    },
    [request]
  );

  return { createOrder, confirmPayment, getMyOrders, loading, error };
}

export function useRewards() {
  const { request, loading, error } = useApi();

  const getRewards = useCallback(
    async (token: string) => {
      return request('GET', '/api/rewards/me', undefined, token);
    },
    [request]
  );

  const getReferralCode = useCallback(
    async (token: string) => {
      return request('GET', '/api/rewards/referral/code', undefined, token);
    },
    [request]
  );

  const applyReferral = useCallback(
    async (token: string, referralCode: string) => {
      return request('POST', '/api/rewards/referral/apply', { referral_code: referralCode }, token);
    },
    [request]
  );

  const getLeaderboard = useCallback(
    async () => {
      return request('GET', '/api/rewards/leaderboard?limit=10');
    },
    [request]
  );

  return { getRewards, getReferralCode, applyReferral, getLeaderboard, loading, error };
}
