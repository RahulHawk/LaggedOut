import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * A hook that provides a function to show a styled SweetAlert2 confirmation dialog.
 * @param onConfirm - The async function to call when the user confirms the action.
 */
export const useDeleteConfirmation = (onConfirm: () => Promise<any>) => {
  const showConfirmation = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#2d2d2d', // Example dark theme
      color: '#ffffff',     // Example dark theme
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  return { showConfirmation };
};