const updateScrollY = () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
};

window.addEventListener('scroll', updateScrollY, { passive: true });
updateScrollY();
