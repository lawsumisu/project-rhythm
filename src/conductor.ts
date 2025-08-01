export class Metronome {
  private lastBeatUpdate = 0;
  private _bpm: number;
  private getElapsedTime: () => number;

  constructor(bpm: number) {
    this._bpm = bpm;
  }

  public start(getElapsedTime?: () => number): void {
    const startTime = Date.now() / 1000;
    this.lastBeatUpdate = 0;
    this.getElapsedTime =
      getElapsedTime ||
      (() => {
        return Date.now() / 1000 - startTime;
      });
  }

  public update(fn: (beatCount: number) => void) {
    const { _bpm, lastBeatUpdate } = this;
    const secPerBeat = 60 / _bpm;
    const elaspedTime = this.getElapsedTime();
    const beatIndex = Math.floor(elaspedTime / secPerBeat);
    if (beatIndex != lastBeatUpdate) {
      this.lastBeatUpdate = beatIndex;
      fn(beatIndex);
    }
  }

  public getOffsetFromClosestBeat(interval = 4) {
    // Beatmap is action per quarter note
    const { _bpm } = this;
    const secPerBeat = 60 / _bpm;
    const elapsedTime = this.getElapsedTime();
    const beatIndex = Math.floor((elapsedTime / secPerBeat / interval) * 4);
    if (elapsedTime - beatIndex * secPerBeat >= secPerBeat / 2) {
      return Math.round((elapsedTime - (beatIndex + 1) * secPerBeat) * 60);
    } else {
      return Math.round((elapsedTime - beatIndex * secPerBeat) * 60);
    }
  }

  public set bpm(_bpm: number) {
    this._bpm = _bpm;
    const secPerBeat = 60 / _bpm;
    this.lastBeatUpdate = Math.floor(this.getElapsedTime() / secPerBeat);
  }

  public get bpm() {
    return this._bpm;
  }
}
