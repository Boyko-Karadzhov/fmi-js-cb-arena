/* global io */

; (function ($, io) {
    var CowsBullsClient = function (container) {
        this._container = $(container);
        this._currentView = null;
        this._views = {};
        this._io = io.connect();
        this._ticket = null;

        var that = this;
        var getTicket = function () { return that._ticket; };
        var setTicket = function (ticket) { return that._ticket = ticket; };
        this._views['sign-in'] = new SignInView(this._container.find('div[cb-view="sign-in"]'), this._io, getTicket, setTicket);
        this._views['lobby'] = new LobbyView(this._container.find('div[cb-view="lobby"]'), this._io, getTicket);
        this._views['new-game'] = new NewGameView(this._container.find('div[cb-view="new-game"]'), this._io, getTicket);
        this._views['in-game'] = new InGameView(this._container.find('div[cb-view="in-game"]'), this._io, getTicket);
    };

    CowsBullsClient.prototype = {
        initialize: function () {
            this._container.show();
            this._showView('sign-in');

            var that = this;
            $(this._container.find('[cb-view]')).on('switch-view', function (event, view, data) {
                that._showView(view, data);
            });
        },

        _showView: function (view, data) {
            this._currentView = view;
            var that = this;
            $.each(Object.keys(this._views), function (i, val) {
                that._views[val].toggle(val === view, data);
            });
        }
    };

    var CowsBullsViewBase = function (container, io, getTicket) {
        this._container = container;
        this._io = io;
        this._isInitialized = false;
        this._getTicket = getTicket;
    };

    CowsBullsViewBase.prototype = {
        toggle: function (val, data) {
            this._container.toggle(val);
            if (val) {
                this._onShowBase(data);
            }
        },

        _initialize: function () {
            this._onInitialize();
            this._isInitialized = true;
        },

        _onShowBase: function (data) {
            if (!this._isInitialized) {
                this._initialize();
            }

            this._onShow(data);
        },

        _onShow: function () {
        },

        _onInitialize: function () {
        }
    };

    CowsBullsViewBase.prototype.constructor = CowsBullsViewBase;

    var SignInView = function (container, io, getTicket, setTicket) {
        CowsBullsViewBase.call(this, container, io, getTicket);
        this._form = container.find('form');
        this._input = container.find('input');
        this._alert = container.find('[role="alert"]');
        this._setTicket = setTicket;
    };

    SignInView.prototype = Object.create(CowsBullsViewBase.prototype);
    SignInView.prototype.constructor = SignInView;

    SignInView.prototype._submitHandler = function () {
        this.toggle(false);
        this._io.emit('sign-in', this._input.val().trim());
        return false;
    };

    SignInView.prototype._onShow = function () {
        this._alert.hide();
    };

    SignInView.prototype._onInitialize = function () {
        this._form.submit($.proxy(this._submitHandler, this));

        this._io.on('sign-in-success', $.proxy(this._successHandler, this));
        this._io.on('sign-in-fail', $.proxy(this._failHandler, this));
    };

    SignInView.prototype._successHandler = function (data) {
        this._setTicket(data);
        this._container.trigger('switch-view', ['lobby']);
    };

    SignInView.prototype._failHandler = function () {
        this._alert.show();
        this._container.trigger('switch-view', ['sign-in']);
    };

    var LobbyView = function (container, io, getTicket) {
        CowsBullsViewBase.call(this, container, io, getTicket);

        this._gameList = container.find('div.list-group');
        this._noGamesWarning = container.find('div[cb-role="nogames-warning"]');
        this._detailsContainer = container.find('div[cb-role="details-container"]');
        this._createNewGameButton = container.find('[cb-role="new-game-button"]');
        this._signOutButton = container.find('[cb-role="signout-button"]');
        this._displayName = container.find('[cb-role="display-name"]');
        this._lobbyFailAlert = container.find('[cb-role="lobby-fail-alert"]');
    };

    LobbyView.prototype = Object.create(CowsBullsViewBase.prototype);
    LobbyView.prototype.constructor = LobbyView;

    LobbyView.prototype._onShow = function () {
        var ticket = this._getTicket();
        this._detailsContainer.hide();
        this._lobbyFailAlert.hide();
        this._displayName.text(ticket.name);

        this._io.emit('lobby-game-list', ticket);
    };

    LobbyView.prototype._onInitialize = function () {
        this._createNewGameButton.click($.proxy(this._createNewGameButtonClickHandler, this));
        this._signOutButton.click($.proxy(this._signOutButtonClickHandler, this));

        this._io.on('lobby-game-list', $.proxy(this._gameListHandler, this));
        this._io.on('join', $.proxy(this._joinHandler, this));
        this._io.on('game-details', $.proxy(this._gameDetailsHandler, this));
        this._io.on('lobby-fail', $.proxy(this._failHandler, this));
    };

    LobbyView.prototype._gameListHandler = function (data) {
        if (this._container.is(':visible')) {
            this._bindList(data);
        }
    };

    LobbyView.prototype._joinHandler = function (data) {
        this._container.trigger('switch-view', ['in-game', data]);
    };

    LobbyView.prototype._failHandler = function (data) {
        this._lobbyFailAlert.text(data);
        this._lobbyFailAlert.show();
    };

    LobbyView.prototype._gameDetailsHandler = function (data) {
        this._gameList.find('a.list-group-item').toggleClass('active', false);
        this._gameList.find('a.list-group-item').filter(function () { return $(this).text() === data.options.name; }).toggleClass('active', true);

        this._detailsContainer.find('h2').text(data.options.name);
        this._detailsContainer.show();
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

    LobbyView.prototype._bindList = function (data) {
        this._gameList.empty();
        var that = this;
        $.each(data, function(i, game) {
            var gameElement = $('<a class="list-group-item" />').text(game).click(function () {
                that._io.emit('game-details', { ticket: that._getTicket(), game: game });
            });

            that._gameList.append(gameElement);
        });

        this._noGamesWarning.toggle(data.length === 0);
    };

    var NewGameView = function (container, io, getTicket) {
        CowsBullsViewBase.call(this, container, io, getTicket);

        this._cancelButton = container.find('[cb-role="cancel-button"]');
        this._form = container.find('form');
        this._alert = container.find('[role="alert"]');
    };

    NewGameView.prototype = Object.create(CowsBullsViewBase.prototype);
    NewGameView.prototype.constructor = NewGameView;

    NewGameView.prototype._onInitialize = function () {
        this._cancelButton.click($.proxy(this._cancelButtonClickHandler, this));
        this._form.submit($.proxy(this._formSubmitHandler, this));

        this._io.on('new-game-fail', $.proxy(this._newGameFailHandler, this));
    };

    NewGameView.prototype._onShow = function () {
        this._alert.hide();
    };

    NewGameView.prototype._formSubmitHandler = function () {
        this._container.hide();

        var options = {};
        this._form.find('input[name]').each(function () {
            options[$.camelCase(this.name)] = this.value.trim();
        });

        this._io.emit('new-game', {
            ticket: this._getTicket(),
            options: options
        });

        return false;
    };

    NewGameView.prototype._cancelButtonClickHandler = function () {
        this._container.trigger('switch-view', ['lobby']);
        return false;
    };

    NewGameView.prototype._newGameFailHandler = function (data) {
        data = data || "Error occurred while creating a new game.";
        this._container.show();
        this._alert.text(data);
        this._alert.show();
    };

    var InGameView = function (container, io, getTicket) {
        CowsBullsViewBase.call(this, container, io, getTicket);
    };

    InGameView.prototype = Object.create(CowsBullsViewBase.prototype);
    InGameView.prototype.constructor = InGameView;

    InGameView.prototype._onShow = function (data) {
        this._container.find('h2').text(data);
    };

    $('[cows-bulls-container]').each(function () {
        new CowsBullsClient(this).initialize();
    });
})(jQuery, io);