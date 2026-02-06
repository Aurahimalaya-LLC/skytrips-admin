import { describe, it, expect } from 'vitest';
import { transformHeroData } from './transformHeroData';

describe('transformHeroData', () => {
  it('should transform simple text into a single array item', () => {
    const result = transformHeroData('Hello World', 'Subtitle here');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ headline: 'Hello World', subtitle: 'Subtitle here' });
  });

  it('should handle empty inputs', () => {
    const result = transformHeroData('', '');
    expect(result).toEqual([]);
  });

  it('should split by pipe delimiter |', () => {
    const result = transformHeroData('Slide 1 | Slide 2', 'Sub 1 | Sub 2');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ headline: 'Slide 1', subtitle: 'Sub 1' });
    expect(result[1]).toEqual({ headline: 'Slide 2', subtitle: 'Sub 2' });
  });

  it('should handle mismatched lengths by filling with empty strings', () => {
    const result = transformHeroData('Slide 1 | Slide 2', 'Sub 1');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ headline: 'Slide 1', subtitle: 'Sub 1' });
    expect(result[1]).toEqual({ headline: 'Slide 2', subtitle: '' });
  });

  it('should NOT split by comma (safe default for titles like "London, UK")', () => {
    const result = transformHeroData('London, UK', 'Visit us, today');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ headline: 'London, UK', subtitle: 'Visit us, today' });
  });
});
