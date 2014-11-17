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
  MENUITEMS : [
    'replyMainMenu',
    'replySenderMainMenu',
    'menu_replyToAll',
    'menu_replyToList',
    'appmenu_replyMainMenu',
    'appmenu_replySenderMainMenu',
    'appmenu_replyToAll',
    'appmenu_replyToList',
    'hdrReplyAll_ReplyAllSubButton',
    'hdrReplySubButton',
    'hdrReplyList_ReplyListSubButton',
    'hdrRelplyList_ReplyAllSubButton', // this typo is originally by Thunderbird...
    'hdrReplyList_ReplySubButton'
  ],

  CLASS_CONTROLLED_ITEM  : 'with-without-quote-item',
  CLASS_CONTROLLED_POPUP : 'with-without-quote-popup',
  CLASS_WITH_QUOTE    : 'with-quote',
  CLASS_WITHOUT_QUOTE : 'without-quote',

  WITH_QUOTE_ID_SUFFIX    : '-with-quote',
  WITHOUT_QUOTE_ID_SUFFIX : '-without-quote',

  get currentIdentity() {
    if (!gFolderDisplay.displayedFolder)
      return null;
    return accountManager.getFirstIdentityForServer(gFolderDisplay.displayedFolder.server);
  },

  init : function() {
    window.addEventListener('unload', this, false);
    this.convertButtonsToMenuButtons();
    this.installExtraMenuItems();
  },

  destroy : function() {
    Array.forEach(document.querySelectorAll('.' + this.CLASS_CONTROLLED_POPUP), function(aPopup) {
      aPopup.removeEventListener('popupshowing', this, false);
    }, this);
  },

  handleEvent : function(aEvent) {
    switch (aEvent.type) {
      case 'DOMContentLoaded':
        window.removeEventListener('DOMContentLoaded', this, this);
        this.init();
        return;

      case 'unload':
        window.removeEventListener('unload', this, false);
        this.destroy();
        return;

      case 'popupshowing':
        this.updateMenuButtonMenuItems(aEvent.target);
        return;
    }
  },

  getOriginalItem : function(aItem) {
    var id = aItem.getAttribute('data-original-item');
    if (id)
      return document.getElementById(id);
    return null;
  },


  // update <toolbarbutton> to <toolbarbutton type="menu-button"> with submenus.
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
    withQuote.setAttribute('class', [this.CLASS_CONTROLLED_ITEM,
                                     this.CLASS_WITH_QUOTE].join(' '));

    var withoutQuote = document.createElement('menuitem');
    withoutQuote.setAttribute('label', withoutQuoteLabel);
    withoutQuote.setAttribute('accesskey', this.bundle.getString('accesskey_without_quote'));
    withoutQuote.setAttribute('oncommand', 'ReplyWithWithoutQuote.onReplyWithoutQuoteCommand(event)');
    withoutQuote.setAttribute('class', [this.CLASS_CONTROLLED_ITEM,
                                        this.CLASS_WITHOUT_QUOTE].join(' '));

    var popup = document.createElement('menupopup');
    popup.setAttribute('id', aButton.getAttribute('id') + '-popup');
    popup.setAttribute('onpopupshowing', 'ReplyWithWithoutQuote.updateButtonMenuItems(this)');
    popup.appendChild(withQuote);
    popup.appendChild(withoutQuote);
    aButton.appendChild(popup);
    aButton.setAttribute('type', 'menu-button');
  },

  updateButtonMenuItems : function(aOwner) {
    Array.forEach(aOwner.querySelectorAll('.' + this.CLASS_CONTROLLED_ITEM), function(aItem) {
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


  // upgrade single <menuitem> to multiple <menuitem>s.
  installExtraMenuItems : function() {
    this.MENUITEMS.forEach(function(aId) {
      var item = document.getElementById(aId);
      if (item)
        this.installExtraMenuItemsFor(item);
    }, this);
  },
  installExtraMenuItemsFor : function(aItem) {
    var label = aItem.getAttribute('label');
    var withQuoteLabel    = this.bundle.getFormattedString('label_with_quote', [label]);
    var withoutQuoteLabel = this.bundle.getFormattedString('label_without_quote', [label]);

    var withQuote = aItem.cloneNode(true);
    withQuote.setAttribute('id', aItem.getAttribute('id') + this.WITH_QUOTE_ID_SUFFIX);
    withQuote.setAttribute('data-original-item', aItem.getAttribute('id'));
    withQuote.setAttribute('label', withQuoteLabel);
    withQuote.setAttribute('oncommand', 'ReplyWithWithoutQuote.onReplyWithQuoteCommand(event)');
    withQuote.removeAttribute('command');
    withQuote.removeAttribute('observes');
    withQuote.removeAttribute('key');
    withQuote.setAttribute('class', [aItem.getAttribute('class') || '',
                                     this.CLASS_CONTROLLED_ITEM,
                                     this.CLASS_WITH_QUOTE].join(' '));
    aItem.parentNode.insertBefore(withQuote, aItem);

    var withoutQuote = aItem.cloneNode(true);
    withoutQuote.setAttribute('id', aItem.getAttribute('id') + this.WITHOUT_QUOTE_ID_SUFFIX);
    withoutQuote.setAttribute('data-original-item', aItem.getAttribute('id'));
    withoutQuote.setAttribute('label', withoutQuoteLabel);
    withoutQuote.setAttribute('oncommand', 'ReplyWithWithoutQuote.onReplyWithoutQuoteCommand(event)');
    withoutQuote.removeAttribute('command');
    withoutQuote.removeAttribute('observes');
    withoutQuote.removeAttribute('key');
    withoutQuote.setAttribute('class', [aItem.getAttribute('class') || '',
                                        this.CLASS_CONTROLLED_ITEM,
                                        this.CLASS_WITHOUT_QUOTE].join(' '));
    aItem.parentNode.insertBefore(withoutQuote, aItem.nextSibling);

    aItem.parentNode.addEventListener('popupshowing', this, false);
    aItem.parentNode.classList.add(this.CLASS_CONTROLLED_POPUP);
  },

  updateMenuButtonMenuItems : function(aOwner) {
    Array.forEach(aOwner.querySelectorAll('.' + this.CLASS_CONTROLLED_ITEM), function(aItem) {
      this.updateMenuButtonMenuItem(aItem);
    }, this);
  },
  updateMenuButtonMenuItem : function(aItem) {
    var original = this.getOriginalItem(aItem);
    aItem.collapsed = Boolean(original.collapsed);
    aItem.hidden    = Boolean(original.hidden);
    aItem.disabled  = Boolean(original.disabled);

    var identity = this.currentIdentity;
    if (!identity)
      return;

    original.style.fontWeight = 'bold';
    var isWithQuoteItem = aItem.classList.contains(this.CLASS_WITH_QUOTE);
    if (!aItem.collapsed && !aItem.hidden) {
      aItem.hidden = identity.autoQuote == isWithQuoteItem;
      if (aItem.hidden)
        original.setAttribute('label', aItem.getAttribute('label'));
    }
  },


  onReplyWithQuoteCommand : function(aEvent) {
    this.setAutoQuoteTemporarily(true);
    this.redirectDoCommand(aEvent.target);
  },
  onReplyWithoutQuoteCommand : function(aEvent) {
    this.setAutoQuoteTemporarily(false);
    this.redirectDoCommand(aEvent.target);
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
  },
  redirectDoCommand : function(aTarget) {
    var original = this.getOriginalItem(aTarget);
    if (original) {
      original = document.getElementById(original);
      if (original && typeof original.doCommand == 'function')
        original.doCommand();
    }
  }
};

window.addEventListener('DOMContentLoaded', ReplyWithWithoutQuote, true);
