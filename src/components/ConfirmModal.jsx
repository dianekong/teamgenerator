export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <div
        className="rounded-2xl p-8 flex flex-col gap-6 max-w-sm w-full mx-4"
        style={{
          background: '#FFFBF5',
          border: '1.5px solid #D4C5B5',
        }}
      >
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: '#1A1A1A', fontSize: '15px', lineHeight: '1.65', textAlign: 'center' }}>
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="btn-press rounded-xl px-5 py-2.5 font-bold"
            style={{
              fontFamily: "'Nunito', sans-serif",
              background: '#F0EDE8',
              color: '#555555',
              border: '1.5px solid #1A1A1A',
              boxShadow: '2px 2px 0 #1A1A1A',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-press rounded-xl px-5 py-2.5 font-bold"
            style={{
              fontFamily: "'Nunito', sans-serif",
              background: '#F45B69',
              color: '#FFFFFF',
              border: '1.5px solid #1A1A1A',
              boxShadow: '2px 2px 0 #1A1A1A',
              fontSize: 13,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
