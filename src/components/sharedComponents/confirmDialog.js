import Swal from 'sweetalert2';

// Hàm hiển thị hộp thoại xác nhận với text và icon tùy chỉnh
const confirmDialog = async (title, text, icon) => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không',
    });

    return result.isConfirmed; // Trả về true nếu xác nhận, false nếu không
};

export default confirmDialog;
