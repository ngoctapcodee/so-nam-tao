// Each event samples the current pool when its beat is reached.
export class ChainDraw {
  constructor(people, count, sample, coin = Math.random) {
    this.active = [...people];
    this.requested = count;
    this.escaped = new Set();
    this.changed = new Map();
    this.sample = sample;
    this.coin = coin;
    this.events = [];
    this.next = 0;
    const escapes = Math.max(0, people.length - count - 1);
    const beats = Math.min(9, escapes);
    let removed = 0;
    for (let i = 1; i <= beats; i++) {
      const fraction = i / beats;
      const total = Math.min(escapes - (beats - i), Math.ceil(escapes * (1 - (1 - fraction) ** 2)));
      this.events.push({ at: .19 + .46 * fraction ** 1.6, kind: 'escape', count: total - removed });
      removed = total;
    }
    this.events.push({ at: .68, kind: 'sweep' }, { at: .74, kind: 'pull' }, { at: .84, kind: 'seal' });
  }

  advance(progress, onBeat = () => {}) {
    while (this.next < this.events.length && this.events[this.next].at <= progress) {
      const event = this.events[this.next++];
      if (event.kind === 'escape') {
        for (const person of this.sample(this.active, event.count)) this.release(person, event.at);
      } else if (event.kind === 'sweep' && this.escaped.size && this.coin() < .5) {
        const [returning] = this.sample([...this.escaped], 1);
        const [released] = this.sample(this.active, 1);
        this.release(released, event.at);
        this.escaped.delete(returning);
        this.active.push(returning);
        this.changed.set(returning, { at: event.at, returning: true });
        this.returning = returning;
      } else if (event.kind === 'pull') {
        this.finalists = [...this.active];
        [this.pulled, this.reserve] = this.sample(this.active, this.active.length > this.requested ? 2 : 1);
      } else if (event.kind === 'seal') {
        this.slipped = Boolean(this.reserve && this.active.length > this.requested && this.coin() < .5);
        if (this.active.length > this.requested) {
          this.finalEscape = this.slipped ? this.pulled : this.reserve;
          this.release(this.finalEscape, event.at);
        }
        this.winners = [...this.active];
      }
      onBeat(event.kind);
    }
  }

  release(person, at) {
    this.active = this.active.filter(item => item !== person);
    this.escaped.add(person);
    this.changed.set(person, { at, returning: false });
  }
}
