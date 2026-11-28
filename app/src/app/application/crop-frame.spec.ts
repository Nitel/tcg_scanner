import { cropFrame, expandArea } from './crop-frame';

describe('expandArea', () => {
  it('adds a margin on each side', () => {
    expect(expandArea({ x: 100, y: 100, width: 100, height: 200 }, 0.1, 1000, 1000)).toEqual({
      x: 90,
      y: 80,
      width: 120,
      height: 240,
    });
  });

  it('stays inside the frame', () => {
    expect(expandArea({ x: 5, y: 0, width: 90, height: 100 }, 0.1, 100, 100)).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });
});

describe('cropFrame', () => {
  it('copies the pixels of the area', () => {
    // 3 × 2 frame whose pixel values are their own index.
    const pixels = Uint8ClampedArray.from({ length: 24 }, (_, index) => Math.floor(index / 4));

    const crop = cropFrame(
      { capturedAt: 7, width: 3, height: 2, pixels },
      { x: 1, y: 0, width: 2, height: 2 },
    );

    expect(crop).toMatchObject({ capturedAt: 7, width: 2, height: 2 });
    expect([...crop.pixels].filter((_, index) => index % 4 === 0)).toEqual([1, 2, 4, 5]);
  });
});
