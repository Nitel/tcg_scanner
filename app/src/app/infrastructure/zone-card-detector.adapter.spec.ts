import type { CameraFrame, CardRectangle } from '../application/ports/camera-frame';
import { aimingZone, ZoneCardDetectorAdapter } from './zone-card-detector.adapter';

type Rgb = readonly [number, number, number];

const WIDTH = 270;
const HEIGHT = 480;
const ZONE = aimingZone(WIDTH, HEIGHT);
const BACKGROUNDS: [string, Rgb][] = [
  ['light wood', [200, 160, 110]],
  ['dark wood', [90, 60, 40]],
  ['black', [12, 12, 12]],
  ['white', [235, 235, 235]],
];

/** Uniform background, with optional rectangles painted over it. Fictive images only. */
function frame(background: Rgb, ...shapes: [CardRectangle, Rgb][]): CameraFrame {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4).fill(255);
  const paint = (area: CardRectangle, color: Rgb): void => {
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) pixels.set(color, (y * WIDTH + x) * 4);
    }
  };
  paint({ x: 0, y: 0, width: WIDTH, height: HEIGHT }, background);
  for (const [area, color] of shapes) paint(area, color);
  return { capturedAt: 0, width: WIDTH, height: HEIGHT, pixels };
}

/** A card: white border around a colored artwork. Shifted by a share of the zone size. */
function card(shiftX = 0, shiftY = 0): [CardRectangle, Rgb][] {
  const outline = {
    ...ZONE,
    x: ZONE.x + Math.round(ZONE.width * shiftX),
    y: ZONE.y + Math.round(ZONE.height * shiftY),
  };
  const inset = Math.round(ZONE.width * 0.08);
  const artwork = {
    x: outline.x + inset,
    y: outline.y + inset,
    width: outline.width - 2 * inset,
    height: outline.height - 2 * inset,
  };
  // Parts outside the frame are cut off.
  const clip = (area: CardRectangle): CardRectangle => {
    const x = Math.max(0, area.x);
    const y = Math.max(0, area.y);
    return {
      x,
      y,
      width: Math.min(WIDTH, area.x + area.width) - x,
      height: Math.min(HEIGHT, area.y + area.height) - y,
    };
  };
  const shapes: [CardRectangle, Rgb][] = [
    [outline, [240, 240, 240]],
    [artwork, [40, 90, 170]],
  ];
  return shapes.map(([area, color]) => [clip(area), color]);
}

const scale = (color: Rgb, factor: number): Rgb => [
  color[0] * factor,
  color[1] * factor,
  color[2] * factor,
];

describe('aimingZone', () => {
  it('is centered, shaped like a card and inside the frame', () => {
    const zone = aimingZone(1080, 1920);

    expect(zone).toEqual({ x: 162, y: 432, width: 756, height: 1056 });
  });

  it('fits a landscape frame', () => {
    const zone = aimingZone(1920, 1080);

    expect(zone.height).toBeLessThan(1080);
    expect(zone.width / zone.height).toBeCloseTo(63 / 88, 2);
  });
});

describe('ZoneCardDetectorAdapter', () => {
  let detector: ZoneCardDetectorAdapter;

  beforeEach(() => (detector = new ZoneCardDetectorAdapter()));

  it('observes nothing before calibration', () => {
    expect(detector.observe(frame([0, 0, 0]))).toBeUndefined();
  });

  it('requires a new calibration when the frame size changes', () => {
    detector.calibrate(frame([0, 0, 0]));

    const rotated = { ...frame([0, 0, 0]), width: HEIGHT, height: WIDTH };

    expect(detector.observe(rotated)).toBeUndefined();
  });

  it.each(BACKGROUNDS)('sees an empty zone, then a card, on %s', (_name, color) => {
    detector.calibrate(frame(color));

    expect(detector.observe(frame(color))?.occupancy).toBe(0);
    const observation = detector.observe(frame(color, ...card()));

    expect(observation?.occupancy).toBeGreaterThan(0.7);
    expect(observation?.coverage).toBeGreaterThanOrEqual(0.5);
  });

  it.each([
    ['left', -0.4, 0],
    ['right', 0.4, 0],
    ['top', 0, -0.4],
    ['bottom', 0, 0.4],
  ])('reports low coverage for a card sticking out on the %s', (_side, shiftX, shiftY) => {
    const wood: Rgb = [200, 160, 110];
    detector.calibrate(frame(wood));

    const observation = detector.observe(frame(wood, ...card(shiftX, shiftY)));

    expect(observation?.occupancy).toBeGreaterThan(0.5);
    expect(observation?.coverage).toBeLessThan(0.5);
  });

  it('accepts a slightly off-center card', () => {
    const wood: Rgb = [200, 160, 110];
    detector.calibrate(frame(wood));

    const observation = detector.observe(frame(wood, ...card(0.08, 0.06)));

    expect(observation?.coverage).toBeGreaterThanOrEqual(0.5);
  });

  it.each([0.7, 1.3])('ignores an overall lighting change (x%s)', (factor) => {
    const wood: Rgb = [180, 140, 100];
    detector.calibrate(frame(wood));

    expect(detector.observe(frame(scale(wood, factor)))?.occupancy).toBe(0);
  });

  it('ignores an object touching only the surroundings', () => {
    detector.calibrate(frame([90, 60, 40]));
    const hand = { x: 0, y: 0, width: WIDTH, height: ZONE.y - 10 };

    const observation = detector.observe(frame([90, 60, 40], [hand, [220, 170, 140]]));

    expect(observation?.occupancy).toBe(0);
  });

  it('reports motion until two images match', () => {
    const empty = frame([12, 12, 12]);
    const withCard = frame([12, 12, 12], ...card());
    detector.calibrate(empty);

    expect(detector.observe(empty)?.motion).toBe(255);
    expect(detector.observe(withCard)?.motion).toBeGreaterThan(50);
    expect(detector.observe(withCard)?.motion).toBe(0);
  });
});
