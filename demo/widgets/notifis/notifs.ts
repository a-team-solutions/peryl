import { html, Widget } from "../../../lib/dom";


export const TYPE_SUCCESS = "success";
export const TYPE_INFO = "info";
export const TYPE_WARNING = "warning";
export const TYPE_DANGER = "danger";


export interface Notif {
    type: string;
    title: string;
    text: string;
}


export class NotifWidget implements Widget {

    private _element?: HTMLElement;
    private _notif?: Notif;

    getNotif(): Notif | undefined {
        return this._notif;
    }

    setNotif(notif: Notif): this {
        this._notif = notif;
        return this;
    }

    element(): HTMLElement {
        if (!this._element) {
            const notification = this._notif!;
            this._element = html(`
                    <div class="alert alert-dismissible alert-${notification.type}"
                         role="${notification.type}">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        </button>
                        <strong>${notification.title || "" }</strong>
                        ${notification.text || ""}
                    </div>`);
        }
        return this._element;
    }

    mount(element: HTMLElement): this {
        element.appendChild(this.element());
        return this;
    }

    umount(): this {
        this._element &&
            this._element.parentElement &&
                this._element.parentElement.removeChild(this._element);
        return this;
    }

}


export class NotifsWidget implements Widget {

    private _element?: HTMLElement;
    private _notifWidgets: NotifWidget[] = [];

    getNotifWidgets(): NotifWidget[] {
        return this._notifWidgets;
    }

    addNotif(notif: Notif): this {
        const n = new NotifWidget().setNotif(notif);
        this._notifWidgets.push(n);
        this._element && this._element.appendChild(n.element());
        return this;
    }

    empty(): void {
        this._element && (this._element.innerHTML = "");
        this._notifWidgets = [];
    }

    mount(element?: HTMLElement | null): this {
        const e = html(`<div class="notifications"></div>`);
        this._element = e;
        element && element.appendChild(e);
        return this;
    }

    umount(): this {
        this._element &&
            this._element.parentElement &&
                this._element.parentElement.removeChild(this._element);
        return this;
    }

}
