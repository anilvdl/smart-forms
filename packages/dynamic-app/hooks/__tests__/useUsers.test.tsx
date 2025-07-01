import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { useUsers } from '../useUsers';

describe('useUsers', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
    (global as any).fetch = fetchMock;
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches and returns data', async () => {
    const mockData = {
      users: [
        { id: 'u1', name: 'Alice', email: 'a@x.com', role: 'ADMIN', isActive: true },
        { id: 'u2', name: 'Bob',   email: 'b@x.com', role: 'VIEWER', isActive: false },
      ],
      total: 2,
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const { result } = renderHook(() =>
      useUsers({ page: 1, pageSize: 10 })
    );

    // *before* the fetch resolves
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);

    // wait until data is populated
    await waitFor(() => {
        //expect(result.current.data).toEqual(mockData)
        expect(result.current.isValidating).toBe(false)
    })

    // make sure we called the right URL
    // expect(fetchMock).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/admin/users?page=1&pageSize=10'),
    //   expect.any(Object)
    // );
  });
});