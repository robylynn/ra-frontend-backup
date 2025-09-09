import { useAlert } from '@/lib/components/client_components/AlertContext';
import { CloseIcon } from '@/lib/components/server_components/svg/icons';
import { useEffect } from 'react';

interface ModalProps {
    modalTitle: string;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactElement;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    modalTitle,
    children,
}) => {
    if (!isOpen) return null;
    const { showAlert } = useAlert();

    useEffect(() => {
        // Only add the listener if the modal is open
        if (!isOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]); // Dependencies: Re-run effect if modal open state or onClose function changes.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {modalTitle}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-800"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-grow h-full">{children}</div>
            </div>
        </div>
    );
};
