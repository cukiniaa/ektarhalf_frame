import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { imgBufferToString } from '../main/util';

describe('imgBufferToString', () => {
  it('should convert image buffer to base64 string', () => {
    const img = Buffer.from('test');
    const result = imgBufferToString(img);
    expect(result).toBe('data:image/jpeg;base64,dGVzdA==');
  });
});