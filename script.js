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

window.addEventListener('scroll', updateScrollY, { passive: true });
updateScrollY();
