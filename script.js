const updateScrollY = () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
};

const updateButtonsVisibility = (imageName) => {
  const buttons = document.querySelectorAll('.layout-button');
  buttons.forEach((btn) => {
    const matches = imageName === 'layout2.png' && btn.dataset.forImage === imageName;
    btn.classList.toggle('is-hidden', !matches);
    if (!matches) {
      btn.style.left = '';
      btn.style.top = '';
      btn.style.width = '';
      btn.style.height = '';
    }
  });
};

const positionButtons = (imageName) => {
  const gallery = document.querySelector('.bottom-gallery');
  const layoutImage = document.querySelector(`.bottom-image[data-image="${imageName}"]`);
  if (!gallery || !layoutImage) return;

  const galleryRect = gallery.getBoundingClientRect();
  const layoutRect = layoutImage.getBoundingClientRect();
  const buttons = document.querySelectorAll(`.layout-button[data-for-image="${imageName}"]`);

  buttons.forEach((btn, index) => {
    const frac = index === 0 ? 0.28 : 0.72;
    const btnWidth = Math.max(40, layoutRect.width * 0.16 + 700); 
    btn.style.width = `${btnWidth}px`;
    btn.style.height = 'auto';
    let left = layoutRect.left - galleryRect.left + layoutRect.width * frac;
    
    if (index === 0) left += 215; // left button
    if (index === 1) left -= 164;  // right button
    const top = layoutRect.top - galleryRect.top + layoutRect.height * 0.5;
    btn.style.left = `${left}px`;
    btn.style.top = `${top}px`;
    btn.style.transform = 'translate(-50%, -50%)';
  });
};

// Art overlay management
const artIndexMap = {};

const showArtForLayout = (imageName, index) => {
  document.querySelectorAll('.layout-art').forEach((art) => {
    const artLayout = art.dataset.forImage;
    const artIndex = Number(art.dataset.index || 0);
    const match = imageName === 'layout2.png' && artLayout === imageName && artIndex === index;

    art.classList.toggle('is-hidden', !match);

    if (match) {
      art.style.left = '';
      art.style.top = '';
      art.style.width = '';
      art.style.height = '';
    }
  });
};

const positionArts = (imageName) => {
  const gallery = document.querySelector('.bottom-gallery');
  const layoutImage = document.querySelector(`.bottom-image[data-image="${imageName}"]`);
  if (!gallery || !layoutImage) return;
  const galleryRect = gallery.getBoundingClientRect();
  const layoutRect = layoutImage.getBoundingClientRect();
  const arts = document.querySelectorAll(`.layout-art[data-for-image="${imageName}"]`);
  arts.forEach((art) => {
    const artWidth = Math.max(40, layoutRect.width * 0.6 + 400); // increase art size by 400px per request
    art.style.width = `${artWidth}px`; 
    art.style.height = 'auto';
    const left = layoutRect.left - galleryRect.left + layoutRect.width * 0.5 - 9; // shift art 10px left
    const top = layoutRect.top - galleryRect.top + layoutRect.height * 0.5;
    art.style.left = `${left}px`;
    art.style.top = `${top}px`;
    art.style.transform = 'translate(-50%, -50%)';
  });
};

const initArtForLayout = (imageName) => {
  if (imageName !== 'layout2.png') {
    document.querySelectorAll('.layout-art').forEach((art) => art.classList.add('is-hidden'));
    return;
  }

  artIndexMap[imageName] = 1;
  showArtForLayout(imageName, 1);
  setTimeout(() => positionArts(imageName), 50);
};

const advanceArtForLayout = (imageName, delta) => {
  if (imageName !== 'layout2.png') return;

  const arts = document.querySelectorAll(`.layout-art[data-for-image="${imageName}"]`);
  if (!arts || arts.length === 0) return;
  const count = arts.length;
  const current = artIndexMap[imageName] || 1;
  let next = ((current - 1 + delta) % count + count) % count + 1;
  artIndexMap[imageName] = next;
  showArtForLayout(imageName, next);
  positionArts(imageName);
};

const swapBottomImage = (imageName) => {
  const bottomImages = document.querySelectorAll('.bottom-image');
  bottomImages.forEach((image) => {
    const isLayoutImage = image.dataset.image === imageName;
    const isLayoutOneMusic = imageName === 'layout1.png' && ['MUSIC1.png', 'MUSICBOX1.png'].includes(image.dataset.image || '');
    const isActive = isLayoutImage || isLayoutOneMusic;
    image.classList.toggle('is-hidden', !isActive);
    image.classList.toggle('is-active', isActive);
  });

  document.querySelectorAll('.layout-art').forEach((art) => {
    art.classList.add('is-hidden');
  });

  updateButtonsVisibility(imageName);
  setTimeout(() => {
    if (imageName === 'layout2.png') {
      positionButtons(imageName);
      initArtForLayout(imageName);
    }
  }, 50);
};

document.querySelectorAll('.frame-extra[data-target-image]').forEach((tile) => {
  tile.addEventListener('click', () => {
    const gallery = document.querySelector('.bottom-gallery');

    gallery?.classList.remove('is-hidden');
    swapBottomImage(tile.dataset.targetImage);
    gallery?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Attach per-button handlers with pixel-alpha hit testing so only clicks on the visible
// parts of the button images trigger art changes.
const isPointOpaqueOnImage = (img, clientX, clientY) => {
  if (!img || !img.complete) return false;
  const rect = img.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return false;
  const nx = Math.floor(x * (img.naturalWidth / rect.width));
  const ny = Math.floor(y * (img.naturalHeight / rect.height));
  if (!img.naturalWidth || !img.naturalHeight) return true;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(nx, ny, 1, 1).data;
    return data[3] > 10; // alpha > ~4%
  } catch (err) {
    return true; // if cross-origin or other error, fall back to allowing the click
  }
};

const attachButtonHandlers = () => {
  document.querySelectorAll('.layout-button').forEach((btn) => {
    if (btn.__hasButtonHandler) return;
    const handler = (e) => {
      const imageName = btn.dataset.forImage;
      if (!imageName) return;
      if (!isPointOpaqueOnImage(btn, e.clientX, e.clientY)) return;
      e.stopPropagation();
      const src = (btn.getAttribute('src') || '').toLowerCase();
      const isNext = src.includes('button2') || (btn.alt || '').includes('2');
      if (isNext) advanceArtForLayout(imageName, 1);
      else advanceArtForLayout(imageName, -1);
    };
    btn.addEventListener('click', handler);
    btn.__hasButtonHandler = true;
  });
};

attachButtonHandlers();

const musicImage = document.querySelector('.music-image');
const dropAudio = document.getElementById('drop-audio');
let dragState = null;
let audioReady = false;

if (dropAudio) {
  dropAudio.src = 'Mitski%20-%20Washing%20Machine%20Heart%20%5B1%5D.mp3';
  dropAudio.load();
  dropAudio.addEventListener('canplaythrough', () => {
    audioReady = true;
  }, { once: true });
}

const resetMusicImagePosition = () => {
  if (!musicImage) return;

  musicImage.classList.remove('is-hidden');
  musicImage.classList.remove('dragging');
  musicImage.style.left = '';
  musicImage.style.top = '';
  musicImage.style.transform = '';
  document.body.style.userSelect = '';
  dragState = null;
};

const playDropAudio = () => {
  if (!dropAudio) return;

  const startTime = 9;
  const endTime = 40;

  const stopAtEnd = () => {
    if (dropAudio.currentTime >= endTime) {
      dropAudio.pause();
      dropAudio.currentTime = startTime;
      resetMusicImagePosition();
    }
  };

  if (!audioReady && dropAudio.readyState < 2) {
    dropAudio.addEventListener('canplaythrough', () => {
      dropAudio.currentTime = startTime;
      dropAudio.play().catch(() => {});
      dropAudio.addEventListener('timeupdate', stopAtEnd, { once: false });
    }, { once: true });
    return;
  }

  dropAudio.currentTime = startTime;
  dropAudio.play().catch(() => {
    dropAudio.load();
    setTimeout(() => dropAudio.play().catch(() => {}), 150);
  });
  dropAudio.addEventListener('timeupdate', stopAtEnd, { once: false });
};

if (musicImage) {
  musicImage.addEventListener('mousedown', (event) => {
    event.preventDefault();
    const rect = musicImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    dragState = {
      offsetX: event.clientX - centerX,
      offsetY: event.clientY - centerY,
    };
    musicImage.classList.add('dragging');
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (event) => {
    if (!dragState) return;
    const gallery = document.querySelector('.bottom-gallery');
    if (!gallery) return;
    const galleryRect = gallery.getBoundingClientRect();
    const left = event.clientX - galleryRect.left - dragState.offsetX;
    const top = event.clientY - galleryRect.top - dragState.offsetY;
    musicImage.style.left = `${left}px`;
    musicImage.style.top = `${top}px`;
    musicImage.style.transform = 'translate(-50%, -50%)';
  });

  window.addEventListener('mouseup', () => {
    if (!dragState) return;
    const musicBoxImage = document.querySelector('.musicbox-image');
    if (musicBoxImage && !musicBoxImage.classList.contains('is-hidden')) {
      const musicRect = musicImage.getBoundingClientRect();
      const boxRect = musicBoxImage.getBoundingClientRect();
      const intersects =
        musicRect.left < boxRect.right &&
        musicRect.right > boxRect.left &&
        musicRect.top < boxRect.bottom &&
        musicRect.bottom > boxRect.top;

      if (intersects) {
        musicImage.classList.add('is-hidden');
        playDropAudio();
        dragState = null;
        musicImage.classList.remove('dragging');
        document.body.style.userSelect = '';
        return;
      }
    }

    dragState = null;
    musicImage.classList.remove('dragging');
    document.body.style.userSelect = '';
  });
}

window.addEventListener('resize', () => {
  const active = document.querySelector('.bottom-image:not(.is-hidden)');
  const imageName = active?.dataset?.image;
  if (imageName) positionButtons(imageName);
  if (imageName) positionArts(imageName);
});

window.addEventListener('scroll', updateScrollY, { passive: true });
updateScrollY();
