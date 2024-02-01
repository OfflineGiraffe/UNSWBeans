export function extractUId(token) {
  let uId = localStorage.getItem('uId');
  if (uId == null) {
    uId = -1;
  }
  return uId;
}
