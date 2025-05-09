'use client';

import { FC, KeyboardEvent, useState } from 'react';
import { FormProvider } from '@/context/FormContext';
import { ConfigTab } from '@/components/tabs/ConfigTab/ConfigTab';
import { ResultTab } from '@/components/tabs/ResultTab/ResultTab';
import { tabs } from '@/constants';

type Tabs = (typeof tabs)[number];

const Home: FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>('config');

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    tabName: string
  ) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const currentIndex = tabs.indexOf(tabName);
      const nextIndex =
        event.key === 'ArrowLeft'
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];

      document.getElementById(`tab-${nextTab}`)?.focus();

      event.preventDefault();
    } else if (event.key === 'Enter' || event.key === ' ') {
      setActiveTab(tabName as Tabs);
      event.preventDefault();
    }
  };

  return (
    <main>
      <FormProvider>
        <div className="mb-6 border-b border-gray-200">
          <nav
            className="flex space-x-6"
            role="tablist"
            aria-label="Form Generator Tabs"
            aria-orientation="horizontal"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-controls={`panel-${tab}`}
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleKeyDown(event, tab)}
                className={`py-4 px-1 border-b-3 capitalize ${
                  activeTab === tab
                    ? 'border-green-500 font-medium text-md text-green-500'
                    : 'border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <section className="mt-6">
          {activeTab === 'config' && <ConfigTab />}
          {activeTab === 'result' && <ResultTab />}
        </section>
      </FormProvider>
    </main>
  );
};

export default Home;
