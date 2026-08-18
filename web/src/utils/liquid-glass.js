/*!
 * liquid-glass.js — Apple-style liquid glass refraction for any DOM element.
 * Based on deepika-builds/liquid-glass & shuding/liquid-glass
 * 
 * Creates a real physical refraction bulge at the rim with chromatic fringe,
 * keeping the interior legible and neutral.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
let svgDefs = null;

// Chromium supports SVG filter in backdrop-filter; Safari & Firefox get frosted fallback.
export const isLiquidGlassSupported = (() => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|Arc/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return false;
  if (typeof CSS === "undefined" || !CSS.supports("backdrop-filter", "url(#test)")) return false;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    return !!c.getContext("2d");
  } catch (_) {
    return false;
  }
})();

function ensureDefs() {
  if (svgDefs && svgDefs.parentNode) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.left = "-9999px";
  svg.style.top = "-9999px";
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

// Generate the displacement map:
// Gradient difference (R for X displacement, B for Y displacement),
// with a blurred inset neutral-gray rounded rectangle so the interior is 100% distortion-free.
function makeMap(w, h, radius, border, mapBlur) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // X gradient (Red)
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);

  // Y gradient (Blue)
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);

  // Inset neutral gray (128,128,128) interior
  ctx.globalCompositeOperation = "source-over";
  const inset = border * Math.min(w, h);
  const innerW = Math.max(0, w - inset * 2);
  const innerH = Math.max(0, h - inset * 2);
  const innerR = Math.max(0, radius - inset);

  ctx.filter = `blur(${mapBlur}px)`;
  ctx.fillStyle = "rgb(128,128,128)";

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(inset, inset, innerW, innerH, innerR);
  } else {
    ctx.rect(inset, inset, innerW, innerH);
  }
  ctx.fill();

  return canvas.toDataURL();
}

/**
 * Apply liquid glass refraction to any element.
 * 
 * @param {HTMLElement} el 
 * @param {Object} [options]
 * @param {number} [options.scale=-112] Refraction strength (-60 subtle to -180 dramatic)
 * @param {number} [options.chroma=6] Chromatic prism fringe (0 to disable)
 * @param {number} [options.border=0.07] Inset border rim fraction
 * @param {number} [options.mapBlur=12] Curvature smoothness of rim bulge
 * @param {number} [options.blur=3] Backdrop blur inside glass
 * @param {number} [options.saturate=1.5] Backdrop saturation boost
 * @param {number|null} [options.radius=null] Border radius (auto-detected from computed style if null)
 * @param {number} [options.fallbackBlur=20] Fallback blur for Firefox/Safari
 */
export function liquidGlass(el, options = {}) {
  if (!el) return { supported: false, refresh: () => {}, destroy: () => {} };

  const {
    scale = -112,
    chroma = 6,
    border = 0.07,
    mapBlur = 12,
    blur = 3,
    saturate = 1.5,
    radius = null,
    fallbackBlur = 20
  } = options;

  const id = "lg-filter-" + (++uid);
  const defs = ensureDefs();
  let filterEl = null;

  function buildFilter() {
    if (!defs) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || el.offsetWidth || 300;
    const h = rect.height || el.offsetHeight || 200;

    let computedRadius = radius;
    if (computedRadius === null) {
      const cr = parseFloat(window.getComputedStyle(el).borderRadius) || 24;
      computedRadius = cr;
    }

    const mapData = makeMap(w, h, computedRadius, border, mapBlur);

    if (filterEl) {
      defs.removeChild(filterEl);
    }

    filterEl = document.createElementNS(SVG_NS, "filter");
    filterEl.setAttribute("id", id);
    filterEl.setAttribute("color-interpolation-filters", "sRGB");
    filterEl.setAttribute("x", "0%");
    filterEl.setAttribute("y", "0%");
    filterEl.setAttribute("width", "100%");
    filterEl.setAttribute("height", "100%");

    const feImage = document.createElementNS(SVG_NS, "feImage");
    feImage.setAttribute("href", mapData);
    feImage.setAttribute("result", "map");
    filterEl.appendChild(feImage);

    if (chroma > 0) {
      // Red channel displacement
      const dispR = document.createElementNS(SVG_NS, "feDisplacementMap");
      dispR.setAttribute("in", "SourceGraphic");
      dispR.setAttribute("in2", "map");
      dispR.setAttribute("scale", String(scale - chroma));
      dispR.setAttribute("xChannelSelector", "R");
      dispR.setAttribute("yChannelSelector", "B");
      dispR.setAttribute("result", "dispR");
      filterEl.appendChild(dispR);

      // Green / main displacement
      const dispG = document.createElementNS(SVG_NS, "feDisplacementMap");
      dispG.setAttribute("in", "SourceGraphic");
      dispG.setAttribute("in2", "map");
      dispG.setAttribute("scale", String(scale));
      dispG.setAttribute("xChannelSelector", "R");
      dispG.setAttribute("yChannelSelector", "B");
      dispG.setAttribute("result", "dispG");
      filterEl.appendChild(dispG);

      // Blue channel displacement
      const dispB = document.createElementNS(SVG_NS, "feDisplacementMap");
      dispB.setAttribute("in", "SourceGraphic");
      dispB.setAttribute("in2", "map");
      dispB.setAttribute("scale", String(scale + chroma));
      dispB.setAttribute("xChannelSelector", "R");
      dispB.setAttribute("yChannelSelector", "B");
      dispB.setAttribute("result", "dispB");
      filterEl.appendChild(dispB);

      // Combine RGB chromatic channels
      const matrixR = document.createElementNS(SVG_NS, "feColorMatrix");
      matrixR.setAttribute("in", "dispR");
      matrixR.setAttribute("type", "matrix");
      matrixR.setAttribute("values", "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0");
      matrixR.setAttribute("result", "rOnly");
      filterEl.appendChild(matrixR);

      const matrixG = document.createElementNS(SVG_NS, "feColorMatrix");
      matrixG.setAttribute("in", "dispG");
      matrixG.setAttribute("type", "matrix");
      matrixG.setAttribute("values", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0");
      matrixG.setAttribute("result", "gOnly");
      filterEl.appendChild(matrixG);

      const matrixB = document.createElementNS(SVG_NS, "feColorMatrix");
      matrixB.setAttribute("in", "dispB");
      matrixB.setAttribute("type", "matrix");
      matrixB.setAttribute("values", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0");
      matrixB.setAttribute("result", "bOnly");
      filterEl.appendChild(matrixB);

      const blendRG = document.createElementNS(SVG_NS, "feBlend");
      blendRG.setAttribute("in", "rOnly");
      blendRG.setAttribute("in2", "gOnly");
      blendRG.setAttribute("mode", "screen");
      blendRG.setAttribute("result", "rg");
      filterEl.appendChild(blendRG);

      const blendRGB = document.createElementNS(SVG_NS, "feBlend");
      blendRGB.setAttribute("in", "rg");
      blendRGB.setAttribute("in2", "bOnly");
      blendRGB.setAttribute("mode", "screen");
      blendRGB.setAttribute("result", "rgb");
      filterEl.appendChild(blendRGB);
    } else {
      const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
      disp.setAttribute("in", "SourceGraphic");
      disp.setAttribute("in2", "map");
      disp.setAttribute("scale", String(scale));
      disp.setAttribute("xChannelSelector", "R");
      disp.setAttribute("yChannelSelector", "B");
      disp.setAttribute("result", "rgb");
      filterEl.appendChild(disp);
    }

    defs.appendChild(filterEl);
  }

  function applyStyles() {
    if (isLiquidGlassSupported) {
      buildFilter();
      const filterVal = `url(#${id}) blur(${blur}px) saturate(${saturate})`;
      el.style.backdropFilter = filterVal;
      el.style.webkitBackdropFilter = filterVal;
    } else {
      const fallback = `blur(${fallbackBlur}px) saturate(${saturate})`;
      el.style.backdropFilter = fallback;
      el.style.webkitBackdropFilter = fallback;
    }
  }

  applyStyles();

  // Handle resize automatically
  let resizeObserver = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      if (isLiquidGlassSupported) {
        buildFilter();
      }
    });
    resizeObserver.observe(el);
  }

  return {
    supported: isLiquidGlassSupported,
    refresh: () => {
      if (isLiquidGlassSupported) buildFilter();
    },
    destroy: () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (filterEl && filterEl.parentNode) {
        filterEl.parentNode.removeChild(filterEl);
      }
      el.style.backdropFilter = "";
      el.style.webkitBackdropFilter = "";
    }
  };
}

export default liquidGlass;
