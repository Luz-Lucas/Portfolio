'use client';

import { Component, type ReactNode } from 'react';

/** Se a cena 3D falhar (WebGL, .glb, decoder), avisa o pai para cair na área de trabalho 2D. */
export class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[scene] falhou, usando a área de trabalho 2D:', error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
