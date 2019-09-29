
export class History<T> {

    back(): void {
        window.history.back();
    }

    forward(): void {
        window.history.forward();
    }

    go(delta?: number): void {
        window.history.go(delta);
    }

    length(): number {
        return window.history.length;
    }

    state(): T {
        return window.history.state as T;
    }

    pushState(state: T, title: string, url?: string): void {
        window.history.pushState(state, title, url);
    }

    replaceState(state: T, title: string, url?: string): void {
        window.history.replaceState(state, title, url);
    }

    onChange(callback: (state: T) => void): this {
        window.addEventListener("popstate", function (e: PopStateEvent) {
            callback(e.state);
        });
        return this;
    }

}
