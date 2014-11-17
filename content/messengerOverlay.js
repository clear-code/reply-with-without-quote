/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var ReplyWithWithoutQuote = {
  get bundle() {
    delete this.bundle;
    return this.bundle = document.getElementById('reply-with-without-quote-stringbundle');
  },

  BUTTONS : [
    'button-reply',
    'button-replylist',
    'hdrReplyToSenderButton',
    'hdrReplyButton'
  ],

  CLASS_CONTROLLED    : 'with-without-quote-item',
  CLASS_WITH_QUOTE    : 'with-quote',
  CLASS_WITHOUT_QUOTE : 'without-quote',

  get currentIdentity() {
    if (!gFolderDisplay.displayedFolder)
      return null;
    return accountManager.getFirstIdentityForServer(gFolderDisplay.displayedFolder.server);
  },

  init : function() {
    this.convertButtonsToMenuButtons();
  },

  convertButtonsToMenuButtons : function() {
    this.BUTTONS.forEach(function(aId) {
      var button = document.getElementById(aId);
      if (button)
        this.convertButtonToMenuButton(button);
    }, this);
  },
  convertButtonToMenuButton : function(aButton) {

    var label = aButton.getAttribute('label');
    var withQuoteLabel    = this.bundle.getFormattedString('label_with_quote', [label]);
    var withoutQuoteLabel = this.bundle.getFormattedString('label_without_quote', [label]);

    var withQuote = document.createElement('menuitem');
    withQuote.setAttribute('label', withQuoteLabel);
    withQuote.setAttribute('accesskey', this.bundle.getString('accesskey_with_quote'));
    withQuote.setAttribute('oncommand', 'ReplyWithWithoutQuote.onReplyWithQuoteCommand(event)');
    withQuote.setAttribute('class', [this.CLASS_CONTROLLED, this.CLASS_WITH_QUOTE].join(' '));

    var withoutQuote = document.createElement('menuitem');
    withoutQuote.setAttribute('label', withoutQuoteLabel);
    withoutQuote.setAttribute('accesskey', this.bundle.getString('accesskey_without_quote'));
    withoutQuote.setAttribute('oncommand', 'ReplyWithWithoutQuote.onReplyWithoutQuoteCommand(event)');
    withoutQuote.setAttribute('class', [this.CLASS_CONTROLLED, this.CLASS_WITHOUT_QUOTE].join(' '));

    var popup = document.createElement('menupopup');
    popup.setAttribute('id', aButton.getAttribute('id') + '-popup');
    popup.setAttribute('onpopupshowing', 'ReplyWithWithoutQuote.updateButtonMenuItems(this)');
    popup.appendChild(withQuote);
    popup.appendChild(withoutQuote);
    aButton.appendChild(popup);
    aButton.setAttribute('type', 'menu-button');
  },

  updateButtonMenuItems : function(aOwner) {
    Array.forEach(aOwner.querySelectorAll('.' + this.CLASS_CONTROLLED), function(aItem) {
      aItem.style.fontWeight = '';
    }, this);

    var identity = this.currentIdentity;
    if (!identity)
      return;

    var defaultItemClass = identity.autoQuote ? this.CLASS_WITH_QUOTE : this.CLASS_WITHOUT_QUOTE ;
    var item = aOwner.querySelector('.' + defaultItemClass);
    if (item)
      item.style.fontWeight = 'bold';
  },

  onReplyWithQuoteCommand : function(aEvent) {
    this.setAutoQuoteTemporarily(true);
  },
  onReplyWithoutQuoteCommand : function(aEvent) {
    this.setAutoQuoteTemporarily(false);
  },
  setAutoQuoteTemporarily : function(aState) {
    var identity = this.currentIdentity;
    if (!identity || identity.autoQuote == aState)
      return;
    var originalState = identity.autoQuote;
    identity.autoQuote = aState;
    setTimeout(function() {
      // this should be done after the compose window is completely initialized!
      identity.autoQuote = originalState;
    }, 100);
  }
};

window.addEventListener('DOMContentLoaded', function ReplyWithWithoutQuoteSetup() {
  window.removeEventListener('DOMContentLoaded', ReplyWithWithoutQuoteSetup, false);

  ReplyWithWithoutQuote.init();
}, false);
