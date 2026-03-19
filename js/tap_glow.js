(function () {
    var activeClass = 'tap-active';
    var interactiveSelector = 'a, button, [role="button"]';
    var clearDelayMs = 180;
    var currentActiveElement = null;

    function getInteractiveElement(target) {
        if (!target || !target.closest) {
            return null;
        }

        return target.closest(interactiveSelector);
    }

    function clearTapGlow(element) {
        if (!element) {
            return;
        }

        if (element.__tapGlowTimer) {
            window.clearTimeout(element.__tapGlowTimer);
            element.__tapGlowTimer = null;
        }

        element.classList.remove(activeClass);
    }

    function applyTapGlow(element) {
        if (!element) {
            return;
        }

        clearTapGlow(element);
        element.classList.add(activeClass);
        currentActiveElement = element;
    }

    function scheduleClearTapGlow(element, delay) {
        if (!element) {
            return;
        }

        if (element.__tapGlowTimer) {
            window.clearTimeout(element.__tapGlowTimer);
        }

        element.__tapGlowTimer = window.setTimeout(function () {
            clearTapGlow(element);

            if (currentActiveElement === element) {
                currentActiveElement = null;
            }
        }, delay);
    }

    function handlePressStart(target) {
        applyTapGlow(getInteractiveElement(target));
    }

    function handlePressEnd(target) {
        var element = getInteractiveElement(target) || currentActiveElement;

        if (!element) {
            return;
        }

        applyTapGlow(element);
        scheduleClearTapGlow(element, clearDelayMs);
    }

    function handlePressCancel() {
        clearTapGlow(currentActiveElement);
        currentActiveElement = null;
    }

    if (window.PointerEvent) {
        document.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return;
            }

            handlePressStart(event.target);
        }, true);

        document.addEventListener('pointerup', function (event) {
            handlePressEnd(event.target);
        }, true);

        document.addEventListener('pointercancel', function () {
            handlePressCancel();
        }, true);
    } else {
        document.addEventListener('touchstart', function (event) {
            handlePressStart(event.target);
        }, true);

        document.addEventListener('touchend', function (event) {
            handlePressEnd(event.target);
        }, true);

        document.addEventListener('touchcancel', function () {
            handlePressCancel();
        }, true);

        document.addEventListener('mousedown', function (event) {
            if (event.button !== 0) {
                return;
            }

            handlePressStart(event.target);
        }, true);

        document.addEventListener('mouseup', function (event) {
            if (event.button !== 0) {
                return;
            }

            handlePressEnd(event.target);
        }, true);
    }

    document.addEventListener('click', function (event) {
        var element = getInteractiveElement(event.target);

        if (!element) {
            return;
        }

        applyTapGlow(element);
        scheduleClearTapGlow(element, clearDelayMs);
    }, true);

    window.addEventListener('pagehide', function () {
        clearTapGlow(currentActiveElement);
        currentActiveElement = null;
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            clearTapGlow(currentActiveElement);
            currentActiveElement = null;
        }
    });
}());
