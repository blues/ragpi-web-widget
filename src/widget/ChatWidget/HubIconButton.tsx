interface Props {
  onClick: () => void;
  position?: 'bottom-left' | 'bottom-right';
}

export const HubIconButton = ({ onClick, position = 'bottom-right' }: Props) => {
  const positionClass = position === 'bottom-left' ? 'left-6' : 'right-6';

  return (
    <div
      className={`fixed bottom-6 ${positionClass} z-50`}
    >
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: 'rgba(62, 90, 255, 0.8)' }}
        aria-label="Show widget"
      >
        <span className="material-icons-hub text-white text-2xl">x</span>
      </button>
    </div>
  );
};
