import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface TutorialProps {
  isAuthenticated: boolean;
}

export const Tutorial: React.FC<TutorialProps> = ({ isAuthenticated }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Start tutorial when user is authenticated
    if (isAuthenticated) {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        setRun(true);
      }
    }
  }, [isAuthenticated]);

  const steps: Step[] = [
    {
      target: '.nav-weekly',
      content: 'This is where you can log your time for the current week. Add entries for each day and mark days as not worked.',
      placement: 'right',
    },
    {
      target: '.nav-previous',
      content: 'View and edit your previous weeks here. You can modify time entries and see your earnings.',
      placement: 'right',
    },
    {
      target: '.nav-trash',
      content: 'Access deleted entries and weeks. You can restore items or empty the trash.',
      placement: 'right',
    },
    {
      target: '.nav-settings',
      content: 'Manage your account settings, change your name, and customize the theme.',
      placement: 'right',
    },
    {
      target: '.save-week-button',
      content: 'Remember to save your week when you\'re done logging time!',
      placement: 'left',
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#0ea5e9',
          textColor: '#334155',
          backgroundColor: '#ffffff',
        },
      }}
      callback={handleCallback}
    />
  );
};