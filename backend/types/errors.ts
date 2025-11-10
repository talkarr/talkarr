export class InvalidOptionsError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'InvalidOptionsError';
    }
}
