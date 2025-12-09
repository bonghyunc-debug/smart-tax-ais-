import React, { createContext, useContext, useMemo, useState } from 'react';

type ModalContextValue = {
  openModal: (id: string) => void;
  closeModal: () => void;
  currentModal: string | null;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('ModalProvider가 필요합니다.');
  return ctx;
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      currentModal,
      openModal: (id: string) => setCurrentModal(id),
      closeModal: () => setCurrentModal(null),
    }),
    [currentModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
