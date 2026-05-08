import { useState } from 'react';

interface MascotProps {
  /** Click sobre la mascota — usado para cambiar la frase. */
  onPet: () => void;
}

/**
 * Mascota en pixel art. Carga `public/mascot.png` con `image-rendering: pixelated`.
 * Al hacer click, dispara una animación de salto + cambia la frase.
 * Si la imagen no existe, hace fallback a emoji 🐹.
 */
export function Mascot({ onPet }: MascotProps): JSX.Element {
  const [broken, setBroken] = useState(false);
  const [jumping, setJumping] = useState(false);

  const handleClick = (): void => {
    setJumping(true);
    onPet();
  };

  return (
    <div
      className={`cuy-mascot no-drag${jumping ? ' jumping' : ''}`}
      role="button"
      aria-label="Acariciar al cuy"
      onClick={handleClick}
      onAnimationEnd={() => setJumping(false)}
    >
      {broken ? (
        <span className="cuy-mascot-emoji">🐹</span>
      ) : (
        <img
          src="./mascot.png"
          alt="Cuy UNDC"
          className="cuy-mascot-img"
          onError={() => setBroken(true)}
          draggable={false}
        />
      )}
    </div>
  );
}
