import type { UserPreferences } from '../../shared/types';
import { UpdateButton } from './UpdateButton';

interface SettingsProps {
  prefs: UserPreferences;
  onChange: (patch: Partial<UserPreferences>) => Promise<void>;
}

/**
 * Panel de personalización: nombre del estudiante y color principal.
 * Se persisten vía IPC en preferences.json.
 */
export function Settings({ prefs, onChange }: SettingsProps): JSX.Element {
  return (
    <div className="cuy-settings no-drag">
      <label htmlFor="cuy-name">Tu nombre</label>
      <input
        id="cuy-name"
        type="text"
        value={prefs.studentName}
        maxLength={32}
        onChange={(e) => void onChange({ studentName: e.target.value })}
      />

      <label htmlFor="cuy-color">Color principal</label>
      <input
        id="cuy-color"
        type="color"
        value={prefs.primaryColor}
        onChange={(e) => void onChange({ primaryColor: e.target.value })}
      />

      <UpdateButton />
    </div>
  );
}
