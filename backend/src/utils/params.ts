export const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0] || '';
  return id || '';
};
