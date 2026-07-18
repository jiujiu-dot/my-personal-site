const updateScrollY = () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
};

const swapBottomImage = (imageName) => {
  const bottomImages = document.querySelectorAll('.bottom-image');

  if (imageName === 'layout1.png') {
    bottomImages.forEach((image) => {
      image.classList.remove('is-hidden');
      image.classList.add('is-active');
    });
    return;
  }

  bottomImages.forEach((image) => {
    const isActive = image.dataset.image === imageName;
    image.classList.toggle('is-hidden', !isActive);
    image.classList.toggle('is-active', isActive);
  });
};

document.querySelectorAll('.frame-extra[data-target-image]').forEach((tile) => {
  tile.addEventListener('click', () => {
    const gallery = document.querySelector('.bottom-gallery');
    swapBottomImage(tile.dataset.targetImage);
    gallery?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

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

const playDropAudio = () => {
  if (!dropAudio) return;

  if (!audioReady && dropAudio.readyState < 2) {
    dropAudio.addEventListener('canplaythrough', () => {
      dropAudio.currentTime = 0;
      dropAudio.play().catch(() => {});
    }, { once: true });
    return;
  }

  dropAudio.currentTime = 0;
  dropAudio.play().catch(() => {
    dropAudio.load();
    setTimeout(() => dropAudio.play().catch(() => {}), 150);
  });
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

window.addEventListener('scroll', updateScrollY, { passive: true });
updateScrollY();
