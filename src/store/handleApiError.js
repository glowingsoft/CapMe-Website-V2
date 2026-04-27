export function handleApiError(error) {
  if (!error) return 'Unknown error occurred.';
  if (error.status === 401) {
    // Optionally redirect to login or show a message
    return 'Unauthorized. Please login again.';
  }
  if (error.status === 404) {
    return 'Resource not found.';
  }
  if (error.data && error.data.message) {
    return error.data.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred. Please try again.';
}
