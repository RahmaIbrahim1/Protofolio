(() => {
  const body = document.body;
  const bootScreen = document.getElementById('bootScreen');
  const skipButton = document.getElementById('skipInstall');
  const progress = document.querySelector('.progress-track');
  const progressFill = document.querySelector('.progress-fill');
  const timeOutput = document.getElementById('antwerpTime');
  const introIndex = document.querySelector('.intro-index');
  const introNumber = introIndex.querySelector('b');
  const introTitle = [...introIndex.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  const eraToggle = document.getElementById('eraToggle');
  const eraLabel = document.getElementById('eraLabel');
  const menuToggle = document.getElementById('menuToggle');
  const menuPanel = document.getElementById('menuPanel');
  const keyboardWrap = document.getElementById('keyboardWrap');
  const keyboard = document.querySelector('.macro-keyboard');
  const studioSection = document.querySelector('.studio-section');
  const approachSection = document.querySelector('.approach-section');
  const designWord = document.querySelector('.design-word');
  const developmentWord = document.querySelector('.development-word');
  const macintoshWrap = document.querySelector('.macintosh-wrap');
  const macRedImage = document.querySelector('.macintosh-image--red');
  const macBeigeImage = document.querySelector('.macintosh-image--beige');
  const approachStepNavItems = [...document.querySelectorAll('[data-approach-nav]')];
  const approachSteps = [...document.querySelectorAll('[data-approach-step]')];
  const approachMarker = document.querySelector('.approach-marker');
  const paperFade = document.querySelector('.paperfade');
  const studioStage = document.querySelector('.studio-stage');
  const studioStatement = document.getElementById('studioStatement');
  const studioFigure = document.querySelector('.studio-figure');
  const studioImage = document.querySelector('.studio-image-frame img');
  const photoFragments = document.querySelector('.photo-fragments');
  const keys = [...document.querySelectorAll('.key')];
  const screenReadout = document.getElementById('screenReadout');
  const keyByCode = new Map(keys.map((key, index) => [key.dataset.code, { key, index }]));
  const keyAliases = new Map([
    ['Digit7', 0], ['Digit8', 1], ['Digit9', 2], ['Digit0', 5],
    ['KeyZ', 12], ['KeyX', 13], ['KeyC', 14], ['KeyV', 15], ['KeyB', 16], ['KeyN', 17], ['KeyM', 17],
    ['Space', 15], ['Backspace', 17], ['Tab', 6], ['CapsLock', 12],
    ['ShiftLeft', 12], ['ControlLeft', 12], ['AltLeft', 13],
    ['ShiftRight', 17], ['ControlRight', 17], ['AltRight', 16],
    ['Backquote', 0], ['Minus', 5], ['Equal', 5], ['BracketLeft', 10], ['BracketRight', 11], ['Backslash', 11],
    ['Semicolon', 17], ['Quote', 17], ['Comma', 15], ['Period', 16], ['Slash', 17],
    ['ArrowLeft', 12], ['ArrowDown', 14], ['ArrowUp', 15], ['ArrowRight', 17],
    ['Numpad0', 5], ['Numpad1', 0], ['Numpad2', 1], ['Numpad3', 2], ['Numpad4', 3],
    ['Numpad5', 4], ['Numpad6', 5], ['Numpad7', 0], ['Numpad8', 1], ['Numpad9', 2],
    ['NumpadEnter', 17], ['NumpadAdd', 11], ['NumpadSubtract', 5], ['NumpadMultiply', 2], ['NumpadDivide', 3], ['NumpadDecimal', 16],
    ['F1', 0], ['F2', 1], ['F3', 2], ['F4', 3], ['F5', 4], ['F6', 5], ['F7', 5], ['F8', 5],
    ['F9', 5], ['F10', 5], ['F11', 5], ['F12', 5]
  ]);
  const heldCodes = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let installTimer;
  let readoutTimer;
  let rafId = 0;
  let pointer = { x: 0, y: 0 };
  let studioFrame = 0;

  function finishInstall() {
    if (body.classList.contains('is-ready')) return;
    window.clearTimeout(installTimer);
    progress.setAttribute('aria-valuenow', '100');
    progressFill.style.width = '100%';
    bootScreen.classList.add('is-leaving');
    body.classList.add('is-ready');
    window.setTimeout(() => bootScreen.remove(), reducedMotion ? 30 : 800);
  }

  installTimer = window.setTimeout(finishInstall, reducedMotion ? 1000 : 4700);
  skipButton.addEventListener('click', finishInstall);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !body.classList.contains('is-ready')) finishInstall();
  });
  progressFill.addEventListener('animationend', () => progress.setAttribute('aria-valuenow', '100'));

  function updateClock() {
    timeOutput.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Brussels', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 30000);

  eraToggle.addEventListener('click', () => {
    const retro = body.classList.toggle('is-retro');
    eraToggle.setAttribute('aria-pressed', String(retro));
    eraLabel.textContent = retro ? 'Forward to 2026' : 'Back to 1984';
  });

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuPanel.hidden = !open;
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menuPanel.hidden && !menuPanel.contains(event.target) && !menuToggle.contains(event.target)) {
      menuPanel.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menuPanel.hidden) {
      menuPanel.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  });

  function presentKey(label) {
    const printable = label === ' ' ? 'SPACE' : String(label || 'KEY').toUpperCase();
    screenReadout.textContent = `${printable.slice(0, 10)} / DOWN_`;
    screenReadout.setAttribute('aria-label', `${printable} pressed`);
    window.clearTimeout(readoutTimer);
    readoutTimer = window.setTimeout(() => {
      screenReadout.textContent = 'READY_';
      screenReadout.setAttribute('aria-label', 'Ready');
    }, 650);
  }

  function setKeyDown(key, code, label) {
    if (!key) return;
    heldCodes.set(code, key);
    key.classList.add('is-pressed');
    keyboardWrap.classList.add('is-active');
    presentKey(label);
  }

  function setKeyUp(key, code) {
    if (!key) return;
    heldCodes.delete(code);
    if (![...heldCodes.values()].includes(key)) key.classList.remove('is-pressed');
    if (!heldCodes.size) keyboardWrap.classList.remove('is-active');
  }

  function indexForUnmapped(code) {
    // The keypad is a compact 18-key device. Other physical keys route into
    // its 18 tactile switches while the screen reports the exact input.
    let hash = 0;
    for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
    return hash % keys.length;
  }

  function mappedKey(event) {
    const match = keyByCode.get(event.code);
    if (match) return match.key;
    if (keyAliases.has(event.code)) return keys[keyAliases.get(event.code)];
    return keys[indexForUnmapped(event.code || event.key || 'Key')];
  }

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === ' ') event.preventDefault();
    const key = mappedKey(event);
    const code = event.code || event.key;
    if (!event.repeat || !heldCodes.has(code)) setKeyDown(key, code, event.key);
    else {
      // Repeated keydown keeps the same switch depressed and advances its
      // spring return timing without adding a second held-state.
      key.classList.remove('is-pressed');
      void key.offsetWidth;
      key.classList.add('is-pressed');
      presentKey(event.key);
    }
  });
  document.addEventListener('keyup', (event) => setKeyUp(mappedKey(event), event.code || event.key));
  window.addEventListener('blur', () => {
    heldCodes.forEach((key, code) => {
      setKeyUp(key, code);
    });
  });

  keys.forEach((key) => {
    key.addEventListener('pointerenter', () => key.classList.add('is-hovered'));
    key.addEventListener('pointerleave', () => key.classList.remove('is-hovered'));
    key.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      key.setPointerCapture(event.pointerId);
      setKeyDown(key, `pointer:${key.dataset.code}`, key.dataset.key);
    });
    key.addEventListener('pointerup', () => setKeyUp(key, `pointer:${key.dataset.code}`));
    key.addEventListener('pointercancel', () => setKeyUp(key, `pointer:${key.dataset.code}`));
    key.addEventListener('click', () => {
      // Also gives touch and keyboard activation the same visible switch response.
      const code = `click:${key.dataset.code}`;
      setKeyDown(key, code, key.dataset.key);
      window.setTimeout(() => setKeyUp(key, code), 95);
    });
  });

  keyboard.addEventListener('pointermove', (event) => {
    const rect = keyboard.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - .5;
    pointer.y = (event.clientY - rect.top) / rect.height - .5;
    if (rafId || reducedMotion) return;
    rafId = window.requestAnimationFrame(() => {
      keyboard.style.setProperty('--tilt-x', `${pointer.x * -2.4}deg`);
      keyboard.style.setProperty('--tilt-y', `${pointer.y * -2.2}deg`);
      rafId = 0;
    });
  });
  keyboard.addEventListener('pointerleave', () => {
    keyboard.style.setProperty('--tilt-x', '0deg');
    keyboard.style.setProperty('--tilt-y', '0deg');
  });

  const studioWords = studioStatement.textContent.trim().split(/\s+/);
  studioStatement.replaceChildren();
  const wordNodes = studioWords.map((word, index) => {
    const node = document.createElement('span');
    node.textContent = word;
    if (index >= studioWords.length - 5) node.classList.add('is-finish');
    studioStatement.append(node, document.createTextNode(' '));
    return node;
  });

  const fragmentCount = 16;
  const verticalOffsets = [-0.4, 0.22, -0.26, 0.34, -0.16, 0.3, -0.38, 0.18, 0.4, -0.22, 0.28, -0.36, 0.18, -0.3, 0.34, -0.2];
  const photoPieces = Array.from({ length: fragmentCount }, (_, index) => {
    const piece = document.createElement('i');
    piece.style.left = `${(index / fragmentCount) * 100}%`;
    piece.style.width = `${100 / fragmentCount}%`;
    piece.style.backgroundImage = `url("${studioImage.currentSrc || studioImage.src}")`;
    piece.style.backgroundSize = `${fragmentCount * 100}% 100%`;
    piece.style.backgroundPosition = `${(index / (fragmentCount - 1)) * 100}% center`;
    photoFragments.append(piece);
    return piece;
  });

  function updateStudio() {
    studioFrame = 0;
    const rect = studioSection.getBoundingClientRect();
    const active = rect.top < window.innerHeight && rect.bottom > 76;
    const approachRect = approachSection.getBoundingClientRect();
    const approachActive = approachRect.top < window.innerHeight && approachRect.bottom > 76;
    body.classList.toggle('is-studio-active', active);
    body.classList.toggle('is-approach-active', approachActive);
    introNumber.textContent = approachActive ? '02' : active ? '01' : '00';
    introTitle.textContent = approachActive ? ' Approach' : active ? ' Studio' : ' Intro';

    const travel = Math.max(1, studioSection.offsetHeight - studioStage.getBoundingClientRect().height);
    const sectionTop = rect.top + window.scrollY;
    const progress = Math.max(0, Math.min(1, window.scrollY / (sectionTop + travel)));
    const reveal = progress * (wordNodes.length + 2);
    wordNodes.forEach((word, index) => {
      word.classList.toggle('is-lit', index + 0.45 < reveal);
      word.classList.toggle('is-next', index >= reveal && index < reveal + 1.4);
    });

    const frameHeight = studioImage.parentElement.getBoundingClientRect().height;
    studioImage.style.opacity = `${0.16 + 0.84 * Math.pow(progress, 2.2)}`;
    photoPieces.forEach((piece, index) => {
      const stagger = (index / (fragmentCount - 1)) * 0.26;
      const local = Math.max(0, Math.min(1, (progress - stagger) / 0.56));
      const settle = local * local * (3 - 2 * local);
      const offsetY = verticalOffsets[index] * frameHeight * (1 - settle);
      piece.style.transform = `translate3d(0, ${offsetY}px, 0)`;
      piece.style.opacity = String(1 - Math.max(0, (progress - 0.92) / 0.08));
    });
    studioFigure.classList.toggle('is-revealed', progress > 0.94);
  }

  function requestStudioUpdate() {
    if (studioFrame) return;
    studioFrame = window.requestAnimationFrame(updateStudio);
  }

  const approachAnimation = {
    initialScale: 0.86,
    settledScale: 1,
    entranceDuration: 1,
    stepsStart: 1.55,
    stepSpacing: 0.9,
    zoomStart: 5.25,
    zoomDuration: 1.35,
    zoomOverscan: 1.04,
    screenWidthRatio: 0.27,
    screenHeightRatio: 0.29,
    screenCenterYRatio: 0.38,
    scrollViewportMultiplier: 5.2
  };
  const approachStepStartTimes = approachSteps.map((_, index) => approachAnimation.stepsStart + index * approachAnimation.stepSpacing);

  function waitForImage(image) {
    if (!image) return Promise.resolve(false);
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    if (typeof image.decode === 'function') {
      return image.decode().then(() => image.naturalWidth > 0).catch(() => false);
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        resolve(image.naturalWidth > 0);
      };
      image.addEventListener('load', finish);
      image.addEventListener('error', finish);
      if (image.complete) finish();
    });
  }

  function setActiveApproachStep(timelineTime) {
    let activeIndex = 0;
    if (timelineTime >= approachAnimation.zoomStart) activeIndex = -1;
    else approachStepStartTimes.forEach((startTime, index) => {
      if (timelineTime >= startTime) activeIndex = index;
    });

    approachStepNavItems.forEach((item, index) => {
      const active = index === activeIndex;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    approachSteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === activeIndex);
      step.setAttribute('aria-hidden', String(index !== activeIndex));
    });
  }

  function getMacintoshZoomTarget() {
    const width = macintoshWrap.offsetWidth;
    const height = macintoshWrap.offsetHeight;
    const imageWidth = macBeigeImage.naturalWidth || macRedImage.naturalWidth || 1536;
    const imageHeight = macBeigeImage.naturalHeight || macRedImage.naturalHeight || 1024;
    const containScale = Math.min(width / imageWidth, height / imageHeight);
    const contentWidth = imageWidth * containScale;
    const contentHeight = imageHeight * containScale;
    const contentTop = (height - contentHeight) / 2;
    const screenWidth = contentWidth * approachAnimation.screenWidthRatio;
    const screenHeight = contentHeight * approachAnimation.screenHeightRatio;
    const screenCenterX = contentWidth / 2;
    const screenCenterY = contentTop + contentHeight * approachAnimation.screenCenterYRatio;
    const targetScale = Math.max(window.innerWidth / screenWidth, window.innerHeight / screenHeight) * approachAnimation.zoomOverscan;
    const wrapCenterX = macintoshWrap.offsetLeft;
    const wrapCenterY = macintoshWrap.offsetTop;

    return {
      scale: targetScale,
      x: window.innerWidth / 2 - wrapCenterX - (screenCenterX - width / 2) * targetScale,
      y: window.innerHeight / 2 - wrapCenterY - (screenCenterY - height / 2) * targetScale
    };
  }

  function createApproachTimeline(redReady, beigeReady) {
    if (!redReady && beigeReady) {
      macRedImage.style.opacity = '0';
      macBeigeImage.style.opacity = '1';
    }
    if (!window.gsap || !window.ScrollTrigger || !macintoshWrap) return;

    gsap.registerPlugin(ScrollTrigger);
    const existingTrigger = ScrollTrigger.getById('approach-scroll-story');
    if (existingTrigger) existingTrigger.kill(true);
    if (reducedMotion) return;

    gsap.set(macintoshWrap, { scale: approachAnimation.initialScale, transformOrigin: '50% 50%' });
    let approachTimeline;
    approachTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: () => setActiveApproachStep(approachTimeline.time()),
      scrollTrigger: {
        id: 'approach-scroll-story',
        trigger: approachSection,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * approachAnimation.scrollViewportMultiplier),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    approachTimeline
      .fromTo(macintoshWrap, { scale: approachAnimation.initialScale }, { scale: approachAnimation.settledScale, duration: approachAnimation.entranceDuration, ease: 'power1.out' }, 0)
      .to(designWord, { x: () => Math.min(window.innerWidth * 0.033, 64), fontWeight: 500, duration: 0.8, ease: 'power1.out' }, 0.2)
      .to(developmentWord, { x: () => -Math.min(window.innerWidth * 0.04, 78), fontWeight: 500, duration: 0.8, ease: 'power1.out' }, 0.2)
      .fromTo(approachStepNavItems, { x: 22, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, 0.7);

    approachSteps.forEach((step, index) => {
      const stepStart = approachStepStartTimes[index];
      const visual = step.querySelector('.approach-step-visual');
      if (index > 0) {
        approachTimeline.to(approachSteps[index - 1], { opacity: 0, y: -12, duration: 0.2 }, stepStart);
      }
      approachTimeline
        .fromTo(step, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power1.out' }, stepStart)
        .fromTo(visual, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.48, ease: 'power2.out' }, stepStart + 0.04);
    });

    const zoomStart = approachAnimation.zoomStart;
    const zoomDuration = approachAnimation.zoomDuration;
    approachTimeline
      .to(approachSteps, { opacity: 0, y: 12, duration: 0.24, stagger: 0.035 }, zoomStart - 0.2)
      .to(designWord, { x: () => -window.innerWidth * 0.18, opacity: 0, duration: 0.45, ease: 'power1.in' }, zoomStart)
      .to(developmentWord, { x: () => window.innerWidth * 0.18, opacity: 0, duration: 0.45, ease: 'power1.in' }, zoomStart)
      .to(approachStepNavItems, { x: 18, opacity: 0, duration: 0.4, stagger: 0.035 }, zoomStart)
      .to(approachMarker, { opacity: 0, duration: 0.35 }, zoomStart)
      .to(macintoshWrap, {
        scale: () => getMacintoshZoomTarget().scale,
        x: () => getMacintoshZoomTarget().x,
        y: () => getMacintoshZoomTarget().y,
        duration: zoomDuration,
        ease: 'power3.in'
      }, zoomStart);

    if (redReady && beigeReady) {
      approachTimeline
        .to(macRedImage, { opacity: 0, duration: zoomDuration, ease: 'none' }, zoomStart)
        .to(macBeigeImage, { opacity: 1, duration: zoomDuration, ease: 'none' }, zoomStart);
    }
    if (paperFade) {
      approachTimeline.to(paperFade, { opacity: 1, duration: 0.6 }, zoomStart + zoomDuration * 0.55);
    }
    setActiveApproachStep(0);
  }

  Promise.all([waitForImage(macRedImage), waitForImage(macBeigeImage)])
    .then(([redReady, beigeReady]) => createApproachTimeline(redReady, beigeReady));
  window.addEventListener('scroll', requestStudioUpdate, { passive: true });
  window.addEventListener('resize', requestStudioUpdate, { passive: true });
  requestStudioUpdate();
})();
