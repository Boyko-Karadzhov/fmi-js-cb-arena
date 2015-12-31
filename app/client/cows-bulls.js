/* global io */

; (function ($, io) {
    var CowsBullsClient = function (container) {
        this._container = $(container);
        this._currentView = null;
        this._views = {};
        this._io = io.connect();
        this._ticket = null;

        this._views['sign-in'] = new SignInView(this._container.find('div[cb-view="sign-in"]'), this._io);

        var that = this;
        var getTicket = function () { return that._ticket; };
        this._views['lobby'] = new LobbyView(this._container.find('div[cb-view="lobby"]'), this._io, getTicket);
        this._views['new-game'] = new NewGameView(this._container.find('div[cb-view="new-game"]'), this._io, getTicket);
    };

    CowsBullsClient.prototype = {
        initialize: function () {
            this._container.show();
            this._showView('sign-in');

            this._io.on('sign-in-success', $.proxy(this._signInSuccessHandler, this));
            this._io.on('sign-in-fail', $.proxy(this._signInFailHandler, this));
            this._io.on('lobby-game-list', $.proxy(this._lobbyGameListHandler, this));

            var that = this;
            $(this._container.find('[cb-view]')).on('switch-view', function (event, view) {
                that._showView(view);
            });
        },

        _showView: function (view) {
            this._currentView = view;
            var that = this;
            $.each(Object.keys(this._views), function (i, val) {
                that._views[val].toggle(val === view);
            });
        },

        _signInSuccessHandler: function (data) {
            this._ticket = data;
            this._showView('lobby');
        },

        _signInFailHandler: function () {
            this._showView('sign-in');
            this._views['sign-in'].showError();
        },

        _lobbyGameListHandler: function (data) {
            if (this._currentView !== 'lobby')
                return;

            this._views['lobby'].gameList(data);
        }
    };

    var CowsBullsViewBase = function (container, io) {
        this._container = container;
        this._io = io;
        this._isInitialized = false;
    };

    CowsBullsViewBase.prototype = {
        toggle: function (val) {
            this._container.toggle(val);
            if (val) {
                this._onShowBase();
            }
        },

        _initialize: function () {
            this._onInitialize();
            this._isInitialized = true;
        },

        _onShowBase: function () {
            if (!this._isInitialized) {
                this._initialize();
            }

            this._onShow();
        },

        _onShow: function () {
        },

        _onInitialize: function () {
        }
    };

    CowsBullsViewBase.prototype.constructor = CowsBullsViewBase;

    var SignInView = function (container, io) {
        CowsBullsViewBase.call(this, container, io);
        this._form = container.find('form');
        this._input = container.find('input');
        this._alert = container.find('[role="alert"]');
    };

    SignInView.prototype = Object.create(CowsBullsViewBase.prototype);
    SignInView.prototype.constructor = SignInView;

    SignInView.prototype.showError = function () {
        this._alert.show();
    };

    SignInView.prototype._submitHandler = function () {
        this.toggle(false);
        this._io.emit('sign-in', this._input.val());
        return false;
    };

    SignInView.prototype._onShow = function () {
        this._alert.hide();
    };

    SignInView.prototype._onInitialize = function () {
        this._form.submit($.proxy(this._submitHandler, this));
    };

    var LobbyView = function (container, io, getTicket) {
        CowsBullsViewBase.call(this, container, io);

        this._gameList = container.find('div.list-group');
        this._getTicket = getTicket;
        this._noGamesWarning = container.find('div[cb-role="nogames-warning"]');
        this._detailsContainer = container.find('div[cb-role="details-container"]');
        this._createNewGameButton = container.find('[cb-role="new-game-button"]');
        this._signOutButton = container.find('[cb-role="signout-button"]');
    };

    LobbyView.prototype = Object.create(CowsBullsViewBase.prototype);
    LobbyView.prototype.constructor = LobbyView;

    LobbyView.prototype._onShow = function () {
        this._detailsContainer.hide();
        this._io.emit('lobby-game-list', this._getTicket());
    };

    LobbyView.prototype._onInitialize = function () {
        this._createNewGameButton.click($.proxy(this._createNewGameButtonClickHandler, this));
        this._signOutButton.click($.proxy(this._signOutButtonClickHandler, this));
    };

    LobbyView.prototype._createNewGameButtonClickHandler = function () {
        this._container.trigger('switch-view', ['new-game']);
    };

    LobbyView.prototype._signOutButtonClickHandler = function () {
        var ticket = this._getTicket();
        this._io.emit('sign-out', ticket);
        ticket.code = null;
        ticket.name = null;
        this._container.trigger('switch-view', ['sign-in']);
    };

    LobbyView.prototype.gameList = function (data) {
        this._gameList.empty();
        var that = this;
        $.each(data, function(i, game) {
            var gameElement = $('<a class="list-group-item" />').text(game).click(function () {
                that._detailsContainer.show();
            });
            that._gameList.append(gameElement);
        });

        this._noGamesWarning.toggle(data.length === 0);
    };

    var NewGameView = function (container, io, getTicket) {
        CowsBullsViewBase.call(this, container, io);

        this._getTicket = getTicket;
        this._cancelButton = container.find('[cb-role="cancel-button"]');
    };

    NewGameView.prototype = Object.create(CowsBullsViewBase.prototype);
    NewGameView.prototype.constructor = NewGameView;

    NewGameView.prototype._onInitialize = function () {
        this._cancelButton.click($.proxy(this._cancelButtonClickHandler, this));
    };

    NewGameView.prototype._cancelButtonClickHandler = function () {
        this._container.trigger('switch-view', ['lobby']);
        return false;
    };

    $('[cows-bulls-container]').each(function () {
        new CowsBullsClient(this).initialize();
    });
})(jQuery, io);