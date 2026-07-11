"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className="glass-panel mx-auto mt-20 max-w-md rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Something lost its route</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Please try loading this page again.</p>
        <Button className="mt-5" onClick={() => this.setState({ failed: false })}>
          Try again
        </Button>
      </div>
    );
  }
}
