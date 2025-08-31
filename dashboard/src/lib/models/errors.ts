export class WebsocketError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebsocketError';
    }
}

export class FetchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FetchError';
    }
}
