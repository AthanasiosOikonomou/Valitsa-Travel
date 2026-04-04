import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message?: string }
> {
  state = { hasError: false, message: undefined as string | undefined };

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <p className="text-sm text-muted-foreground">Something went wrong in the admin area.</p>
          {this.state.message ? <pre className="max-w-lg text-xs">{this.state.message}</pre> : null}
          <Button type="button" variant="outline" onClick={() => window.location.assign("/admin/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
