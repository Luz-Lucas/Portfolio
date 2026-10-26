import { createContext, useContext } from 'react';

export type Bounds = { w: number; h: number };

export const BoundsContext = createContext<Bounds>({ w: 800, h: 600 });

export const useBounds = () => useContext(BoundsContext);
