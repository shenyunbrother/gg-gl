let PNotify, posTimer, onDocumentLoaded = () => {
        PNotify.defaultStack.context = document.body, window.addEventListener("resize", () => {
            posTimer && clearTimeout(posTimer), posTimer = setTimeout(() => {
                PNotify.positionAll()
            }, 10)
        })
    },
    createStackOverlay = t => {
        const e = document.createElement("div");
        e.classList.add("ui-pnotify-modal-overlay"), t.context !== document.body && (e.style.height = t.context.scrollHeight + "px", e.style.width = t.context.scrollWidth + "px"), e.addEventListener("click", () => {
            t.overlayClose && PNotify.closeStack(t)
        }), t.overlay = e
    },
    insertStackOverlay = t => {
        t.overlay.parentNode !== t.context && (t.overlay = t.context.insertBefore(t.overlay, t.context.firstChild))
    },
    removeStackOverlay = t => {
        t.overlay.parentNode && t.overlay.parentNode.removeChild(t.overlay)
    };
const getDefaultArgs = (t, e) => ("object" != typeof t && (t = {
    text: t
}), e && (t.type = e), {
    target: document.body,
    data: t
});

function _styles({
    styling: t
}) {
    return "object" == typeof t ? t : PNotify.styling[t]
}

function _icons({
    icons: t
}) {
    return "object" == typeof t ? t : PNotify.icons[t]
}

function _widthStyle({
    width: t
}) {
    return "string" == typeof t ? "width: " + t + ";" : ""
}

function _minHeightStyle({
    minHeight: t
}) {
    return "string" == typeof t ? "min-height: " + t + ";" : ""
}

function data() {
    const t = Object.assign({
        _state: "initializing",
        _timer: null,
        _animTimer: null,
        _animating: !1,
        _animatingClass: "",
        _moveClass: "",
        _timerHide: !1,
        _moduleClasses: [],
        _moduleIsNoticeOpen: !1,
        _modules: {},
        _modulesPrependContainer: PNotify.modulesPrependContainer,
        _modulesAppendContainer: PNotify.modulesAppendContainer
    }, PNotify.defaults);
    return t.modules = Object.assign({}, PNotify.defaults.modules), t
}
var methods = {
    runModules(t) {
        if ("init" === t) {
            for (let t in PNotify.modules)
                if (PNotify.modules.hasOwnProperty(t) && "function" == typeof PNotify.modules[t].init) {
                    const e = PNotify.modules[t].init(this);
                    this.initModule(e)
                }
        } else {
            const {
                _modules: e
            } = this.get();
            for (let i in e) {
                if (!e.hasOwnProperty(i)) continue;
                const n = Object.assign({
                    _notice: this,
                    _options: this.get()
                }, this.get().modules[i]);
                e[i].set(n), "function" == typeof e[i][t] && e[i][t]()
            }
        }
    },
    initModule(t) {
        const {
            modules: e
        } = this.get();
        e.hasOwnProperty(t.constructor.key) || (e[t.constructor.key] = {});
        const i = Object.assign({
            _notice: this,
            _options: this.get()
        }, e[t.constructor.key]);
        t.initModule(i);
        const {
            _modules: n
        } = this.get();
        n[t.constructor.key] = t
    },
    update(t) {
        const e = this.get().hide,
            i = this.get().icon;
        this.set(t), this.runModules("update"), this.get().hide ? e || this.queueClose() : this.cancelClose(), this.queuePosition();
        const {
            icon: n
        } = this.get();
        return n !== i && (!0 === n && "fontawesome5" === this.get().icons || "string" == typeof n && n.match(/(^| )fa[srlb]($| )/)) && (this.set({
            icon: !1
        }), this.set({
            icon: n
        })), this
    },
    open() {
        const {
            _state: t,
            hide: e
        } = this.get();
        if ("opening" === t) return;
        if ("open" === t) return void(e && this.queueClose());
        this.set({
            _state: "opening",
            _animatingClass: "ui-pnotify-initial-hidden"
        }), this.runModules("beforeOpen");
        let {
            stack: i
        } = this.get();
        if (!this.refs.elem.parentNode || i && i.context && i.context !== this.refs.elem.parentNode)
            if (i && i.context) i.context.appendChild(this.refs.elem);
            else {
                if (!document.body) throw new Error("No context to open this notice in.");
                document.body.appendChild(this.refs.elem)
            } return setTimeout(() => {
            i && (i.animation = !1, PNotify.positionAll(), i.animation = !0), this.animateIn(() => {
                this.get().hide && this.queueClose(), this.set({
                    _state: "open"
                }), this.runModules("afterOpen")
            })
        }, 0), this
    },
    remove(t) {
        return this.close(t)
    },
    close(t) {
        const {
            _state: e
        } = this.get();
        if ("closing" === e || "closed" === e) return;
        this.set({
            _state: "closing",
            _timerHide: !!t
        }), this.runModules("beforeClose");
        const {
            _timer: i
        } = this.get();
        return i && clearTimeout && (clearTimeout(i), this.set({
            _timer: null
        })), this.animateOut(() => {
            if (this.set({
                    _state: "closed"
                }), this.runModules("afterClose"), this.queuePosition(), this.get().remove && this.refs.elem.parentNode.removeChild(this.refs.elem), this.runModules("beforeDestroy"), this.get().destroy && null !== PNotify.notices) {
                const t = PNotify.notices.indexOf(this); - 1 !== t && PNotify.notices.splice(t, 1)
            }
            this.runModules("afterDestroy")
        }), this
    },
    animateIn(t) {
        this.set({
            _animating: "in"
        });
        const e = () => {
            this.refs.elem.removeEventListener("transitionend", e);
            const {
                _animTimer: i,
                _animating: n,
                _moduleIsNoticeOpen: o
            } = this.get();
            if (i && clearTimeout(i), "in" !== n) return;
            let s = o;
            if (!s) {
                const t = this.refs.elem.getBoundingClientRect();
                for (let e in t)
                    if (t[e] > 0) {
                        s = !0;
                        break
                    }
            }
            s ? (t && t.call(), this.set({
                _animating: !1
            })) : this.set({
                _animTimer: setTimeout(e, 40)
            })
        };
        "fade" === this.get().animation ? (this.refs.elem.addEventListener("transitionend", e), this.set({
            _animatingClass: "ui-pnotify-in"
        }), this.refs.elem.style.opacity, this.set({
            _animatingClass: "ui-pnotify-in ui-pnotify-fade-in"
        }), this.set({
            _animTimer: setTimeout(e, 650)
        })) : (this.set({
            _animatingClass: "ui-pnotify-in"
        }), e())
    },
    animateOut(t) {
        this.set({
            _animating: "out"
        });
        const e = () => {
            this.refs.elem.removeEventListener("transitionend", e);
            const {
                _animTimer: i,
                _animating: n,
                _moduleIsNoticeOpen: o
            } = this.get();
            if (i && clearTimeout(i), "out" !== n) return;
            let s = o;
            if (!s) {
                const t = this.refs.elem.getBoundingClientRect();
                for (let e in t)
                    if (t[e] > 0) {
                        s = !0;
                        break
                    }
            }
            if (this.refs.elem.style.opacity && "0" !== this.refs.elem.style.opacity && s) this.set({
                _animTimer: setTimeout(e, 40)
            });
            else {
                this.set({
                    _animatingClass: ""
                });
                const {
                    stack: e
                } = this.get();
                if (e && e.overlay) {
                    let t = !1;
                    for (let i = 0; i < PNotify.notices.length; i++) {
                        const n = PNotify.notices[i];
                        if (n !== this && n.get().stack === e && "closed" !== n.get()._state) {
                            t = !0;
                            break
                        }
                    }
                    t || removeStackOverlay(e)
                }
                t && t.call(), this.set({
                    _animating: !1
                })
            }
        };
        "fade" === this.get().animation ? (this.refs.elem.addEventListener("transitionend", e), this.set({
            _animatingClass: "ui-pnotify-in"
        }), this.set({
            _animTimer: setTimeout(e, 650)
        })) : (this.set({
            _animatingClass: ""
        }), e())
    },
    position() {
        let {
            stack: t
        } = this.get(), e = this.refs.elem;
        if (!t) return;
        if (t.context || (t.context = document.body), "number" != typeof t.nextpos1 && (t.nextpos1 = t.firstpos1), "number" != typeof t.nextpos2 && (t.nextpos2 = t.firstpos2), "number" != typeof t.addpos2 && (t.addpos2 = 0), !e.classList.contains("ui-pnotify-in") && !e.classList.contains("ui-pnotify-initial-hidden")) return this;
        t.modal && (t.overlay || createStackOverlay(t), insertStackOverlay(t)), e.getBoundingClientRect(), t.animation && this.set({
            _moveClass: "ui-pnotify-move"
        });
        let i, n = t.context === document.body ? window.innerHeight : t.context.scrollHeight,
            o = t.context === document.body ? window.innerWidth : t.context.scrollWidth;
        if (t.dir1) {
            let s;
            switch (i = {
                down: "top",
                up: "bottom",
                left: "right",
                right: "left"
            } [t.dir1], t.dir1) {
                case "down":
                    s = e.offsetTop;
                    break;
                case "up":
                    s = n - e.scrollHeight - e.offsetTop;
                    break;
                case "left":
                    s = o - e.scrollWidth - e.offsetLeft;
                    break;
                case "right":
                    s = e.offsetLeft
            }
            void 0 === t.firstpos1 && (t.firstpos1 = s, t.nextpos1 = t.firstpos1)
        }
        if (t.dir1 && t.dir2) {
            let i, s = {
                down: "top",
                up: "bottom",
                left: "right",
                right: "left"
            } [t.dir2];
            switch (t.dir2) {
                case "down":
                    i = e.offsetTop;
                    break;
                case "up":
                    i = n - e.scrollHeight - e.offsetTop;
                    break;
                case "left":
                    i = o - e.scrollWidth - e.offsetLeft;
                    break;
                case "right":
                    i = e.offsetLeft
            }
            void 0 === t.firstpos2 && (t.firstpos2 = i, t.nextpos2 = t.firstpos2);
            const r = t.nextpos1 + e.offsetHeight + (void 0 === t.spacing1 ? 25 : t.spacing1),
                a = t.nextpos1 + e.offsetWidth + (void 0 === t.spacing1 ? 25 : t.spacing1);
            switch ((("down" === t.dir1 || "up" === t.dir1) && r > n || ("left" === t.dir1 || "right" === t.dir1) && a > o) && (t.nextpos1 = t.firstpos1, t.nextpos2 += t.addpos2 + (void 0 === t.spacing2 ? 25 : t.spacing2), t.addpos2 = 0), "number" == typeof t.nextpos2 && (e.style[s] = t.nextpos2 + "px", t.animation || e.style[s]), t.dir2) {
                case "down":
                case "up":
                    e.offsetHeight + (parseFloat(e.style.marginTop, 10) || 0) + (parseFloat(e.style.marginBottom, 10) || 0) > t.addpos2 && (t.addpos2 = e.offsetHeight);
                    break;
                case "left":
                case "right":
                    e.offsetWidth + (parseFloat(e.style.marginLeft, 10) || 0) + (parseFloat(e.style.marginRight, 10) || 0) > t.addpos2 && (t.addpos2 = e.offsetWidth)
            }
        } else if (t.dir1) {
            let i, o;
            switch (t.dir1) {
                case "down":
                case "up":
                    o = ["left", "right"], i = t.context.scrollWidth / 2 - e.offsetWidth / 2;
                    break;
                case "left":
                case "right":
                    o = ["top", "bottom"], i = n / 2 - e.offsetHeight / 2
            }
            e.style[o[0]] = i + "px", e.style[o[1]] = "auto", t.animation || e.style[o[0]]
        }
        if (t.dir1) switch ("number" == typeof t.nextpos1 && (e.style[i] = t.nextpos1 + "px", t.animation || e.style[i]), t.dir1) {
            case "down":
            case "up":
                t.nextpos1 += e.offsetHeight + (void 0 === t.spacing1 ? 25 : t.spacing1);
                break;
            case "left":
            case "right":
                t.nextpos1 += e.offsetWidth + (void 0 === t.spacing1 ? 25 : t.spacing1)
        } else {
            let i = o / 2 - e.offsetWidth / 2,
                s = n / 2 - e.offsetHeight / 2;
            e.style.left = i + "px", e.style.top = s + "px", t.animation || e.style.left
        }
        return this
    },
    queuePosition(t) {
        return posTimer && clearTimeout(posTimer), t || (t = 10), posTimer = setTimeout(() => {
            PNotify.positionAll()
        }, t), this
    },
    cancelRemove() {
        return this.cancelClose()
    },
    cancelClose() {
        const {
            _timer: t,
            _animTimer: e,
            _state: i,
            animation: n
        } = this.get();
        return t && clearTimeout(t), e && clearTimeout(e), "closing" === i && this.set({
            _state: "open",
            _animating: !1,
            _animatingClass: "fade" === n ? "ui-pnotify-in ui-pnotify-fade-in" : "ui-pnotify-in"
        }), this
    },
    queueRemove() {
        return this.queueClose()
    },
    queueClose() {
        return this.cancelClose(), this.set({
            _timer: setTimeout(() => this.close(!0), isNaN(this.get().delay) ? 0 : this.get().delay)
        }), this
    },
    addModuleClass(...t) {
        const {
            _moduleClasses: e
        } = this.get();
        for (let i = 0; i < t.length; i++) {
            let n = t[i]; - 1 === e.indexOf(n) && e.push(n)
        }
        this.set({
            _moduleClasses: e
        })
    },
    removeModuleClass(...t) {
        const {
            _moduleClasses: e
        } = this.get();
        for (let i = 0; i < t.length; i++) {
            let n = t[i];
            const o = e.indexOf(n); - 1 !== o && e.splice(o, 1)
        }
        this.set({
            _moduleClasses: e
        })
    },
    hasModuleClass(...t) {
        const {
            _moduleClasses: e
        } = this.get();
        for (let i = 0; i < t.length; i++) {
            let n = t[i];
            if (-1 === e.indexOf(n)) return !1
        }
        return !0
    }
};

function oncreate() {
    this.on("mouseenter", t => {
        if (this.get().mouseReset && "out" === this.get()._animating) {
            if (!this.get()._timerHide) return;
            this.cancelClose()
        }
        this.get().hide && this.get().mouseReset && this.cancelClose()
    }), this.on("mouseleave", t => {
        this.get().hide && this.get().mouseReset && "out" !== this.get()._animating && this.queueClose(), PNotify.positionAll()
    });
    let {
        stack: t
    } = this.get();
    t && "top" === t.push ? PNotify.notices.splice(0, 0, this) : PNotify.notices.push(this), this.runModules("init"), this.set({
        _state: "closed"
    }), this.get().autoDisplay && this.open()
}

function setup(t) {
    (PNotify = t).VERSION = "4.0.0", PNotify.defaultStack = {
        dir1: "down",
        dir2: "left",
        firstpos1: 25,
        firstpos2: 25,
        spacing1: 36,
        spacing2: 36,
        push: "bottom",
        context: window && document.body
    }, PNotify.defaults = {
        title: !1,
        titleTrusted: !1,
        text: !1,
        textTrusted: !1,
        styling: "brighttheme",
        icons: "brighttheme",
        addClass: "",
        cornerClass: "",
        autoDisplay: !0,
        width: "360px",
        minHeight: "16px",
        type: "notice",
        icon: !0,
        animation: "fade",
        animateSpeed: "normal",
        shadow: !0,
        hide: !0,
        delay: 8e3,
        mouseReset: !0,
        remove: !0,
        destroy: !0,
        stack: PNotify.defaultStack,
        modules: {}
    }, PNotify.notices = [], PNotify.modules = {}, PNotify.modulesPrependContainer = [], PNotify.modulesAppendContainer = [], PNotify.alert = (t => new PNotify(getDefaultArgs(t))), PNotify.notice = (t => new PNotify(getDefaultArgs(t, "notice"))), PNotify.info = (t => new PNotify(getDefaultArgs(t, "info"))), PNotify.success = (t => new PNotify(getDefaultArgs(t, "success"))), PNotify.error = (t => new PNotify(getDefaultArgs(t, "error"))), PNotify.removeAll = (() => {
        PNotify.closeAll()
    }), PNotify.closeAll = (() => {
        for (let t = 0; t < PNotify.notices.length; t++) PNotify.notices[t].close && PNotify.notices[t].close(!1)
    }), PNotify.removeStack = (t => {
        PNotify.closeStack(t)
    }), PNotify.closeStack = (t => {
        if (!1 !== t)
            for (let e = 0; e < PNotify.notices.length; e++) PNotify.notices[e].close && PNotify.notices[e].get().stack === t && PNotify.notices[e].close(!1)
    }), PNotify.positionAll = (() => {
        if (posTimer && clearTimeout(posTimer), posTimer = null, PNotify.notices.length > 0) {
            for (let t = 0; t < PNotify.notices.length; t++) {
                let e = PNotify.notices[t],
                    {
                        stack: i
                    } = e.get();
                i && (i.overlay && removeStackOverlay(i), i.nextpos1 = i.firstpos1, i.nextpos2 = i.firstpos2, i.addpos2 = 0)
            }
            for (let t = 0; t < PNotify.notices.length; t++) PNotify.notices[t].position()
        } else delete PNotify.defaultStack.nextpos1, delete PNotify.defaultStack.nextpos2
    }), PNotify.styling = {
        brighttheme: {
            container: "brighttheme",
            notice: "brighttheme-notice",
            info: "brighttheme-info",
            success: "brighttheme-success",
            error: "brighttheme-error"
        },
        bootstrap3: {
            container: "alert",
            notice: "alert-warning",
            info: "alert-info",
            success: "alert-success",
            error: "alert-danger",
            icon: "ui-pnotify-icon-bs3"
        },
        bootstrap4: {
            container: "alert",
            notice: "alert-warning",
            info: "alert-info",
            success: "alert-success",
            error: "alert-danger",
            icon: "ui-pnotify-icon-bs4",
            title: "ui-pnotify-title-bs4"
        }
    }, PNotify.icons = {
        brighttheme: {
            notice: "brighttheme-icon-notice",
            info: "brighttheme-icon-info",
            success: "brighttheme-icon-success",
            error: "brighttheme-icon-error"
        },
        bootstrap3: {
            notice: "glyphicon glyphicon-exclamation-sign",
            info: "glyphicon glyphicon-info-sign",
            success: "glyphicon glyphicon-ok-sign",
            error: "glyphicon glyphicon-warning-sign"
        },
        fontawesome4: {
            notice: "fa fa-exclamation-circle",
            info: "fa fa-info-circle",
            success: "fa fa-check-circle",
            error: "fa fa-exclamation-triangle"
        },
        fontawesome5: {
            notice: "fas fa-exclamation-circle",
            info: "fas fa-info-circle",
            success: "fas fa-check-circle",
            error: "fas fa-exclamation-triangle"
        }
    }, window && document.body ? onDocumentLoaded() : document.addEventListener("DOMContentLoaded", onDocumentLoaded)
}

function add_css() {
    var t = createElement("style");
    t.id = "svelte-1eldsjg-style", t.textContent = 'body > .ui-pnotify{position:fixed;z-index:100040}body > .ui-pnotify.ui-pnotify-modal{z-index:100042}.ui-pnotify{position:absolute;height:auto;z-index:1;display:none}.ui-pnotify.ui-pnotify-modal{z-index:3}.ui-pnotify.ui-pnotify-in{display:block}.ui-pnotify.ui-pnotify-initial-hidden{display:block;visibility:hidden}.ui-pnotify.ui-pnotify-move{transition:left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-slow{transition:opacity .4s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-slow.ui-pnotify.ui-pnotify-move{transition:opacity .4s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-normal{transition:opacity .25s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-normal.ui-pnotify.ui-pnotify-move{transition:opacity .25s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-fast{transition:opacity .1s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-fast.ui-pnotify.ui-pnotify-move{transition:opacity .1s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-in{opacity:1}.ui-pnotify .ui-pnotify-shadow{-webkit-box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1);-moz-box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1);box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1)}.ui-pnotify-container{background-position:0 0;padding:.8em;height:100%;margin:0}.ui-pnotify-container:after{content:" ";visibility:hidden;display:block;height:0;clear:both}.ui-pnotify-container.ui-pnotify-sharp{-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui-pnotify-title{display:block;white-space:pre-line;margin-bottom:.4em;margin-top:0}.ui-pnotify.ui-pnotify-with-icon .ui-pnotify-title,.ui-pnotify.ui-pnotify-with-icon .ui-pnotify-text{margin-left:24px}[dir=rtl] .ui-pnotify.ui-pnotify-with-icon .ui-pnotify-title,[dir=rtl] .ui-pnotify.ui-pnotify-with-icon .ui-pnotify-text{margin-right:24px;margin-left:0}.ui-pnotify-title-bs4{font-size:1.2rem}.ui-pnotify-text{display:block;white-space:pre-line}.ui-pnotify-icon,.ui-pnotify-icon span{display:block;float:left}[dir=rtl] .ui-pnotify-icon,[dir=rtl] .ui-pnotify-icon span{float:right}.ui-pnotify-icon-bs3 > span{position:relative;top:2px}.ui-pnotify-icon-bs4 > span{position:relative;top:4px}.ui-pnotify-modal-overlay{background-color:rgba(0, 0, 0, .4);top:0;left:0;position:absolute;height:100%;width:100%;z-index:2}body > .ui-pnotify-modal-overlay{position:fixed;z-index:100041}', append(document.head, t)
}

function get_each1_context(t, e, i) {
    const n = Object.create(t);
    return n.module = e[i], n
}

function get_each0_context(t, e, i) {
    const n = Object.create(t);
    return n.module = e[i], n
}

function create_main_fragment(t, e) {
    var i, n, o, s, r, a, c, l, f, d = [],
        u = blankObject(),
        h = [],
        m = blankObject(),
        p = e._modulesPrependContainer;
    const y = t => t.module.key;
    for (var _ = 0; _ < p.length; _ += 1) {
        let i = get_each0_context(e, p, _),
            n = y(i);
        d[_] = u[n] = create_each_block_1(t, n, i)
    }
    var g = !1 !== e.icon && create_if_block_4(t, e),
        b = !1 !== e.title && create_if_block_2(t, e),
        v = !1 !== e.text && create_if_block(t, e),
        x = e._modulesAppendContainer;
    const N = t => t.module.key;
    for (_ = 0; _ < x.length; _ += 1) {
        let i = get_each1_context(e, x, _),
            n = N(i);
        h[_] = m[n] = create_each_block(t, n, i)
    }

    function k(e) {
        t.fire("mouseover", e)
    }

    function C(e) {
        t.fire("mouseout", e)
    }

    function w(e) {
        t.fire("mouseenter", e)
    }

    function P(e) {
        t.fire("mouseleave", e)
    }

    function T(e) {
        t.fire("mousemove", e)
    }

    function L(e) {
        t.fire("mousedown", e)
    }

    function S(e) {
        t.fire("mouseup", e)
    }

    function O(e) {
        t.fire("click", e)
    }

    function A(e) {
        t.fire("dblclick", e)
    }

    function H(e) {
        t.fire("focus", e)
    }

    function E(e) {
        t.fire("blur", e)
    }

    function j(e) {
        t.fire("touchstart", e)
    }

    function M(e) {
        t.fire("touchmove", e)
    }

    function D(e) {
        t.fire("touchend", e)
    }

    function B(e) {
        t.fire("touchcancel", e)
    }
    return {
        c() {
            for (i = createElement("div"), n = createElement("div"), _ = 0; _ < d.length; _ += 1) d[_].c();
            for (o = createText("\n    "), g && g.c(), s = createText("\n    "), b && b.c(), r = createText("\n    "), v && v.c(), a = createText("\n    "), _ = 0; _ < h.length; _ += 1) h[_].c();
            n.className = c = "\n        ui-pnotify-container\n        " + (e._styles.container ? e._styles.container : "") + "\n        " + (e._styles[e.type] ? e._styles[e.type] : "") + "\n        " + e.cornerClass + "\n        " + (e.shadow ? "ui-pnotify-shadow" : "") + "\n      ", n.style.cssText = l = e._widthStyle + " " + e._minHeightStyle, setAttribute(n, "role", "alert"), addListener(i, "mouseover", k), addListener(i, "mouseout", C), addListener(i, "mouseenter", w), addListener(i, "mouseleave", P), addListener(i, "mousemove", T), addListener(i, "mousedown", L), addListener(i, "mouseup", S), addListener(i, "click", O), addListener(i, "dblclick", A), addListener(i, "focus", H), addListener(i, "blur", E), addListener(i, "touchstart", j), addListener(i, "touchmove", M), addListener(i, "touchend", D), addListener(i, "touchcancel", B), i.className = f = "\n      ui-pnotify\n      " + (!1 !== e.icon ? "ui-pnotify-with-icon" : "") + "\n      " + (e._styles.element ? e._styles.element : "") + "\n      " + e.addClass + "\n      " + e._animatingClass + "\n      " + e._moveClass + "\n      " + ("fade" === e.animation ? "ui-pnotify-fade-" + e.animateSpeed : "") + "\n      " + (e.stack && e.stack.modal ? "ui-pnotify-modal" : "") + "\n      " + e._moduleClasses.join(" ") + "\n    ", setAttribute(i, "aria-live", "assertive"), setAttribute(i, "role", "alertdialog"), setAttribute(i, "ui-pnotify", !0)
        },
        m(e, c) {
            for (insert(e, i, c), append(i, n), _ = 0; _ < d.length; _ += 1) d[_].m(n, null);
            for (append(n, o), g && g.m(n, null), append(n, s), b && b.m(n, null), append(n, r), v && v.m(n, null), append(n, a), _ = 0; _ < h.length; _ += 1) h[_].m(n, null);
            t.refs.container = n, t.refs.elem = i
        },
        p(e, p) {
            const _ = p._modulesPrependContainer;
            d = updateKeyedEach(d, t, e, y, 1, p, _, u, n, destroyBlock, create_each_block_1, "m", o, get_each0_context), !1 !== p.icon ? g ? g.p(e, p) : ((g = create_if_block_4(t, p)).c(), g.m(n, s)) : g && (g.d(1), g = null), !1 !== p.title ? b ? b.p(e, p) : ((b = create_if_block_2(t, p)).c(), b.m(n, r)) : b && (b.d(1), b = null), !1 !== p.text ? v ? v.p(e, p) : ((v = create_if_block(t, p)).c(), v.m(n, a)) : v && (v.d(1), v = null);
            const x = p._modulesAppendContainer;
            h = updateKeyedEach(h, t, e, N, 1, p, x, m, n, destroyBlock, create_each_block, "m", null, get_each1_context), (e._styles || e.type || e.cornerClass || e.shadow) && c !== (c = "\n        ui-pnotify-container\n        " + (p._styles.container ? p._styles.container : "") + "\n        " + (p._styles[p.type] ? p._styles[p.type] : "") + "\n        " + p.cornerClass + "\n        " + (p.shadow ? "ui-pnotify-shadow" : "") + "\n      ") && (n.className = c), (e._widthStyle || e._minHeightStyle) && l !== (l = p._widthStyle + " " + p._minHeightStyle) && (n.style.cssText = l), (e.icon || e._styles || e.addClass || e._animatingClass || e._moveClass || e.animation || e.animateSpeed || e.stack || e._moduleClasses) && f !== (f = "\n      ui-pnotify\n      " + (!1 !== p.icon ? "ui-pnotify-with-icon" : "") + "\n      " + (p._styles.element ? p._styles.element : "") + "\n      " + p.addClass + "\n      " + p._animatingClass + "\n      " + p._moveClass + "\n      " + ("fade" === p.animation ? "ui-pnotify-fade-" + p.animateSpeed : "") + "\n      " + (p.stack && p.stack.modal ? "ui-pnotify-modal" : "") + "\n      " + p._moduleClasses.join(" ") + "\n    ") && (i.className = f)
        },
        d(e) {
            for (e && detachNode(i), _ = 0; _ < d.length; _ += 1) d[_].d();
            for (g && g.d(), b && b.d(), v && v.d(), _ = 0; _ < h.length; _ += 1) h[_].d();
            t.refs.container === n && (t.refs.container = null), removeListener(i, "mouseover", k), removeListener(i, "mouseout", C), removeListener(i, "mouseenter", w), removeListener(i, "mouseleave", P), removeListener(i, "mousemove", T), removeListener(i, "mousedown", L), removeListener(i, "mouseup", S), removeListener(i, "click", O), removeListener(i, "dblclick", A), removeListener(i, "focus", H), removeListener(i, "blur", E), removeListener(i, "touchstart", j), removeListener(i, "touchmove", M), removeListener(i, "touchend", D), removeListener(i, "touchcancel", B), t.refs.elem === i && (t.refs.elem = null)
        }
    }
}

function create_each_block_1(t, e, i) {
    var n, o, s = i.module;

    function r(e) {
        return {
            root: t.root,
            store: t.store
        }
    }
    if (s) var a = new s(r());

    function c(e) {
        t.initModule(e.module)
    }
    return a && a.on("init", c), {
        key: e,
        first: null,
        c() {
            n = createComment(), a && a._fragment.c(), o = createComment(), this.first = n
        },
        m(t, e) {
            insert(t, n, e), a && a._mount(t, e), insert(t, o, e)
        },
        p(t, e) {
            s !== (s = e.module) && (a && a.destroy(), s ? ((a = new s(r()))._fragment.c(), a._mount(o.parentNode, o), a.on("init", c)) : a = null)
        },
        d(t) {
            t && (detachNode(n), detachNode(o)), a && a.destroy(t)
        }
    }
}

function create_if_block_4(t, e) {
    var i, n, o, s;
    return {
        c() {
            i = createElement("div"), (n = createElement("span")).className = o = !0 === e.icon ? e._icons[e.type] ? e._icons[e.type] : "" : e.icon, i.className = s = "ui-pnotify-icon " + (e._styles.icon ? e._styles.icon : "")
        },
        m(e, o) {
            insert(e, i, o), append(i, n), t.refs.iconContainer = i
        },
        p(t, e) {
            (t.icon || t._icons || t.type) && o !== (o = !0 === e.icon ? e._icons[e.type] ? e._icons[e.type] : "" : e.icon) && (n.className = o), t._styles && s !== (s = "ui-pnotify-icon " + (e._styles.icon ? e._styles.icon : "")) && (i.className = s)
        },
        d(e) {
            e && detachNode(i), t.refs.iconContainer === i && (t.refs.iconContainer = null)
        }
    }
}

function create_if_block_2(t, e) {
    var i, n;

    function o(t) {
        return t.titleTrusted ? create_if_block_3 : create_else_block_1
    }
    var s = o(e),
        r = s(t, e);
    return {
        c() {
            i = createElement("h4"), r.c(), i.className = n = "ui-pnotify-title " + (e._styles.title ? e._styles.title : "")
        },
        m(e, n) {
            insert(e, i, n), r.m(i, null), t.refs.titleContainer = i
        },
        p(e, a) {
            s === (s = o(a)) && r ? r.p(e, a) : (r.d(1), (r = s(t, a)).c(), r.m(i, null)), e._styles && n !== (n = "ui-pnotify-title " + (a._styles.title ? a._styles.title : "")) && (i.className = n)
        },
        d(e) {
            e && detachNode(i), r.d(), t.refs.titleContainer === i && (t.refs.titleContainer = null)
        }
    }
}

function create_else_block_1(t, e) {
    var i;
    return {
        c() {
            i = createText(e.title)
        },
        m(t, e) {
            insert(t, i, e)
        },
        p(t, e) {
            t.title && setData(i, e.title)
        },
        d(t) {
            t && detachNode(i)
        }
    }
}

function create_if_block_3(t, e) {
    var i, n;
    return {
        c() {
            i = createElement("noscript"), n = createElement("noscript")
        },
        m(t, o) {
            insert(t, i, o), i.insertAdjacentHTML("afterend", e.title), insert(t, n, o)
        },
        p(t, e) {
            t.title && (detachBetween(i, n), i.insertAdjacentHTML("afterend", e.title))
        },
        d(t) {
            t && (detachBetween(i, n), detachNode(i), detachNode(n))
        }
    }
}

function create_if_block(t, e) {
    var i, n;

    function o(t) {
        return t.textTrusted ? create_if_block_1 : create_else_block
    }
    var s = o(e),
        r = s(t, e);
    return {
        c() {
            i = createElement("div"), r.c(), i.className = n = "ui-pnotify-text " + (e._styles.text ? e._styles.text : ""), setAttribute(i, "role", "alert")
        },
        m(e, n) {
            insert(e, i, n), r.m(i, null), t.refs.textContainer = i
        },
        p(e, a) {
            s === (s = o(a)) && r ? r.p(e, a) : (r.d(1), (r = s(t, a)).c(), r.m(i, null)), e._styles && n !== (n = "ui-pnotify-text " + (a._styles.text ? a._styles.text : "")) && (i.className = n)
        },
        d(e) {
            e && detachNode(i), r.d(), t.refs.textContainer === i && (t.refs.textContainer = null)
        }
    }
}

function create_else_block(t, e) {
    var i;
    return {
        c() {
            i = createText(e.text)
        },
        m(t, e) {
            insert(t, i, e)
        },
        p(t, e) {
            t.text && setData(i, e.text)
        },
        d(t) {
            t && detachNode(i)
        }
    }
}

function create_if_block_1(t, e) {
    var i, n;
    return {
        c() {
            i = createElement("noscript"), n = createElement("noscript")
        },
        m(t, o) {
            insert(t, i, o), i.insertAdjacentHTML("afterend", e.text), insert(t, n, o)
        },
        p(t, e) {
            t.text && (detachBetween(i, n), i.insertAdjacentHTML("afterend", e.text))
        },
        d(t) {
            t && (detachBetween(i, n), detachNode(i), detachNode(n))
        }
    }
}

function create_each_block(t, e, i) {
    var n, o, s = i.module;

    function r(e) {
        return {
            root: t.root,
            store: t.store
        }
    }
    if (s) var a = new s(r());

    function c(e) {
        t.initModule(e.module)
    }
    return a && a.on("init", c), {
        key: e,
        first: null,
        c() {
            n = createComment(), a && a._fragment.c(), o = createComment(), this.first = n
        },
        m(t, e) {
            insert(t, n, e), a && a._mount(t, e), insert(t, o, e)
        },
        p(t, e) {
            s !== (s = e.module) && (a && a.destroy(), s ? ((a = new s(r()))._fragment.c(), a._mount(o.parentNode, o), a.on("init", c)) : a = null)
        },
        d(t) {
            t && (detachNode(n), detachNode(o)), a && a.destroy(t)
        }
    }
}

function PNotify_1(t) {
    init(this, t), this.refs = {}, this._state = assign(data(), t.data), this._recompute({
        styling: 1,
        icons: 1,
        width: 1,
        minHeight: 1
    }, this._state), this._intro = !0, document.getElementById("svelte-1eldsjg-style") || add_css(), this._fragment = create_main_fragment(this, this._state), this.root._oncreate.push(() => {
        oncreate.call(this), this.fire("update", {
            changed: assignTrue({}, this._state),
            current: this._state
        })
    }), t.target && (this._fragment.c(), this._mount(t.target, t.anchor), flush(this))
}

function createElement(t) {
    return document.createElement(t)
}

function append(t, e) {
    t.appendChild(e)
}

function blankObject() {
    return Object.create(null)
}

function createText(t) {
    return document.createTextNode(t)
}

function setAttribute(t, e, i) {
    null == i ? t.removeAttribute(e) : t.setAttribute(e, i)
}

function addListener(t, e, i, n) {
    t.addEventListener(e, i, n)
}

function insert(t, e, i) {
    t.insertBefore(e, i)
}

function updateKeyedEach(t, e, i, n, o, s, r, a, c, l, f, d, u, h) {
    for (var m = t.length, p = r.length, y = m, _ = {}; y--;) _[t[y].key] = y;
    var g = [],
        b = {},
        v = {};
    for (y = p; y--;) {
        var x = h(s, r, y),
            N = n(x),
            k = a[N];
        k ? o && k.p(i, x) : (k = f(e, N, x)).c(), g[y] = b[N] = k, N in _ && (v[N] = Math.abs(y - _[N]))
    }
    var C = {},
        w = {};

    function P(t) {
        t[d](c, u), a[t.key] = t, u = t.first, p--
    }
    for (; m && p;) {
        var T = g[p - 1],
            L = t[m - 1],
            S = T.key,
            O = L.key;
        T === L ? (u = T.first, m--, p--) : b[O] ? !a[S] || C[S] ? P(T) : w[O] ? m-- : v[S] > v[O] ? (w[S] = !0, P(T)) : (C[O] = !0, m--) : (l(L, a), m--)
    }
    for (; m--;) {
        b[(L = t[m]).key] || l(L, a)
    }
    for (; p;) P(g[p - 1]);
    return g
}

function destroyBlock(t, e) {
    t.d(1), e[t.key] = null
}

function detachNode(t) {
    t.parentNode.removeChild(t)
}

function removeListener(t, e, i, n) {
    t.removeEventListener(e, i, n)
}

function createComment() {
    return document.createComment("")
}

function setData(t, e) {
    t.data = "" + e
}

function detachBetween(t, e) {
    for (; t.nextSibling && t.nextSibling !== e;) t.parentNode.removeChild(t.nextSibling)
}

function init(t, e) {
    t._handlers = blankObject(), t._slots = blankObject(), t._bind = e._bind, t._staged = {}, t.options = e, t.root = e.root || t, t.store = e.store || t.root.store, e.root || (t._beforecreate = [], t._oncreate = [], t._aftercreate = [])
}

function assign(t, e) {
    for (var i in e) t[i] = e[i];
    return t
}

function assignTrue(t, e) {
    for (var i in e) t[i] = 1;
    return t
}

function flush(t) {
    t._lock = !0, callAll(t._beforecreate), callAll(t._oncreate), callAll(t._aftercreate), t._lock = !1
}

function destroy(t) {
    this.destroy = noop, this.fire("destroy"), this.set = noop, this._fragment.d(!1 !== t), this._fragment = null, this._state = {}
}

function get() {
    return this._state
}

function fire(t, e) {
    var i = t in this._handlers && this._handlers[t].slice();
    if (i)
        for (var n = 0; n < i.length; n += 1) {
            var o = i[n];
            if (!o.__calling) try {
                o.__calling = !0, o.call(this, e)
            } finally {
                o.__calling = !1
            }
        }
}

function on(t, e) {
    var i = this._handlers[t] || (this._handlers[t] = []);
    return i.push(e), {
        cancel: function () {
            var t = i.indexOf(e);
            ~t && i.splice(t, 1)
        }
    }
}

function set(t) {
    this._set(assign({}, t)), this.root._lock || flush(this.root)
}

function _set(t) {
    var e = this._state,
        i = {},
        n = !1;
    for (var o in t = assign(this._staged, t), this._staged = {}, t) this._differs(t[o], e[o]) && (i[o] = n = !0);
    n && (this._state = assign(assign({}, e), t), this._recompute(i, this._state), this._bind && this._bind(i, this._state), this._fragment && (this.fire("state", {
        changed: i,
        current: this._state,
        previous: e
    }), this._fragment.p(i, this._state), this.fire("update", {
        changed: i,
        current: this._state,
        previous: e
    })))
}

function _stage(t) {
    assign(this._staged, t)
}

function _mount(t, e) {
    this._fragment[this._fragment.i ? "i" : "m"](t, e || null)
}

function _differs(t, e) {
    return t != t ? e == e : t !== e || t && "object" == typeof t || "function" == typeof t
}

function callAll(t) {
    for (; t && t.length;) t.shift()()
}

function noop() {}
assign(PNotify_1.prototype, {
    destroy: destroy,
    get: get,
    fire: fire,
    on: on,
    set: set,
    _set: _set,
    _stage: _stage,
    _mount: _mount,
    _differs: _differs
}), assign(PNotify_1.prototype, methods), PNotify_1.prototype._recompute = function (t, e) {
    t.styling && this._differs(e._styles, e._styles = _styles(e)) && (t._styles = !0), t.icons && this._differs(e._icons, e._icons = _icons(e)) && (t._icons = !0), t.width && this._differs(e._widthStyle, e._widthStyle = _widthStyle(e)) && (t._widthStyle = !0), t.minHeight && this._differs(e._minHeightStyle, e._minHeightStyle = _minHeightStyle(e)) && (t._minHeightStyle = !0)
}, setup(PNotify_1);
export default PNotify_1;
//# sourceMappingURL=PNotify.js.map