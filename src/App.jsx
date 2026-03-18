import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { ConfirmModal } from './components/ConfirmModal';
import { RosterSetup } from './screens/RosterSetup';
import { TeamArena } from './screens/TeamArena';
import { Export } from './screens/Export';
import { generateTeams } from './utils/generateTeams';

const DEFAULT_CONFIG = { mode: 'byCount', value: 4, priority: 'both' };

export default function App() {
  const [screen, setScreen] = useState('roster');
  const [people, setPeople] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [teams, setTeams] = useState([]);
  const [bench, setBench] = useState([]);
  const [startOverConfirm, setStartOverConfirm] = useState(false);

  function handleGenerate() {
    const newTeams = generateTeams(people, config);
    setTeams(newTeams);
    setBench([]);
    setScreen('arena');
  }

  function handleStartOver() {
    setPeople([]);
    setConfig(DEFAULT_CONFIG);
    setTeams([]);
    setBench([]);
    setScreen('roster');
    setStartOverConfirm(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5' }}>
      <TopBar screen={screen} onStartOver={() => setStartOverConfirm(true)} />

      <main>
        {screen === 'roster' && (
          <RosterSetup
            people={people}
            setPeople={setPeople}
            config={config}
            setConfig={setConfig}
            onGenerate={handleGenerate}
          />
        )}

        {screen === 'arena' && (
          <TeamArena
            teams={teams}
            setTeams={setTeams}
            bench={bench}
            setBench={setBench}
            config={config}
            people={people}
            onExport={() => setScreen('export')}
          />
        )}

        {screen === 'export' && (
          <Export
            teams={teams}
            onBackToArena={() => setScreen('arena')}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {startOverConfirm && (
        <ConfirmModal
          message="Start over? All people and team data will be reset."
          onConfirm={handleStartOver}
          onCancel={() => setStartOverConfirm(false)}
        />
      )}
    </div>
  );
}
