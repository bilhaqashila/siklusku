const RIPPLE_CONTAINER_CLASS = "risa-ripple-container";
const RIPPLE_ELEMENT_CLASS = "risa-ripple";

function createRippleElement(doc) {
  const element = doc.createElement("span");
  element.className = RIPPLE_ELEMENT_CLASS;
  return element;
}

function isPrimaryPointer(event) {
  if (typeof event.button === "number" && event.button !== 0) {
    return false;
  }
  if (event.pointerType === "mouse" || event.pointerType === "pen" || event.pointerType === "touch" || event.pointerType === undefined) {
    return true;
  }
  return false;
}

export function attachRipple(element, { disabled = false } = {}) {
  if (!element) {
    return () => {};
  }

  element.classList.add(RIPPLE_CONTAINER_CLASS);

  if (disabled) {
    return () => {
      element.classList.remove(RIPPLE_CONTAINER_CLASS);
    };
  }

  const doc = element.ownerDocument || (typeof document !== "undefined" ? document : null);
  if (!doc || typeof element.addEventListener !== "function") {
    return () => {
      element.classList.remove(RIPPLE_CONTAINER_CLASS);
    };
  }

  const handlePointerDown = (event) => {
    if (!isPrimaryPointer(event)) {
      return;
    }
    const rect = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
    if (!rect) {
      return;
    }

    const ripple = createRippleElement(doc);
    const size = Math.max(rect.width, rect.height) * 2;
    const offsetX = event.clientX !== undefined ? event.clientX - rect.left : rect.width / 2;
    const offsetY = event.clientY !== undefined ? event.clientY - rect.top : rect.height / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${offsetX}px`;
    ripple.style.top = `${offsetY}px`;

    if (typeof element.appendChild === "function") {
      element.appendChild(ripple);
    }

    let fallbackTimeout = null;
    const removeRipple = () => {
      ripple.removeEventListener("animationend", removeRipple);
      ripple.removeEventListener("animationcancel", removeRipple);
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
      if (typeof ripple.remove === "function") {
        ripple.remove();
      } else if (ripple.parentNode && typeof ripple.parentNode.removeChild === "function") {
        ripple.parentNode.removeChild(ripple);
      }
    };

    ripple.addEventListener("animationend", removeRipple);
    ripple.addEventListener("animationcancel", removeRipple);

    fallbackTimeout = setTimeout(removeRipple, 600);
  };

  element.addEventListener("pointerdown", handlePointerDown);

  return () => {
    element.removeEventListener("pointerdown", handlePointerDown);
    element.classList.remove(RIPPLE_CONTAINER_CLASS);
  };
}

export { RIPPLE_CONTAINER_CLASS, RIPPLE_ELEMENT_CLASS };
