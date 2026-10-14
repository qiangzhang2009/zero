/**
 * 统一错误处理工具
 * 提供一致的错误响应格式和错误处理函数
 */

// 错误类型枚举
export const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
};

// 自定义 API 错误类
export class APIError extends Error {
  constructor(message, statusCode = 500, type = ErrorType.SERVER_ERROR) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.type = type;
  }
}

// 创建错误响应对象
export function createErrorResponse(error, includeStack = false) {
  const response = {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      type: error.type || ErrorType.SERVER_ERROR,
    }
  };

  // 仅在开发环境添加堆栈信息
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

// 异步处理器包装器 - 自动捕获错误
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 处理
export function notFoundHandler(req, res) {
  res.status(404).json(createErrorResponse(
    new APIError(`Route ${req.method} ${req.path} not found`, 404, ErrorType.NOT_FOUND)
  ));
}

// 全局错误处理中间件
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // 处理已知错误类型
  if (err instanceof APIError) {
    return res.status(err.statusCode).json(createErrorResponse(err));
  }

  // 处理 Axios 错误
  if (err.response?.data?.error) {
    return res.status(err.response.status || 500).json({
      success: false,
      error: {
        message: err.response.data.error,
        type: ErrorType.API_ERROR,
      }
    });
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse(
      new APIError(err.message, 400, ErrorType.VALIDATION_ERROR)
    ));
  }

  // 默认错误响应
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(createErrorResponse(
    new APIError(
      statusCode === 500 ? '服务器内部错误，请稍后再试' : err.message,
      statusCode,
      ErrorType.SERVER_ERROR
    )
  ));
}

export default {
  ErrorType,
  APIError,
  createErrorResponse,
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
