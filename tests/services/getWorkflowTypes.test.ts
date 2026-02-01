import { getWorkflowTypes } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import { API_ENDPOINTS, TOKEN_KEY } from '@/config/apiConfig';

// Mock umijs/max 的 request 方法
jest.mock('@umijs/max', () => ({
  request: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('getWorkflowTypes', () => {
  const mockToken = 'test-token-123';
  const mockResponse = {
    data: {
      count: 2,
      results: [
        { id: 1, name: 'Workflow Type 1', is_active: true },
        { id: 2, name: 'Workflow Type 2', is_active: false },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(mockToken);
    (request as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('应该使用正确的参数调用request函数', async () => {
    const params = {
      only_active: true,
      page: 1,
      page_size: 10,
    };
    const options = { timeout: 5000 };

    const result = await getWorkflowTypes(params, options);

    expect(localStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params,
        ...options,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该在token为空时仍然调用request函数', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const result = await getWorkflowTypes();

    expect(localStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer null',
        },
        params: undefined,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理没有参数的情况', async () => {
    const result = await getWorkflowTypes();

    expect(localStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(request).to haveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params: undefined,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理只有params参数的情况', async () => {
    const params = { only_active: true };

    const result = await getWorkflowTypes(params);

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理只有options参数的情况', async () => {
    const options = { timeout: 3000 };

    const result = await getWorkflowTypes(undefined, options);

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params: undefined,
        ...options,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理空options对象', async () => {
    const options = {};

    const result = await getWorkflowTypes(undefined, options);

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params: undefined,
        ...options,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理边界值参数', async () => {
    const params = {
      only_active: false,
      page: 0, // 最小页码
      page_size: 1, // 最小分页大小
    };

    const result = await getWorkflowTypes(params);

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理最大分页参数', async () => {
    const params = {
      page: 1000, // 大页码
      page_size: 100, // 大分页大小
    };

    const result = await getWorkflowTypes(params);

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('应该处理request函数抛出异常的情况', async () => {
    const error = new Error('Network error');
    (request as jest.Mock).mockRejectedValue(error);

    await expect(getWorkflowTypes()).rejects.toThrow('Network error');

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        params: undefined,
      }
    );
  });

  it('应该正确处理包含特殊字符的token', async () => {
    const specialToken = 'test-token-with-special-characters!@#$%^&*()';
    localStorageMock.getItem.mockReturnValue(specialToken);

    const result = await getWorkflowTypes();

    expect(request).toHaveBeenCalledWith(
      `${API_ENDPOINTS.WORKFLOW_TYPES}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${specialToken}`,
        },
        params: undefined,
      }
    );
    expect(result).toEqual(mockResponse);
  });
});