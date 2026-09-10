export const Modal = ({ onClose, children }: { onClose: () => void, children: React.ReactNode }) => {
    return (
        <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
            onClick={onClose}
        >
            <div
                className='bg-white rounded-lg shadow-lg'
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}