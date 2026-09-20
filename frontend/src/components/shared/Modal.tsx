type ModalProps = {
    onClose: () => void, 
    children: React.ReactNode
}

export const Modal = ({ onClose, children }: ModalProps) => {
    return (
        <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={onClose}
        >
            <div
                className='px-6 py-4 bg-surface rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}