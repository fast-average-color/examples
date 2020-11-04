export abstract class AmbilightBase {
    constructor(_video: HTMLVideoElement, _container: HTMLElement, _options: any) {};

    abstract onUpdate(): void;
    abstract destroy(): void;
}
