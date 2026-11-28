import {
  CardPresenceTracker,
  isPartial,
  type PresenceEvent,
  type PresenceSample,
} from './card-presence';

const EMPTY: PresenceSample = { occupancy: 0, coverage: 0, motion: 0 };
const CARD: PresenceSample = { occupancy: 0.9, coverage: 0.8, motion: 1 };
const MOVING: PresenceSample = { occupancy: 0.9, coverage: 0.8, motion: 40 };
const PARTIAL: PresenceSample = { occupancy: 0.65, coverage: 0, motion: 1 };

function feed(tracker: CardPresenceTracker, samples: PresenceSample[]): PresenceEvent[] {
  return samples.flatMap((sample) => tracker.update(sample) ?? []);
}

const repeat = (sample: PresenceSample, times: number): PresenceSample[] =>
  Array.from({ length: times }, () => sample);

describe('CardPresenceTracker', () => {
  let tracker: CardPresenceTracker;

  beforeEach(() => (tracker = new CardPresenceTracker()));

  it('enters once after enough stable frames', () => {
    expect(feed(tracker, repeat(CARD, 3))).toEqual([]);
    expect(feed(tracker, repeat(CARD, 20))).toEqual(['entered']);
  });

  it('does not enter while the image is moving', () => {
    expect(feed(tracker, repeat(MOVING, 20))).toEqual([]);
  });

  it('does not enter with a card partly outside the zone', () => {
    expect(feed(tracker, repeat(PARTIAL, 20))).toEqual([]);
  });

  it('keeps an entered card that is slightly moved afterwards', () => {
    feed(tracker, repeat(CARD, 4));

    expect(feed(tracker, repeat(PARTIAL, 20))).toEqual([]);
    expect(tracker.isPresent).toBe(true);
  });

  it('tells a partial card from an empty zone and from a full card', () => {
    expect([PARTIAL, EMPTY, CARD].map((sample) => isPartial(sample))).toEqual([true, false, false]);
  });

  it('exits once after enough empty frames', () => {
    feed(tracker, repeat(CARD, 4));

    expect(feed(tracker, repeat(EMPTY, 20))).toEqual(['exited']);
  });

  it('tolerates a brief loss', () => {
    feed(tracker, repeat(CARD, 4));

    expect(feed(tracker, [EMPTY, EMPTY, CARD, EMPTY, EMPTY, CARD])).toEqual([]);
    expect(tracker.isPresent).toBe(true);
  });

  it('keeps the card while occupancy stays between the two thresholds', () => {
    feed(tracker, repeat(CARD, 4));

    expect(feed(tracker, repeat({ occupancy: 0.35, coverage: 0, motion: 0 }, 20))).toEqual([]);
  });

  it('counts 50 passes as 50 entries and 50 exits', () => {
    const pass = [
      ...repeat(MOVING, 5),
      ...repeat(CARD, 10),
      ...repeat(MOVING, 3),
      ...repeat(EMPTY, 6),
    ];

    const events = feed(tracker, Array.from({ length: 50 }, () => pass).flat());

    expect(events.filter((event) => event === 'entered')).toHaveLength(50);
    expect(events.filter((event) => event === 'exited')).toHaveLength(50);
  });
});
