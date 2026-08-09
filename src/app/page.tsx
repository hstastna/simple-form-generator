'use client';

import { ConfigTab } from '@/components/tabs/ConfigTab/ConfigTab';
import { ResultTab } from '@/components/tabs/ResultTab/ResultTab';
import { tabs } from '@/constants';
import { FormProvider } from '@/context/FormContext';
import { FC, KeyboardEvent, useState } from 'react';

type Tabs = (typeof tabs)[number];

const Home: FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>('config');

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    tab: Tabs
  ) => {
    const currentIndex = tabs.indexOf(tab);
    const lastIndex = tabs.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    document.getElementById(`tab-${tabs[nextIndex]}`)?.focus();
  };

  return (
    <main>
      <FormProvider>
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav
            className="flex space-x-8"
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
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleKeyDown(event, tab)}
                className={`pt-4 pb-2 px-1 border-b-4 capitalize ${
                  activeTab === tab
                    ? 'border-green-500 font-medium text-md text-green-500'
                    : 'border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-300'
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
