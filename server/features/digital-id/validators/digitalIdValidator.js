export function validateDigitalId(data) {
  const errors = [];
  if (typeof data.name !== 'string' || data.name.length > 200) errors.push('name');
  if (typeof data.position !== 'string' || data.position.length > 200) errors.push('position');
  if (typeof data.bio !== 'string' || data.bio.length > 500) errors.push('bio');
  if (typeof data.issued !== 'string') errors.push('issued');
  if (typeof data.expires !== 'string') errors.push('expires');
  return errors;
}
