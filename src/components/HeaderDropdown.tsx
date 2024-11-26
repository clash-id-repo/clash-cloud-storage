'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { 
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { FaTelegram, FaGithub } from 'react-icons/fa';

export function HeaderDropdown() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center">
        <Menu.Button className="group inline-flex items-center">
          <span className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            JemPH Cloud
          </span>
          <ChevronDownIcon
            className="ml-2 h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-48 sm:w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700 z-[9999]">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="https://t.me/JemPH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    active ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center rounded-md px-2 py-2 text-xs sm:text-sm`}
                >
                  <FaTelegram className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  Telegram
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="https://github.com/JemPH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    active ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center rounded-md px-2 py-2 text-xs sm:text-sm`}
                >
                  <FaGithub className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  GitHub
                </a>
              )}
            </Menu.Item>
            {/* ... rest of the menu items with the same responsive classes ... */}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}