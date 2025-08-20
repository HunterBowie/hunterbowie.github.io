import { EVAL_BAR_MAX, EVAL_BAR_MIN } from "./constants.js";

// TODO: refactor
export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

// Get the progress bar elements
const evalBarOut = document.getElementById("eval-bar-out");
const evalBarIn = document.getElementById("eval-bar-in");
const evalLabel = document.getElementById("eval-label");

export function setEval(value: number) {
  const min = EVAL_BAR_MIN;
  const max = EVAL_BAR_MAX;
  let percentage = Math.round((1 - (value - min) / (max - min)) * 100);
  if (value > max || percentage < 10) {
    percentage = 10;
  }
  if (value < min || percentage > 90) {
    percentage = 90;
  }
  evalBarIn.style.width = percentage + "%";
  evalBarOut.setAttribute("aria-valuemax", String(max));
  evalBarOut.setAttribute("aria-valuemin", String(min));
  evalBarOut.setAttribute("aria-valuenow", String(value));
  evalLabel.textContent = String(value);

  if (value > 0) {
    evalLabel.textContent = "+" + String(value);
  }
}
