// TODO: refactor
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
// Get the progress bar elements
const evalBarOut = document.getElementById('eval-bar-out');
const evalBarIn = document.getElementById('eval-bar-in');
export function setEvalBar(min, max, value) {
    const percentage = Math.round((value - min) / (max - min) * 100);
    evalBarIn.style.width = percentage + '%';
    evalBarOut.setAttribute('aria-valuemax', String(max));
    evalBarOut.setAttribute('aria-valuemin', String(min));
    evalBarOut.setAttribute('aria-valuenow', String(value));
    evalBarIn.textContent = String(value);
}
