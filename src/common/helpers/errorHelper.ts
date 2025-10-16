export function scrollToError() {
  const errorElement = document.querySelector('.p-invalid');
  if (errorElement) {
    errorElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}