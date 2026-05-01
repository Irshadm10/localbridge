import { useState } from 'react';
import { isDevAuthed } from './devAuth.js';
import DevGate from './DevGate.jsx';
import DevLayout from './DevLayout.jsx';
import DevOverview from './DevOverview.jsx';
import DevMentors from './DevMentors.jsx';
import DevSessions from './DevSessions.jsx';
import DevReviews from './DevReviews.jsx';
import DevUsers from './DevUsers.jsx';
import DevSchedule from './DevSchedule.jsx';
import DevCancellations from './DevCancellations.jsx';

export default function DevPortal() {
  const [authed, setAuthed] = useState(isDevAuthed);
  const [activeTab, setActiveTab] = useState('overview');

  if (!authed) {
    return <DevGate onAuth={() => setAuthed(true)} />;
  }

  const CONTENT = {
    overview:      <DevOverview />,
    mentors:       <DevMentors />,
    sessions:      <DevSessions />,
    reviews:       <DevReviews />,
    users:         <DevUsers />,
    schedule:      <DevSchedule />,
    cancellations: <DevCancellations />,
  };

  return (
    <DevLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {CONTENT[activeTab] || <DevOverview />}
    </DevLayout>
  );
}
