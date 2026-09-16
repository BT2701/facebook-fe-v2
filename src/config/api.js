export const unwrap = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

export const asArray = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (Array.isArray(value.$values)) {
    return value.$values;
  }
  if (Array.isArray(value.posts)) {
    return value.posts;
  }
  if (Array.isArray(value.comments)) {
    return value.comments;
  }
  if (Array.isArray(value.notifications)) {
    return value.notifications;
  }
  if (Array.isArray(value.stories)) {
    return value.stories;
  }
  return [];
};
