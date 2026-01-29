(function () {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) {
        return;
    }

    root.style.webkitTextSizeAdjust = '100%';
    body.style.webkitTextSizeAdjust = '100%';
    root.style.touchAction = 'manipulation';
    body.style.touchAction = 'manipulation';

    const WRAP_ATTR = 'data-fit-viewport-wrapper';
    let wrapper = body.querySelector(`[${WRAP_ATTR}]`);
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.setAttribute(WRAP_ATTR, '');
        while (body.firstChild) {
            wrapper.appendChild(body.firstChild);
        }
        body.appendChild(wrapper);
    }

    wrapper.style.transformOrigin = 'top left';
    wrapper.style.willChange = 'transform';

    const getViewportWidth = () => {
        if (window.visualViewport && window.visualViewport.width) {
            return window.visualViewport.width;
        }
        return root.clientWidth || window.innerWidth || 0;
    };

    const applyFit = () => {
        wrapper.style.transform = 'none';
        wrapper.style.width = '';
        wrapper.style.height = '';

        const layoutWidth = Math.max(wrapper.scrollWidth, wrapper.offsetWidth);
        const layoutHeight = Math.max(wrapper.scrollHeight, wrapper.offsetHeight);
        const viewportWidth = getViewportWidth();

        if (!layoutWidth || !viewportWidth) {
            return;
        }

        const scale = Math.min(1, viewportWidth / layoutWidth);

        wrapper.style.width = `${layoutWidth}px`;
        wrapper.style.height = `${layoutHeight}px`;
        wrapper.style.transform = `scale(${scale})`;
        root.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
    };

    const scheduleFit = () => window.requestAnimationFrame(applyFit);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleFit, { once: true });
    } else {
        scheduleFit();
    }

    window.addEventListener('load', scheduleFit, { once: true });
    window.addEventListener('resize', scheduleFit, { passive: true });
    window.addEventListener('orientationchange', scheduleFit, { passive: true });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleFit, { passive: true });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleFit).catch(() => {});
    }
})();
