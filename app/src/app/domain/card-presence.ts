/** What one image says about the aiming zone (ADR 013). */
export interface PresenceSample {
  /** Share of the zone that differs from the empty background, from 0 to 1. */
  readonly occupancy: number;
  /** Occupancy of the least occupied of the 3 × 3 blocks of the zone. */
  readonly coverage: number;
  /** Mean difference with the previous image, in color levels from 0 to 255. */
  readonly motion: number;
}

export type PresenceEvent = 'entered' | 'exited';

export interface PresenceSettings {
  readonly enterOccupancy: number;
  /** Lower than `enterOccupancy`, to avoid oscillation. */
  readonly exitOccupancy: number;
  /** Below this coverage, the card is not entirely inside the zone. */
  readonly enterCoverage: number;
  readonly maxStableMotion: number;
  readonly enterFrames: number;
  readonly exitFrames: number;
}

/** TODO(à vérifier): tune on the phone. */
export const DEFAULT_PRESENCE_SETTINGS: PresenceSettings = {
  enterOccupancy: 0.5,
  exitOccupancy: 0.25,
  enterCoverage: 0.5,
  maxStableMotion: 8,
  enterFrames: 4,
  exitFrames: 3,
};

/** Something is in the zone without filling all of it: not countable as a card. */
export function isPartial(
  { occupancy, coverage }: PresenceSample,
  settings: PresenceSettings = DEFAULT_PRESENCE_SETTINGS,
): boolean {
  return occupancy > settings.exitOccupancy && coverage < settings.enterCoverage;
}

/** Turns a sequence of samples into card enter and exit events (ADR 006). */
export class CardPresenceTracker {
  private present = false;
  /** Consecutive samples in favor of changing state. */
  private streak = 0;

  constructor(private readonly settings: PresenceSettings = DEFAULT_PRESENCE_SETTINGS) {}

  get isPresent(): boolean {
    return this.present;
  }

  update({ occupancy, coverage, motion }: PresenceSample): PresenceEvent | undefined {
    const { enterOccupancy, exitOccupancy, enterCoverage, maxStableMotion } = this.settings;
    const { enterFrames, exitFrames } = this.settings;
    const supportsChange = this.present
      ? occupancy <= exitOccupancy
      : occupancy >= enterOccupancy && coverage >= enterCoverage && motion <= maxStableMotion;
    this.streak = supportsChange ? this.streak + 1 : 0;
    if (this.streak < (this.present ? exitFrames : enterFrames)) return undefined;

    this.present = !this.present;
    this.streak = 0;
    return this.present ? 'entered' : 'exited';
  }

  reset(): void {
    this.present = false;
    this.streak = 0;
  }
}
