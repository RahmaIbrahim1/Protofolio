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
  const macintoshImage = document.querySelector('.macintosh-image');
  const macintoshRedTint = document.querySelector('.macintosh-red-tint');
  const macScreen = document.querySelector('.mac-screen');
  const macScreenStates = [...document.querySelectorAll('[data-screen-state]')];
  const buildCode = document.querySelector('[data-build-code]');
  const approachStepNavItems = [...document.querySelectorAll('[data-approach-nav]')];
  const approachSteps = [...document.querySelectorAll('[data-approach-step]')];
  const approachMarker = document.querySelector('.approach-marker');
  const paperFade = document.querySelector('.paperfade');
  const workSection = document.getElementById('work');
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
    const workRect = workSection ? workSection.getBoundingClientRect() : { top: Infinity, bottom: Infinity };
    const workActive = workRect.top < 76 && workRect.bottom > 76;
    const contactActive = workRect.bottom <= 76;
    body.classList.toggle('is-studio-active', active);
    body.classList.toggle('is-approach-active', approachActive);
    body.classList.toggle('is-work-active', workActive);
    introNumber.textContent = contactActive ? '04' : workActive ? '03' : approachActive ? '02' : active ? '01' : '00';
    introTitle.textContent = contactActive ? ' Contact' : workActive ? ' Work' : approachActive ? ' Approach' : active ? ' Studio' : ' Intro';

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
    screenFadeDuration: 0.24,
    zoomStart: 5.25,
    zoomDuration: 1.35,
    zoomOverscan: 1.04,
    screenWidthRatio: 0.272,
    screenHeightRatio: 0.283,
    screenCenterYRatio: 0.3755,
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
    let activeIndex = -1;
    if (timelineTime < approachAnimation.zoomStart) {
      approachStepStartTimes.forEach((startTime, index) => {
        if (timelineTime >= startTime) activeIndex = index;
      });
    }
    const activeScreenIndex = activeIndex === -1 && timelineTime >= approachAnimation.zoomStart
      ? macScreenStates.length - 1
      : activeIndex;

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
    macScreenStates.forEach((stage, index) => stage.setAttribute('aria-hidden', String(index !== activeScreenIndex)));
  }

  function getMacintoshZoomTarget() {
    const width = macintoshWrap.offsetWidth;
    const height = macintoshWrap.offsetHeight;
    const imageWidth = macintoshImage.naturalWidth || 1536;
    const imageHeight = macintoshImage.naturalHeight || 1024;
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

  function createApproachTimeline() {
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

    // The red tint and Brief interface transition finish as Brief becomes active.
    approachTimeline
      .to(macintoshRedTint, { opacity: 0, duration: approachAnimation.stepsStart, ease: 'none' }, 0)
      .to(macScreen, { opacity: 1, duration: approachAnimation.stepsStart, ease: 'none' }, 0)
      .fromTo(macScreenStates[0], { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: approachAnimation.stepsStart, ease: 'none' }, 0);

    approachSteps.forEach((step, index) => {
      const stepStart = approachStepStartTimes[index];
      if (index > 0) {
        approachTimeline.to(approachSteps[index - 1], { opacity: 0, y: -12, duration: 0.2 }, stepStart);
      }
      approachTimeline.fromTo(step, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power1.out' }, stepStart);

      if (index > 0) {
        approachTimeline.to(macScreenStates[index - 1], { opacity: 0, y: -2, duration: approachAnimation.screenFadeDuration }, stepStart);
        approachTimeline.fromTo(macScreenStates[index], { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: approachAnimation.screenFadeDuration }, stepStart);
      }
    });

    if (buildCode) {
      const buildSource = buildCode.dataset.buildSource || '';
      const buildTyping = { characters: 0 };
      approachTimeline.to(buildTyping, {
        characters: buildSource.length,
        duration: 0.62,
        snap: { characters: 1 },
        onUpdate: () => { buildCode.textContent = buildSource.slice(0, buildTyping.characters); }
      }, approachStepStartTimes[2] + 0.16);
    }

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

    if (paperFade) {
      approachTimeline.to(paperFade, { opacity: 1, duration: 0.6 }, zoomStart + zoomDuration * 0.55);
    }
    setActiveApproachStep(approachTimeline.time());
  }

  /* ------------------------------------------------------------------------
     Continuation after the Macintosh zoom.
     The approach timeline above ends with .paperfade at full opacity: the CRT
     has whited out into paper. The pin then releases straight into the
     paper-coloured Selected work section, so the white screen *is* the top of
     the next section. Order from the reference: Selected work heading →
     pinned project slideshow → "One studio." word cycler → contact footer.
     ------------------------------------------------------------------------ */
  const pad2 = (n) => String(n).padStart(2, '0');

  function splitChars(element) {
    if (!element) return [];
    const words = element.textContent.trim().split(/\s+/);
    element.replaceChildren();
    const chars = [];
    words.forEach((word, wordIndex) => {
      const wrap = document.createElement('span');
      wrap.setAttribute('aria-hidden', 'true');
      wrap.style.cssText = 'display:inline-block;white-space:nowrap';
      [...word].forEach((letter) => {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = letter;
        wrap.append(ch);
        chars.push(ch);
      });
      element.append(wrap);
      if (wordIndex < words.length - 1) element.append(' ');
    });
    return chars;
  }

  function createWorkHeading() {
    const heading = document.getElementById('workHeading');
    const chars = splitChars(heading);
    if (reducedMotion || !chars.length) return;
    // Letters develop from red to ink as the heading rises out of the whiteout.
    gsap.fromTo(chars,
      { color: '#c40f35', fontWeight: 300 },
      {
        color: '#0c0b0b', fontWeight: 600, ease: 'none', stagger: 0.04,
        scrollTrigger: { trigger: heading, start: 'top 88%', end: 'bottom 55%', scrub: 0.5 }
      });
  }

  function createWorkTimeline() {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const shots = [...stage.querySelectorAll('.shot')];
    const names = [...stage.querySelectorAll('.w-name')];
    const infos = [...stage.querySelectorAll('.w-info')];
    const indexButtons = [...stage.querySelectorAll('#wIndex button')];
    const bars = [...stage.querySelectorAll('.w-bar b')];
    const slit = stage.querySelector('.w-slit');
    const counter = document.getElementById('wCur');
    const sector = document.getElementById('wSector');
    const total = shots.length;
    let current = 0;

    function showProject(index) {
      if (index === current) return;
      const direction = index > current ? 1 : -1;
      current = index;
      const outgoing = counter.lastElementChild;
      const incoming = document.createElement('span');
      incoming.textContent = pad2(index + 1);
      counter.append(incoming);
      gsap.fromTo(incoming, { yPercent: 100 * direction }, { yPercent: 0, duration: 0.7, ease: 'expo.out' });
      gsap.to(outgoing, { yPercent: -100 * direction, duration: 0.7, ease: 'expo.out', onComplete: () => outgoing.remove() });
      indexButtons.forEach((button, i) => button.classList.toggle('on', i === index));
      if (infos[index]) sector.textContent = infos[index].dataset.tag || '';
    }

    if (reducedMotion) {
      // No pin: the index switches projects directly.
      indexButtons.forEach((button, i) => button.addEventListener('click', () => {
        shots.forEach((shot, s) => { shot.style.clipPath = s === i ? 'inset(0 0 0 0)' : 'inset(50% 0 50% 0)'; });
        names.forEach((name, s) => { name.style.visibility = s === i ? 'visible' : 'hidden'; });
        infos.forEach((info, s) => { info.style.opacity = s === i ? 1 : 0; info.style.visibility = s === i ? 'visible' : 'hidden'; });
        showProject(i);
      }));
      return;
    }

    gsap.set(names, { yPercent: 140, autoAlpha: 1 });
    gsap.set(names[0], { yPercent: 0 });
    gsap.set(infos, { autoAlpha: 0 });
    gsap.set(infos[0], { autoAlpha: 1 });
    gsap.set(shots[0].querySelector('.safe'), { opacity: 1 });

    const workTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: () => showProject(Math.max(0, Math.min(total - 1, Math.floor(workTimeline.time() - 0.3)))),
      scrollTrigger: {
        id: 'work-stage',
        trigger: stage,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (total + 0.4) * 1.15),
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // First photo develops under the red safelight while its progress bar fills.
    workTimeline
      .to(shots[0].querySelector('.safe'), { opacity: 0, duration: 0.7 }, 0)
      .fromTo(shots[0].querySelector('.dev img'), { scale: 1.14 }, { scale: 1, duration: 1 }, 0)
      .to(bars[0], { scaleX: 1, duration: 1 }, 0);

    for (let i = 1; i < total; i += 1) {
      const t = i;
      workTimeline
        .fromTo(slit, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.18, ease: 'power2.inOut', immediateRender: false }, t - 0.05)
        .fromTo(shots[i], { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power3.inOut', immediateRender: false }, t + 0.08)
        .to(slit, { opacity: 0, duration: 0.12 }, t + 0.16)
        .fromTo(shots[i - 1].querySelector('.dev img'), { scale: 1 }, { scale: 0.92, duration: 0.5, immediateRender: false }, t + 0.08)
        .fromTo(shots[i].querySelector('.dev img'), { scale: 1.28 }, { scale: 1, duration: 0.9, ease: 'power2.out', immediateRender: false }, t + 0.08)
        .fromTo(shots[i].querySelector('.safe'), { opacity: 1 }, { opacity: 0, duration: 0.7, immediateRender: false }, t + 0.3)
        .fromTo(names[i - 1], { yPercent: 0 }, { yPercent: -140, duration: 0.3, ease: 'power2.in', immediateRender: false }, t)
        .fromTo(names[i], { yPercent: 140 }, { yPercent: 0, duration: 0.4, ease: 'power3.out', immediateRender: false }, t + 0.22)
        .fromTo(infos[i - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: 0.2, immediateRender: false }, t + 0.12)
        .fromTo(infos[i], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, t + 0.35)
        .to(bars[i], { scaleX: 1, duration: 1 }, t);
    }
    workTimeline.to({}, { duration: 0.4 });

    // Scroll position for project i inside the pin (same anchors as the reference).
    const projectScroll = (trigger, i) => {
      const progress = i ? (i + 0.75) / workTimeline.duration() : 0;
      return Math.round(trigger.start + (trigger.end - trigger.start) * progress);
    };

    // Settle on the nearest project once scrolling stops inside the pin.
    let settleTimer = null;
    let touching = false;
    const settle = () => {
      const trigger = ScrollTrigger.getById('work-stage');
      if (!trigger || touching) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y < trigger.start - vh * 0.35 || y > trigger.end + vh * 0.2) return;
      const targets = shots.map((_, i) => projectScroll(trigger, i)).concat(Math.round(trigger.end));
      const nearest = targets.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
      if (Math.abs(nearest - y) >= 2) window.scrollTo({ top: nearest, behavior: 'smooth' });
    };
    const queueSettle = () => { clearTimeout(settleTimer); settleTimer = setTimeout(settle, 180); };
    window.addEventListener('scroll', queueSettle, { passive: true });
    window.addEventListener('touchstart', () => { touching = true; clearTimeout(settleTimer); }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; queueSettle(); }, { passive: true });

    indexButtons.forEach((button, i) => button.addEventListener('click', () => {
      const trigger = ScrollTrigger.getById('work-stage');
      if (trigger) window.scrollTo({ top: projectScroll(trigger, i) + 2, behavior: 'smooth' });
    }));
  }

  function createSplitWords() {
    const split = document.getElementById('split');
    if (!split) return;
    const words = JSON.parse(split.dataset.words);
    const currentWord = split.querySelector('.sp-cur');
    const number = document.getElementById('spN');
    const halves = [...split.querySelectorAll('.sp-h')];
    const setWord = (node, i) => { node.textContent = words[i]; node.classList.toggle('last', i === words.length - 1); };
    let index = 0;
    let visible = false;
    let interval = null;
    let delay = null;
    setWord(currentWord, 0);
    number.textContent = '01';
    if (reducedMotion) return;

    // The outgoing word is copied into two paper halves that slide apart.
    const advance = () => {
      if (!visible || document.hidden) return;
      halves.forEach((half) => setWord(half, index));
      index = (index + 1) % words.length;
      setWord(currentWord, index);
      number.textContent = pad2(index + 1);
      gsap.killTweensOf(halves);
      gsap.set(halves, { xPercent: 0, autoAlpha: 1 });
      gsap.to(halves[0], { xPercent: -105, duration: 0.9, ease: 'expo.inOut' });
      gsap.to(halves[1], { xPercent: 105, duration: 0.9, ease: 'expo.inOut' });
    };
    const stop = () => { clearTimeout(delay); clearInterval(interval); delay = interval = null; };
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !interval && !delay) {
        delay = setTimeout(() => { delay = null; advance(); interval = setInterval(advance, 1700); }, 350);
      } else if (!visible) stop();
    }, { threshold: 0.35 }).observe(split);
  }

  function createFooter() {
    const footer = document.getElementById('siteFoot');
    const footerInner = document.getElementById('ftIn');
    const footTime = document.getElementById('footTime');
    const hello = document.getElementById('ftHello');
    if (!footer) return;

    const updateFootTime = () => { footTime.textContent = timeOutput.textContent; };
    updateFootTime();
    window.setInterval(updateFootTime, 30000);

    // Sticky reveal only when the footer fits the viewport.
    const isSticky = () => {
      document.documentElement.classList.toggle('ft-static', footer.offsetHeight > window.innerHeight + 1);
      return getComputedStyle(footer).position === 'sticky';
    };
    let sticky = isSticky();
    const parallax = () => {
      if (reducedMotion || !sticky) return;
      const mainBottom = document.querySelector('main').getBoundingClientRect().bottom;
      const uncovered = Math.min(1, Math.max(0, (window.innerHeight - mainBottom) / (footer.offsetHeight || 1)));
      gsap.set(footerInner, { y: Math.round(80 * (1 - uncovered)) });
    };
    parallax();
    window.addEventListener('scroll', parallax, { passive: true });
    window.addEventListener('resize', () => {
      sticky = isSticky();
      if (!sticky) gsap.set(footerInner, { clearProps: 'transform' });
      parallax();
    });

    if (hello && !reducedMotion) {
      const last = hello.children.length - 1;
      let step = 0;
      let inView = false;
      new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }).observe(hello.parentElement);
      window.setInterval(() => {
        if (!inView || document.hidden) return;
        step += 1;
        gsap.to(hello, {
          yPercent: (-100 * step) / (last + 1), duration: 0.9, ease: 'expo.inOut',
          onComplete: () => { if (step >= last) { step = 0; gsap.set(hello, { yPercent: 0 }); } }
        });
      }, 2200);
    }
  }

  function createContinuation() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    createWorkHeading();
    createWorkTimeline();
    createSplitWords();
    createFooter();
    ScrollTrigger.refresh();
  }

  // The work pin is created after the approach pin so ScrollTrigger lays them out in page order.
  waitForImage(macintoshImage).then(() => {
    createApproachTimeline();
    createContinuation();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
  window.addEventListener('scroll', requestStudioUpdate, { passive: true });
  window.addEventListener('resize', requestStudioUpdate, { passive: true });
  requestStudioUpdate();
})();
