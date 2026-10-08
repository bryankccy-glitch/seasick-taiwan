import * as THREE from "three";
import { normalizeOceanConditions, type OceanConditions } from "@/lib/ocean-conditions";
import { oceanFragmentShader, oceanVertexShader } from "./ocean-shaders";

type DeviceNavigator = Navigator & { deviceMemory?: number };
type Quality = "desktop" | "mobile" | "low";

/** Owns one draw call. JS updates uniforms; all particle displacement stays on the GPU. */
export function createOceanScene(host: HTMLDivElement, surface: HTMLElement, initial: OceanConditions) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "ocean-particle-canvas";
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(49, 1, .1, 110);
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const coarseQuery = matchMedia("(pointer: coarse)");
  const weakDevice = (navigator.hardwareConcurrency || 8) <= 4 ||
    ((navigator as DeviceNavigator).deviceMemory ?? 8) <= 4;
  let reducedMotion = motionQuery.matches;
  let quality: Quality = "desktop";
  let degradedQuality: Quality | null = null;
  let width = 1;
  let height = 1;
  let bounds = surface.getBoundingClientRect();
  let canvasBounds = host.getBoundingClientRect();
  let boundsDirty = true;
  let scrollTarget = 0;
  let scroll = 0;
  let frame = 0;
  let disposed = false;
  let lost = false;
  let inViewport = true;
  let previousTime = 0;
  let elapsed = 0;
  let phase = 0;
  let lastRender = 0;
  let sampleSeconds = 0;
  let sampleFrames = 0;
  let transition = 0;
  let transitionTarget = 0;
  let rippleIndex = 0;
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointer = new THREE.Vector2(0, 0);
  const worldPointer = new THREE.Vector3(0, 0, -5);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const lookTarget = new THREE.Vector3(0, 0, -7);
  const current = normalizeOceanConditions(initial);
  let target = { ...current };
  let direction = current.windDirection * Math.PI / 180;
  const ripples = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -100, 0));
  const uniforms = {
    uTime: { value: 0 },
    uPhase: { value: 0 },
    uWaveHeight: { value: current.waveHeight },
    uTurbulence: { value: current.turbulence },
    uWind: { value: new THREE.Vector2(Math.cos(direction), Math.sin(direction)) },
    uScroll: { value: 0 },
    uTransition: { value: 0 },
    uRisk: { value: current.riskLevel },
    uLight: { value: document.documentElement.dataset.theme === "light" ? 1 : 0 },
    uDpr: { value: 1 },
    uRipples: { value: ripples },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: oceanVertexShader,
    fragmentShader: oceanFragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new THREE.Points(new THREE.BufferGeometry(), material);
  // Vertex displacement happens in the shader, outside the initial flat bounds.
  points.frustumCulled = false;
  scene.add(points);

  function configureQuality(next: Quality) {
    if (points.geometry.getAttribute("position") && next === quality) return;
    quality = next;
    const [columns, rows] = quality === "desktop" ? [288, 180] : quality === "mobile" ? [144, 96] : [96, 72];
    const positions = new Float32Array(columns * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = (row * columns + col) * 3;
        positions[index] = (col / (columns - 1) - .5) * 48;
        positions[index + 2] = (row / (rows - 1) - .5) * 44 - 6;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    points.geometry.dispose();
    points.geometry = geometry;
    material.defines = quality === "desktop" ? { RIPPLE_COUNT: 8 } : { RIPPLE_COUNT: 2, LOW_QUALITY: 1 };
    material.needsUpdate = true;
    updatePixelRatio();
    renderer.setSize(width, height, false);
    ripples.forEach((ripple) => ripple.set(0, 0, -100, 0));
    rippleIndex = 0;
    host.dataset.quality = quality;
    host.dataset.particles = String(columns * rows);
  }

  function updatePixelRatio() {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality === "desktop" ? 1.5 : quality === "mobile" ? 1 : .8));
    uniforms.uDpr.value = renderer.getPixelRatio();
  }

  function updateBounds() {
    if (!boundsDirty) return;
    bounds = surface.getBoundingClientRect();
    canvasBounds = host.getBoundingClientRect();
    scrollTarget = THREE.MathUtils.clamp(-bounds.top / Math.max(1, bounds.height * .8), 0, 1);
    boundsDirty = false;
  }

  function draw(dt: number) {
    updateBounds();
    const blend = reducedMotion ? 1 : 1 - Math.exp(-dt * 2.2);
    current.waveHeight = THREE.MathUtils.lerp(current.waveHeight, target.waveHeight, blend);
    current.waveSpeed = THREE.MathUtils.lerp(current.waveSpeed, target.waveSpeed, blend);
    current.turbulence = THREE.MathUtils.lerp(current.turbulence, target.turbulence, blend);
    current.riskLevel = THREE.MathUtils.lerp(current.riskLevel, target.riskLevel, blend);
    const targetDirection = target.windDirection * Math.PI / 180;
    direction += Math.atan2(Math.sin(targetDirection - direction), Math.cos(targetDirection - direction)) * blend;
    scroll = THREE.MathUtils.lerp(scroll, scrollTarget, reducedMotion ? 1 : 1 - Math.exp(-dt * 5));
    transition = THREE.MathUtils.lerp(transition, transitionTarget, blend);
    phase += reducedMotion ? 0 : dt * current.waveSpeed;
    pointer.lerp(pointerTarget, 1 - Math.exp(-dt * 10));
    const mobile = quality !== "desktop";
    const parallax = reducedMotion || mobile ? 0 : 1;
    camera.position.set(pointer.x * .65 * parallax + transition * .45, 15 + scroll * 3 + pointer.y * .35 * parallax, 24 + scroll * 2);
    lookTarget.set(pointer.x * .3 * parallax, 0, -7 - transition * 1.2);
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();
    uniforms.uTime.value = elapsed;
    uniforms.uPhase.value = phase;
    uniforms.uWaveHeight.value = current.waveHeight;
    uniforms.uTurbulence.value = current.turbulence;
    uniforms.uWind.value.set(Math.cos(direction), Math.sin(direction));
    uniforms.uScroll.value = scroll;
    uniforms.uTransition.value = reducedMotion ? 0 : transition;
    uniforms.uRisk.value = current.riskLevel;
    host.style.opacity = String(1 - scroll);
    renderer.render(scene, camera);
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || lost || document.hidden || !inViewport || reducedMotion) return;
    const dt = previousTime ? Math.min((now - previousTime) / 1000, .1) : 1 / 60;
    previousTime = now;
    elapsed += dt;
    const renderInterval = quality === "desktop" ? 0 : 1 / 30;
    if (elapsed - lastRender >= renderInterval) {
      draw(Math.min(.1, elapsed - lastRender));
      lastRender = elapsed;
    }
    sampleSeconds += dt;
    sampleFrames++;
    if (sampleSeconds > 3) {
      if (sampleFrames / sampleSeconds < (quality === "desktop" ? 24 : 20) && quality !== "low") {
        // A stable 30fps display is healthy; reduce density one tier at a time.
        degradedQuality = quality === "desktop" ? "mobile" : "low";
        configureQuality(degradedQuality);
      }
      sampleSeconds = 0;
      sampleFrames = 0;
    }
    if (!lost) frame = requestAnimationFrame(tick);
  }

  function resume() {
    if (disposed || lost || document.hidden || !inViewport) return;
    previousTime = 0;
    if (reducedMotion) draw(1);
    else if (!frame) frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    configureQuality(degradedQuality === "low" || weakDevice ? "low" :
      degradedQuality === "mobile" || width < 720 || coarseQuery.matches ? "mobile" : "desktop");
    updatePixelRatio();
    renderer.setSize(width, height, false);
    boundsDirty = true;
    resume();
  }
  function onPointer(event: PointerEvent) {
    if (reducedMotion) return;
    updateBounds();
    pointerTarget.set((event.clientX - canvasBounds.left) / Math.max(1, canvasBounds.width) * 2 - 1,
      -(event.clientY - canvasBounds.top) / Math.max(1, canvasBounds.height) * 2 + 1);
  }
  function leave() { pointerTarget.set(0, 0); }
  function onClick(event: MouseEvent) {
    if (reducedMotion || lost || disposed || event.button !== 0 || event.detail === 0) return;
    // UI clicks and keyboard activation keep their existing behavior without water effects.
    if (event.target instanceof Element && event.target.closest(
      'button, input, select, textarea, a, [role="button"], [role="combobox"], [role="option"]',
    )) return;
    updateBounds();
    const clickPoint = new THREE.Vector2(
      (event.clientX - canvasBounds.left) / Math.max(1, canvasBounds.width) * 2 - 1,
      -(event.clientY - canvasBounds.top) / Math.max(1, canvasBounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(clickPoint, camera);
    if (!raycaster.ray.intersectPlane(plane, worldPointer) ||
        Math.abs(worldPointer.x) >= 24 || Math.abs(worldPointer.z + 6) >= 22) return;
    const mobile = quality !== "desktop";
    ripples[rippleIndex % (mobile ? 2 : 8)].set(worldPointer.x, worldPointer.z, elapsed, mobile ? .65 : 1);
    rippleIndex++;
  }
  function onScroll() { boundsDirty = true; if (reducedMotion) resume(); }
  function onVisibility() { if (document.hidden) stop(); else { boundsDirty = true; resume(); } }
  function onMotionChange() {
    reducedMotion = motionQuery.matches;
    host.dataset.motion = reducedMotion ? "reduced" : "full";
    leave();
    pointer.set(0, 0);
    pointerTarget.set(0, 0);
    ripples.forEach((ripple) => ripple.set(0, 0, -100, 0));
    stop();
    resume();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    lost = true;
    host.dataset.mode = "fallback";
    stop();
  }
  function onContextRestored() {
    lost = false;
    host.dataset.mode = "webgl";
    resize();
  }
  renderer.debug.onShaderError = (gl, program, vertexShader, fragmentShader) => {
    console.warn("Ocean shader fallback:", gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertexShader), gl.getShaderInfoLog(fragmentShader));
    lost = true;
    host.dataset.mode = "fallback";
    stop();
  };
  const themeObserver = new MutationObserver(() => {
    uniforms.uLight.value = document.documentElement.dataset.theme === "light" ? 1 : 0;
    if (reducedMotion) resume();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    if (inViewport) resume(); else stop();
  });
  resizeObserver.observe(host);
  intersectionObserver.observe(surface);
  surface.addEventListener("pointermove", onPointer, { passive: true });
  surface.addEventListener("click", onClick, { passive: true });
  surface.addEventListener("pointerleave", leave, { passive: true });
  surface.addEventListener("pointerup", leave, { passive: true });
  surface.addEventListener("pointercancel", leave, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  motionQuery.addEventListener("change", onMotionChange);
  coarseQuery.addEventListener("change", resize);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
  host.dataset.mode = "webgl";
  host.dataset.motion = reducedMotion ? "reduced" : "full";
  resize();

  return {
    setOceanConditions(input: Partial<OceanConditions>) {
      target = normalizeOceanConditions({ ...target, ...input });
      if (reducedMotion) resume();
    },
    setTransition(active: boolean) { transitionTarget = active ? 1 : 0; },
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
      surface.removeEventListener("pointermove", onPointer);
      surface.removeEventListener("click", onClick);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointerup", leave);
      surface.removeEventListener("pointercancel", leave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      coarseQuery.removeEventListener("change", resize);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      points.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export type OceanScene = ReturnType<typeof createOceanScene>;
