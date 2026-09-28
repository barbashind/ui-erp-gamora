import React from 'react';

interface HighwayBarProps {
  registered: number;
  total: number;
}

export const HighwayBar: React.FC<HighwayBarProps> = ({ registered, total }) => {
  const percent =
    total > 0 ? Math.min(100, Math.round((registered / total) * 100)) : 0;
  const remaining = Math.max(0, total - registered);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
      }}
    >
      {/* Полоса */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          height: '24px',
          minHeight: 18,
          background: '#f3f4f6',
          borderRadius: 999,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        {/* Оранжевая заливка */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percent}%`,
            borderRadius: 999,
            background:
              'linear-gradient(180deg, #fb923c 0%, #f97316 55%, #ea580c 100%)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Процент внутри полосы — только если влезает */}
          {percent >= 10 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {percent}%
            </span>
          )}
        </div>

        {/* Фолбэк: процент снаружи справа от полосы, если в полосу не влезает */}
        {percent < 10 && (
          <span
            style={{
              position: 'absolute',
              left: `calc(${percent}% + 6px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11,
              fontWeight: 700,
              color: '#ea580c',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {percent}%
          </span>
        )}
      </div>

      {/* Осталось справа */}
      <div
        style={{
          flexShrink: 0,
          fontSize: 12,
          color: '#6b7280',
          whiteSpace: 'nowrap',
        }}
      >
        Осталось:{' '}
        <span style={{ fontWeight: 700, color: '#111827' }}>{remaining}</span>
      </div>
    </div>
  );
};