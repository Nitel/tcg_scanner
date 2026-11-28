import type { CameraFrame, CardRectangle } from '../application/ports/camera-frame';
import type { CardDetectorPort } from '../application/ports/card-detector.port';
import type { PresenceSample } from '../domain/card-presence';

/** Printed card size is 63 × 88 mm. */
const CARD_RATIO = 63 / 88;
/** Largest share of the frame taken by the zone, so that some background stays around it. */
const ZONE_FILL = 0.7;
const ZONE_COLUMNS = 32;
const ZONE_ROWS = 44;
/** The zone is also checked by blocks, to reject a card partly outside it. */
const BLOCKS_PER_SIDE = 3;
const FRAME_COLUMNS = 18;
const FRAME_ROWS = 32;
/** Pixels averaged per cell and per direction, to dampen sensor noise. */
const SAMPLES = 4;
/** Color difference above which a cell no longer looks like the background. */
const CHANGED_CELL_LEVEL = 24;

/** Centered area with the shape of a card. */
export function aimingZone(frameWidth: number, frameHeight: number): CardRectangle {
  const width = Math.round(Math.min(frameWidth * ZONE_FILL, frameHeight * ZONE_FILL * CARD_RATIO));
  const height = Math.round(width / CARD_RATIO);
  return {
    x: Math.round((frameWidth - width) / 2),
    y: Math.round((frameHeight - height) / 2),
    width,
    height,
  };
}

/** Averages an area into a grid of RGB cells. */
function reduce(
  frame: CameraFrame,
  area: CardRectangle,
  columns: number,
  rows: number,
): Float32Array {
  const cells = new Float32Array(columns * rows * 3);
  const stepX = area.width / (columns * SAMPLES);
  const stepY = area.height / (rows * SAMPLES);
  for (let y = 0; y < rows * SAMPLES; y++) {
    const pixelY = Math.floor(area.y + (y + 0.5) * stepY);
    for (let x = 0; x < columns * SAMPLES; x++) {
      const pixel = (pixelY * frame.width + Math.floor(area.x + (x + 0.5) * stepX)) * 4;
      const cell = (Math.floor(y / SAMPLES) * columns + Math.floor(x / SAMPLES)) * 3;
      for (let channel = 0; channel < 3; channel++) {
        cells[cell + channel]! += frame.pixels[pixel + channel]! / (SAMPLES * SAMPLES);
      }
    }
  }
  return cells;
}

/** Indexes of the frame grid cells lying entirely outside the zone. */
function surroundingCells(frame: CameraFrame, zone: CardRectangle): number[] {
  const cellWidth = frame.width / FRAME_COLUMNS;
  const cellHeight = frame.height / FRAME_ROWS;
  const indexes: number[] = [];
  for (let row = 0; row < FRAME_ROWS; row++) {
    for (let column = 0; column < FRAME_COLUMNS; column++) {
      const outside =
        (column + 1) * cellWidth <= zone.x ||
        column * cellWidth >= zone.x + zone.width ||
        (row + 1) * cellHeight <= zone.y ||
        row * cellHeight >= zone.y + zone.height;
      if (outside) indexes.push(row * FRAME_COLUMNS + column);
    }
  }
  return indexes;
}

/** Block of a zone grid cell, row by row. */
function blockOf(cell: number): number {
  const column = Math.floor(((cell % ZONE_COLUMNS) * BLOCKS_PER_SIDE) / ZONE_COLUMNS);
  const row = Math.floor((Math.floor(cell / ZONE_COLUMNS) * BLOCKS_PER_SIDE) / ZONE_ROWS);
  return row * BLOCKS_PER_SIDE + column;
}

function median(values: number[]): number {
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 1;
}

interface Background {
  readonly width: number;
  readonly height: number;
  readonly zone: CardRectangle;
  readonly zoneCells: Float32Array;
  readonly frameCells: Float32Array;
  readonly surrounding: readonly number[];
}

/** `CardDetectorPort` comparing a fixed zone with a calibrated background (ADR 013). */
export class ZoneCardDetectorAdapter implements CardDetectorPort {
  private background: Background | undefined;
  private previous: Float32Array | undefined;

  zoneFor(frameWidth: number, frameHeight: number): CardRectangle {
    return aimingZone(frameWidth, frameHeight);
  }

  calibrate(frame: CameraFrame): void {
    const zone = aimingZone(frame.width, frame.height);
    this.background = {
      width: frame.width,
      height: frame.height,
      zone,
      zoneCells: reduce(frame, zone, ZONE_COLUMNS, ZONE_ROWS),
      frameCells: this.reduceFrame(frame),
      surrounding: surroundingCells(frame, zone),
    };
    this.previous = undefined;
  }

  observe(frame: CameraFrame): PresenceSample | undefined {
    const background = this.background;
    if (!background || background.width !== frame.width || background.height !== frame.height) {
      return undefined;
    }
    const cells = reduce(frame, background.zone, ZONE_COLUMNS, ZONE_ROWS);
    const gains = this.lightingGains(frame, background);

    const changedPerBlock = new Array<number>(BLOCKS_PER_SIDE ** 2).fill(0);
    const cellsPerBlock = new Array<number>(BLOCKS_PER_SIDE ** 2).fill(0);
    let changed = 0;
    let motion = 0;
    for (let cell = 0; cell < cells.length; cell += 3) {
      let difference = 0;
      for (let channel = 0; channel < 3; channel++) {
        const value = cells[cell + channel]!;
        const expected = Math.min(255, background.zoneCells[cell + channel]! * gains[channel]!);
        difference = Math.max(difference, Math.abs(value - expected));
        motion += Math.abs(value - (this.previous?.[cell + channel] ?? value));
      }
      const block = blockOf(cell / 3);
      cellsPerBlock[block]!++;
      if (difference > CHANGED_CELL_LEVEL) {
        changed++;
        changedPerBlock[block]!++;
      }
    }
    // Without a previous image, stability cannot be claimed.
    const meanMotion = this.previous ? motion / cells.length : 255;
    this.previous = cells;

    return {
      occupancy: changed / (cells.length / 3),
      coverage: Math.min(...changedPerBlock.map((count, block) => count / cellsPerBlock[block]!)),
      motion: meanMotion,
    };
  }

  private reduceFrame(frame: CameraFrame): Float32Array {
    const area = { x: 0, y: 0, width: frame.width, height: frame.height };
    return reduce(frame, area, FRAME_COLUMNS, FRAME_ROWS);
  }

  /**
   * Per channel lighting change since calibration (exposure, white balance), measured around
   * the zone. The median ignores a hand or an object covering part of the surroundings.
   */
  private lightingGains(frame: CameraFrame, background: Background): number[] {
    const cells = this.reduceFrame(frame);
    return [0, 1, 2].map((channel) => {
      const ratios = background.surrounding.map((index) => {
        const offset = index * 3 + channel;
        // The offset of 8 levels keeps ratios steady on very dark backgrounds.
        return (cells[offset]! + 8) / (background.frameCells[offset]! + 8);
      });
      return Math.min(2, Math.max(0.5, median(ratios)));
    });
  }
}
