import type { ISourceOptions, Container } from "tsparticles";
declare type ParticlesResult = {
    init: (options: ISourceOptions, callback: (container: Container | undefined) => Promise<void>) => void;
    ajax: (jsonUrl: string, callback: (container: Container | undefined) => Promise<void>) => void;
};
export declare type IParticlesProps = ISourceOptions;
declare global {
    interface JQuery {
        particles: () => ParticlesResult;
    }
}
export {};
