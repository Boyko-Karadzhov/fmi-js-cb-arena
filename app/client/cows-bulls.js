/* global io */

; (function ($, io) {
    var CowsBullsClient = function (container) {
        this._container = $(container);
        this._views = {};
        this._io = io.connect();
        this._code = null;

        this._views['sign-in'] = new SignInView(this._container.find('div[cb-view="sign-in"]'), this._io);
        this._views['lobby'] = new LobbyView(this._container.find('div[cb-view="lobby"]'), this._io);
    };

    CowsBullsClient.prototype = {
        initialize: function () {
            this._container.show();
            this._showView('sign-in');

            this._io.on('sign-in-success', $.proxy(this._signInSuccessHandler, this));
            this._io.on('sign-in-fail', $.proxy(this._signInFailHandler, this));
        },

        _showView: function (view) {
            var that = this;
            $.each(Object.keys(this._views), function (i, val) {
                that._views[val].toggle(val === view);
            });
        },

        _signInSuccessHandler: function (data) {
            this._code = data;
            this._showView('lobby');
        },

        _signInFailHandler: function () {
            this._showView('sign-in');
            this._views['sign-in'].showError();
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

    SignInView.prototype.showError = function () {
        this._alert.show();
    };

    SignInView.prototype._submitHandler = function () {
        this.toggle(false);
        this._io.emit('sign-in', this._input.val());
        return false;
    };

    SignInView.prototype._onShow = function () {
        this._form[0].reset();
        this._alert.hide();
    };

    SignInView.prototype._onInitialize = function () {
        this._form.submit($.proxy(this._submitHandler, this));
    };

    SignInView.prototype.constructor = SignInView;

    var LobbyView = function (container, io) {
        CowsBullsViewBase.call(this, container, io);
    };

    LobbyView.prototype = Object.create(CowsBullsViewBase.prototype, {
    });

    LobbyView.prototype.constructor = LobbyView;

    $('[cows-bulls-container]').each(function () {
        new CowsBullsClient(this).initialize();
    });
})(jQuery, io);