import { useEffect, useMemo, useState } from 'react';
import { usePrefs } from '../hooks/usePrefs';
import { randomPhrase } from '../../shared/phrases';
import { badgeForDate } from '../../shared/badges';
import { TopBar } from './TopBar';
import { Mascot } from './Mascot';
import { Settings } from './Settings';
import { MiniCuy } from './MiniCuy';
import { UpdateButton } from './UpdateButton';
import { Toast } from './Toast';
import { DEFAULT_PRIMARY_COLOR } from '../../shared/types';

type ModalKind = 'groups' | 'credits' | null;

const MODAL_MESSAGES: Record<Exclude<ModalKind, null>, string> = {
  groups: 'Groups está en desarrollo. ¡Pronto podrás unirte a grupos de estudio!',
  credits: 'En desarrollo. ¡Pronto podrás ver los créditos del proyecto!'
};

/**
 * Componente raíz. Compone la tarjeta flotante.
 * Lógica de datos vive en hooks/shared, este archivo solo orquesta UI.
 */
export function App(): JSX.Element {
  const { prefs, update } = usePrefs();
  const [phrase, setPhrase] = useState<string>(() => randomPhrase());
  const [showSettings, setShowSettings] = useState(false);
  const [mini, setMini] = useState(false);
  const [appVersion, setAppVersion] = useState('...');
  const [modal, setModal] = useState<ModalKind>(null);

  const badge = useMemo(() => badgeForDate(), []);
  const primary = prefs?.primaryColor ?? DEFAULT_PRIMARY_COLOR;
  const name = prefs?.studentName.trim() ?? '';
  const greeting = name ? `Hola ${name}, soy Cuy UNDC 🐹` : 'Hola! soy cuy-undc';

  const collapse = (): void => {
    setMini(true);
    window.cuy.window.collapse();
  };

  const expand = (): void => {
    setMini(false);
    window.cuy.window.expand();
  };

  // Crece la ventana solo cuando el panel de personalización está abierto.
  useEffect(() => {
    if (mini) return;
    window.cuy.window.setMode(showSettings ? 'expanded' : 'compact');
  }, [mini, showSettings]);

  useEffect(() => {
    let active = true;

    void window.cuy.app.getVersion().then((version) => {
      if (active) setAppVersion(version);
    });

    return () => {
      active = false;
    };
  }, []);

  if (mini) {
    return <MiniCuy primary={primary} onExpand={expand} />;
  }

  return (
    <div
      className="cuy-card"
      style={{ ['--cuy-primary' as string]: primary }}
    >
      <TopBar onCollapse={collapse} />

      <Mascot onPet={() => setPhrase(randomPhrase())} />

      <div className="cuy-greeting">{greeting}</div>

      <div className="cuy-phrase no-drag" onClick={() => setPhrase(randomPhrase())}>
        {phrase}
      </div>

      <div className="cuy-actions no-drag">
        <button
          type="button"
          className="cuy-badge no-drag"
          onClick={() => void window.cuy.app.openExternal('https://sala.cuy-undc.net.pe')}
          title="Abrir sala de estudio"
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </button>

        <button
          type="button"
          className="cuy-badge no-drag"
          onClick={() => setModal('groups')}
          title="Grupos de estudio"
        >
          <span>👥</span>
          <span>Groups</span>
        </button>

        <button
          type="button"
          className="cuy-badge no-drag"
          onClick={() => setModal('credits')}
          title="Créditos"
        >
          <span>⭐</span>
          <span>Credits</span>
        </button>
      </div>

      <button
        type="button"
        className="cuy-toggle"
        onClick={() => setShowSettings((v) => !v)}
      >
        {showSettings ? 'Ocultar ajustes' : 'Personalizar'}
      </button>

      {showSettings && prefs && (
        <Settings prefs={prefs} onChange={update} />
      )}

      <div className="cuy-version no-drag" title={`Versión actual: ${appVersion}`}>
        V. {appVersion}
      </div>

      <UpdateButton />

      {modal && (
        <Toast
          message={MODAL_MESSAGES[modal]}
          durationMs={0}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
