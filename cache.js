export class TimedCache {
  constructor() {
    this.items = [];
    this.maxLength = process.env.MAX_CACHE_SIZE;
    this.maxLife = process.env.MAX_CACHE_LIFE;
  }

  set(id, value) {
    this.items.push({
      id,
      value,
      maxLife: Date.now() + this.maxLife,
    });

    if (this.items.length > this.maxLength) {
      this.items.shift();
    }
  }

  get(id) {
    const item = this.items.find((item) => item.id === id);
    return (item && item.value) || null;
  }

  purge() {
    const now = Date.now();
    this.items = this.items.filter((item) => item.maxLife > now);
  }

  delete(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
