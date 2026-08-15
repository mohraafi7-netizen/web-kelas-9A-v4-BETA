'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';

const ONBOARDING_KEY = 'galaxy_onboarding_completed';

const steps = [
  {
    title: 'Welcome to Galaxy Class 🚀',
    description: 'Your class dashboard in one galaxy.',
  },
  {
    title: 'Dashboard',
    description: 'See announcements, schedule, and quick access to all class features.',
  },
  {
    title: 'Quick Access',
    description: 'Fast shortcuts to Announcements, Members, Schedule, Gallery, and more.',
  },
  {
    title: 'You\'re ready',
    description: 'Start exploring your class galaxy.',
  },
];

function OnboardingModal() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setOpen(true);
    }
  }, []);

  const handleClose = (finished: boolean) => {
    if (finished) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-strong rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
              <p className="text-sm text-slate-400">{steps[step].description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === step ? 'w-6 bg-galaxy-500' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {step < steps.length - 1 ? (
                  <>
                    <Button variant="secondary" onClick={() => handleClose(false)} className="px-4 py-2 text-sm">
                      Skip
                    </Button>
                    <Button onClick={() => setStep((s) => s + 1)} className="px-4 py-2 text-sm">
                      Next
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleClose(true)} className="px-4 py-2 text-sm">
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { OnboardingModal };
