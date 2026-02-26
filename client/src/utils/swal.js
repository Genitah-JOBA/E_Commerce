import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#ada194', // Votre couleur beige/taupe
  color: '#ffffff',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const ConfirmModal = (title, text, icon = 'warning') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: '#0f172a', // Votre noir ardoise
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, confirmer',
    cancelButtonText: 'Annuler',
    background: '#ffffff',
    color: '#0f172a',
    customClass: {
      title: 'font-serif', // Pour utiliser Playfair Display si configuré
    }
  });
};
