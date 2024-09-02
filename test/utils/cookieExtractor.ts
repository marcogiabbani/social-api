export interface CookieAttributes {
  Authentication: string;
  HttpOnly: boolean;
  Path: string;
  'Max-Age': string;
}

export const cookieExtractor = (cookie: string): CookieAttributes => {
  const cookieArray = cookie[0].split(';');
  const cookieElements: any = {};
  for (const element of cookieArray) {
    if (element.includes('=')) {
      const elementFields = element.split('=').map((part) => part.trim());
      cookieElements[elementFields[0]] = elementFields[1];
    } else {
      cookieElements[element.trim()] = true;
    }
  }
  return cookieElements;
};
