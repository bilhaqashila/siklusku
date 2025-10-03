import test from "node:test";
import assert from "node:assert/strict";
import { attachRipple, RIPPLE_CONTAINER_CLASS } from "../src/lib/siklus/microInteractions.js";

function createMockElement() {
  const listeners = new Map();
  const children = [];
  const classSet = new Set();

  const element = {
    children,
    classList: {
      add: (value) => classSet.add(value),
      remove: (value) => classSet.delete(value),
      has: (value) => classSet.has(value)
    },
    style: {},
    ownerDocument: {
      createElement: () => {
        const rippleListeners = new Map();
        const ripple = {
          style: {},
          parentNode: null,
          addEventListener: (type, handler) => rippleListeners.set(type, handler),
          removeEventListener: (type) => rippleListeners.delete(type),
          remove: () => {
            if (ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          },
          trigger: (type) => {
            const handler = rippleListeners.get(type);
            if (handler) {
              handler();
            }
          }
        };
        return ripple;
      }
    },
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
    appendChild: (child) => {
      child.parentNode = element;
      children.push(child);
    },
    removeChild: (child) => {
      const index = children.indexOf(child);
      if (index >= 0) {
        children.splice(index, 1);
      }
      child.parentNode = null;
    },
    getBoundingClientRect: () => ({ width: 120, height: 48, left: 10, top: 20 }),
    listeners,
    trigger: (type, event) => {
      const handler = listeners.get(type);
      if (handler) {
        handler(event);
      }
    }
  };

  return element;
}

test("attachRipple registers ripple and cleans up", () => {
  const element = createMockElement();
  const cleanup = attachRipple(element);

  assert.ok(element.classList.has(RIPPLE_CONTAINER_CLASS));
  assert.ok(element.listeners.has("pointerdown"));

  element.trigger("pointerdown", { button: 0, clientX: 26, clientY: 42 });
  assert.equal(element.children.length, 1);
  const ripple = element.children[0];

  ripple.trigger("animationend");
  assert.equal(element.children.length, 0);

  cleanup();
  assert.equal(element.classList.has(RIPPLE_CONTAINER_CLASS), false);
  assert.equal(element.listeners.has("pointerdown"), false);
});

test("attachRipple respects disabled option", () => {
  const element = createMockElement();
  const cleanup = attachRipple(element, { disabled: true });

  assert.equal(element.listeners.has("pointerdown"), false);
  assert.equal(element.classList.has(RIPPLE_CONTAINER_CLASS), true);

  cleanup();
  assert.equal(element.classList.has(RIPPLE_CONTAINER_CLASS), false);
});
