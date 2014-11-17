/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var ReplyWithWithoutQuoteCompose = {
  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'compose-window-init':
        Services.obs.notifyObservers(null, 'reply-with-without-quote:compose-window-initialized', null);
        return;

      case 'unload':
        document.documentElement.removeEventListener('compose-window-init', this, false);
        window.removeEventListener('unload', this, false);
        return;
    }
  }
};

document.documentElement.addEventListener('compose-window-init', ReplyWithWithoutQuoteCompose, false);
window.addEventListener('unload', this, false);
