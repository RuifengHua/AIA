import { tsParticles } from "tsparticles";
$.fn.particles = function () {
    const baseId = "tsparticles";
    const init = (options, callback) => {
        this.each((index, element) => {
            if (element.id === undefined) {
                element.id = baseId + Math.floor(Math.random() * 1000);
            }
            tsParticles.load(element.id, options).then(callback);
        });
    };
    const ajax = (jsonUrl, callback) => {
        this.each((index, element) => {
            if (element.id === undefined) {
                element.id = baseId + Math.floor(Math.random() * 1000);
            }
            tsParticles.loadJSON(element.id, jsonUrl).then(callback);
        });
    };
    return { init, ajax };
};
