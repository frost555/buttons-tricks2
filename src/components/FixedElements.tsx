import React from 'react';
import { Header } from './Header';
import { FloatingButton } from './FloatingButton';
import { NotificationBar } from './NotificationBar';

export const FixedElements = () => {
  return (
    <>
      <Header />
      <NotificationBar />
      <FloatingButton />
    </>
  );
};