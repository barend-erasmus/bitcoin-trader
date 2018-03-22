export class Queue<T> {

    private data: T[] = [];

    constructor(
        private size: number,
    ) {

    }

    public dequeue(item: T): T {
        return this.data.splice(0, 1)[0];
    }

    public enqueue(item: T): void {
        if (this.data.length === this.size) {
            this.data.splice(0, 1);
        }

        this.data.push(item);
    }

    public getLast(): T {
        return this.data[this.data.length - 1];
    }

    public isFull(): boolean {
        return this.data.length === this.size;
    }

    public toArray(): T[] {
        return this.data;
    }
}
