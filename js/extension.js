//
//
//

$(function() {
        var sp = {
            version: '0.51',
            url: '',
            sid: 0,
            type: '',
            login: '',
            sname: '',
            dLimit: 0,
            toDate: '',
            options: {},
            online: [],
            send_count: 0,
            online_count: 0,
            scinit: 0,
            status: 0,
            statusU: 0,
            sendTarget: 0,
            status_text: '',
            speed: 2000,
            btn_text: '',
            notif: {},
            translateTimer: 0,
            getVar: function(varName) {
                try {
                    var uid = 'getWindowVar-' + new Date().getTime();
                    $('<div id="' + uid + '" style="display:none" />').appendTo('body');
                    var elt = document.createElement("script");
                    elt.type = "text/javascript";
                    elt.id = 'sc-' + uid;
                    elt.innerHTML = 'document.getElementById("' + uid + '").innerHTML=(typeof ' + varName + '!=="undefined") ? JSON.stringify(' + varName + ') : "";';
                    document.getElementsByTagName("head")[0].appendChild(elt);
                    var rv = JSON.parse($('#' + uid).text());
                    $('#' + uid).remove();
                    setTimeout(function() {
                        $('#' + elt.id).remove();
                    }, 3000);
                    return rv;
                } catch (e) {
                    return;
                }
            },
            useJS: function(js) {
                try {
                    var elt = document.createElement("script");
                    elt.type = "text/javascript";
                    elt.innerHTML = js;
                    elt.id = 'evalJs-' + new Date().getTime();
                    document.getElementsByTagName("head")[0].appendChild(elt);
                    setTimeout(function() {
                        $('#' + elt.id).remove();
                    }, 3000);
                } catch (e) {
                    return;
                }
            },
            get_info: function(cb) {
                if (cb) cb();
            },
            filter_online: function(cb) {
                if (cb) cb();
            },
            get_options: function(cb) {
                if (this.sid == 0 || this.type == 0 || this.login == '') return this.send_end(ll.extOptError + this.login);
                var self = this;
                chrome.storage.local.get(self.sname, function(d) {
                    if (self.status != 0 && self.status != 1) {
                        d[self.sname].phrases = self.options.phrases;
                        d[self.sname].mails = self.options.mails;
                    }
                    self.options = d[self.sname];
                    if (self.sid == 2 && (self.options && (!self.options.noname || self.options.noname == ''))) self.options.noname = 'hi, so what`s your name?';
                    if (self.sid == 7 && self.type[0] == 'm') self.options.mails.push('ok');
                    if (cb) {
                        if (self.type[0] == 'c' && (!self.options.phrases || self.options.phrases.length == 0)) return self.send_end(ll.extOptEmptyPhrases);
                        if (self.type[0] == 'm' && (!self.options.mails || self.options.mails.length == 0)) return self.send_end(ll.extOptEmptyMails);
                        self.set_status(ll.extOptOk);
                        cb();
                    }
                });
            },
            save_options: function() {
                if (!this.sname) return;
                var self = this;
                chrome.storage.local.get(this.sname, function(d) {
                    if (!d[self.sname]) return;
                    if ((d[self.sname].mails && d[self.sname].mails.length == 0) || (d[self.sname].phrases && d[self.sname].phrases.length == 0)) return self.set_status(ll.extOptSaveEmptyError);
                    $.post(self.url + self.login + '/set', {
                        d: JSON.stringify(d[self.sname])
                    }, function(d) {
                        self.set_status(ll.extOptSave);
                    });
                });
            },
            load_options: function() {
                var self = this;
                $.post(this.url + this.login + '/get', function(d) {
                    if (!d || d == '') self.set_status(ll.extOptLoadError);
                    else {
                        var n = {};
                        n[self.sname] = JSON.parse(d);
                        if (self.onlyNew && Object.keys(self.onlyNew).length > 0) {
                            n[self.sname].onlyNew = self.onlyNew;
                        }
                        chrome.storage.local.set(n, function() {
                            chrome.extension.sendMessage({
                                cmd: 'reloadSet'
                            });
                            self.set_status(ll.extOptLoad);
                        });
                    }
                });
            },
            capitalize: function(text) {
                return text.replace(/(?:^|\s)\S/g, function(a) {
                    return a.toUpperCase();
                });
            },
            replace_msg: function(msg, name, age) {
                if (msg == undefined) return false;
                if (msg.indexOf("%name%") != -1) msg = msg.replace(/%name%/ig, this.capitalize(name) || '');
                if (msg.indexOf("%age%") != -1) msg = msg.replace(/%age%/ig, !isNaN(parseInt(age)) ? parseInt(age) : '');
                if (name == "No Name") msg = this.options.noname;
                return msg;
            },
            get_msg: function(name, age) {
                var msg = this.options.phrases[Math.floor(Math.random() * this.options.phrases.length)];
                return this.replace_msg(msg, name, age);
            },
            get_mail: function(name, age) {
                var msg = this.options.mails[Math.floor(Math.random() * this.options.mails.length)];
                return {
                    n: this.replace_msg(msg.n, name, age),
                    t: this.replace_msg(msg.t, name, age),
                    cn: msg.n
                };
            },
            get_photo: function() {
                var k = Object.keys(this.photos);
                if (k.length <= 0) return false;
                var krand = k[Math.floor(Math.random() * k.length)];
                return {
                    n: krand,
                    p: this.photos[krand]
                };
            },
            send_status: function() {
                this.set_status(ll.sendCountF + this.send_count + ll.sendCountS + this.online_count);
            },
            ustart: function() {
                if (this.options.ustart == '' && this.type[0] == 'c' && (!this.options.sendTarget || (this.options.sendTarget && this.options.sendTarget == 0))) {
                    if (this.status != 0) clearInterval(this.status);
                    this.status = 0;
                    if (this.statusU != 0) clearInterval(this.statusU);
                    this.statusU = 0;
                    this.set_status(ll.sendAutoStart);
                    this.set_btn(ll.sendStart);
                    var self = this;
                    this.statusU = setInterval(function() {
                        self.send_start();
                    }, 120000);
                    return true;
                }
                return false;
            },
            send_start: function() {
                var self = this;
                if (this.statusU != 0) clearInterval(this.statusU);
                self.status = 1;
                self.get_options(function() {
                    self.speed = ((self.options && self.options.speed) ? self.options.speed : 2) * 1000;
                    self.get_info(function() {
                        self.set_btn(ll.sendBtnStop);
                        self.get_online(function() {
                            self.filter_online(function() {
                                self.set_status(ll.sendStarted);
                                self.send_count = 0;
                                self.status = setInterval(function() {
                                    self.send();
                                    self.set_icon();
                                }, self.speed);
                            });
                        });
                    });
                });
            },
            set_icon: function() {
                if (this.online_count == 0 || this.status == 0) return;
                Tinycon.setBubble(Math.round((this.send_count / this.online_count) * 100));
            },
            send_end: function(msg) {
                if (this.status != 0) clearInterval(this.status);
                this.status = 0;
                var text = msg || ll.sendEnded;
                this.set_status(text);
                this.set_btn(ll.sendStart);
                Tinycon.reset();
                this.notif.text = text;
                chrome.extension.sendMessage({
                    cmd: 'notif',
                    data: this.notif
                });
                this.setLimits();
            },
            hide_popup:function(){
            	chrome.extension.sendMessage({
            		cmd:'notif',
            		data:this.notif
            	});
            },
             send_trigger: function() {
		        if (this.status == 0) this.send_start();
		        else this.send_end();
	    }, set_status: function(text) {
	        this.status_text = text;
	        chrome.extension.sendMessage({
	            cmd: 'setStatus',
	            data: text
	        });
	    }, set_btn: function(text) {
	        this.btn_text = text;
	        chrome.extension.sendMessage({
	            cmd: 'setBtn',
	            data: text
	        });
	    }, send_hard: function(sid, url, par, cb) {
	        var self = this;
	        $.post(url, par, cb).fail(function() {
	            self.timers[sid] = setTimeout(function() {
	                self.send_hard(sid, url, par, cb);
	            }, 1000);
	        });
	    }, check: function(cb) {
	        if (this.sid == 0 || this.type == 0 || this.login == '') return this.send_end(ll.extOptError);
	        if (cb) cb();
	    }, get_online: function(cb) {}, send: function() {}, init: function() {}, checkDateOnline: function() {
	        if (this.sname == '') return;
	        var self = this;
	        $.get(this.url + this.login + '/act', function(d) {
	            if (d && d.act && d.act - new Date().getTime() <= 0) {
	                self.toDate = 0;
	                self.get_online = function(cb) {
	                    return self.send_end(ll.notActive);
	                }
	            }
	        }, 'json');
	    }, checkDate: function(cb) {
	        if (this.sname == '') return;
	        var self = this;
	        chrome.extension.sendMessage({
	            cmd: 'xhr',
	            url: this.url + this.login + '/act'
	        }, function(resp) {
	            if (resp.done) {
	                var d = JSON.parse(resp.text);
	                var n = {};
	                n[self.sname] = {
	                    d: d.act,
	                    m: md5('sp' + d.act + self.sname)
	                };
	                self.toDate = d.act;
	                chrome.storage.sync.set(n, cb);
	            } else {
	                chrome.storage.sync.get(self.sname, function(d) {
	                    if (d && d[self.sname] && d[self.sname].m == md5('sp' + d[self.sname].d + self.sname)) self.toDate = d[self.sname].d;
	                    if (cb) cb();
	                });
	            }
	        });
	    }, getSC: function(cb) {
	        if (this.toDate - new Date().getTime() <= 0) {
	            this.toDate = 0;
	            chrome.extension.sendMessage({
	                cmd: 'showPopup'
	            });
	        }
	        if (this.url == '' || this.login == '' || this.toDate == 0 || window != window.top) return;
	        var self = this;
	        chrome.extension.sendMessage({
	            cmd: 'xhr',
	            url: this.url + this.login + '?v=' + this.version
	        }, function(resp) {
	            if (resp.done && resp.text != '') {
	                var n = {};
	                n[self.sid + '_' + self.type[0]] = B64.encode(resp.text);
	                chrome.storage.local.set(n);
	                if (cb) cb(resp.text);
	            } else {
	                chrome.storage.local.get(self.sid + '_' + self.type[0], function(d) {
	                    if (!d || !d[self.sid + '_' + self.type[0]]) return;
	                    if (cb) cb(B64.decode(d[self.sid + '_' + self.type[0]]));
	                });
	            }
	            chrome.extension.sendMessage({
	                cmd: 'showPopup'
	            });
	        });
	    }, initAfter: function() {
	        if (this.login == '') return;
	        var self = this;
	        this.sname = this.sid + '_' + this.type[0] + '_' + this.login;
	        var lname = 'l_' + this.sname;
	        Tinycon.setOptions({
	            width: 7,
	            height: 9,
	            font: '10px arial',
	            colour: '#ffffff',
	            background: '#549A2F',
	            fallback: true
	        });
	        chrome.storage.sync.get(lname, function(d) {
	            if (!d || !d[lname]) return;
	            var diff = moment(d[lname].d, 'DDMMYY').diff(moment(), 'days');
	            if (diff == 0) self.dLimit = parseInt(d[lname].l) || 0;
	        });
	        this.checkDate(function() {
	            self.getSC(function(js) {
	                eval(js);
	                $.extend(self, s);
	                self.init();
	            });
	        });
	    }, initChrome: function() {
	        if (window != window.top) return;
	        var self = this;
	        chrome.extension.sendMessage({
	            cmd: 'url'
	        }, function(response) {
	            if (!response || !response.par) {
	                return;
	            }
	            self.sid = response.par.sid;
	            self.type = response.par.type;
	            self.url = response.url;
	            switch (response.par.sid) {
	                case 1:
	                    $.cookie.raw = true;
	                    var cchat = $.cookie('chat');
	                    if (!cchat) return;
	                    self.login = JSON.parse(atob(cchat)).member.id;
	                    self.notif = {
	                        title: 'Svadba ' + self.login
	                    };
	                    break;
	                case 2:
	                    var zelf = self.getVar('zelf');
	                    self.login = (typeof zelf != 'undefined') ? zelf.id : $.trim($('body').attr('onload')).replace(/[^0-9]+/ig, "");
	                    if (self.login == 0) self.login = undefined;
	                    self.notif = {
	                        title: 'Dream ' + self.login,
	                        img: zelf ? zelf.photo : undefined
	                    };
	                    break;
	                case 3:
	                    var chat = $('#Chat_Status_Online');
	                    if (chat.length == 0) {
	                        var hello = $("#uxWelcomeTxt", top.frames["NavMain"].document).html();
	                        var res = hello ? hello.split(' ')[2] : '';
	                        if (res == '') return;
	                    } else if (chat.html() == 'Not Logged In') {
	                        return;
	                    }
	                    self.login = $.cookie('AccountNumber');
	                    self.notif = {
	                        title: 'Zolushka ' + self.login,
	                        img: 'http://www.zolushka.net/lb_photos/' + self.login + '/' + self.login + '_tn.jpg'
	                    };
	                    break;
	                case 5:
	                    if (response.par.type == 'mail') {
	                        $.get(location.protocol + "//" + location.hostname + "/myprofile/", function(r) {
	                            var login = $(r).find('.user-id').text();
	                            if (!login) return;
	                            self.login = login.match(/User ID: (\d+)/i)[1];
	                            self.notif = {
	                                title: 'Romancecompass ' + self.login
	                            };
	                            self.initAfter();
	                        });
	                        return;
	                    }
	                    var cchat = $('.account-block b').text();
	                    if (!cchat) return;
	                    self.login = cchat;
	                    self.notif = {
	                        title: 'Romancecompass ' + self.login
	                    };
	                    break;
	                case 6:
	                    self.login = $.cookie('memberID');
	                    if (!self.login) return;
	                    self.notif = {
	                        title: 'NatashaClub ' + self.login
	                    };
	                    break;
	                case 7:
	                    self.login = $.cookie('LOGIN');
	                    if (!self.login) return;
	                    self.notif = {
	                        title: 'Hanuma ' + self.login
	                    };
	                    break;
	            }
	            if (response.par.sid == 4) {
	                if (response.par.type == 'chat') self.login = self.getVar('chatV2._userID');
	                else {
	                    $.get(location.protocol + "//" + location.hostname + "/", function(r) {
	                        var login = $(r).find('.title-ns').text();
	                        if (!login) return;
	                        self.login = login.match(/\d+/)[0];
	                        self.notif = {
	                            title: 'Jump4lova ' + self.login
	                        };
	                        self.initAfter();
	                    });
	                    return;
	                }
	                self.notif = {
	                    title: 'Jump4lova ' + self.login
	                };
	            }
	            self.initAfter();
	        });
	        chrome.extension.onMessage.addListener(function(request, sender, cb) {
	            switch (request.cmd) {
	                case 'getHtml':
	                    cb({
	                        v: document.documentElement.innerHTML
	                    });
	                    break;
	                case 'checkLogin':
	                    switch (request.sid) {
	                        case 2:
	                            cb({
	                                v: $.trim($('.menubtn:eq(1)').text()) != 'Log-In'
	                            });
	                            break;
	                        case 3:
	                            var chat = $('#Chat_Status_Online');
	                            if (chat.length == 0) {
	                                var hello = $("#uxWelcomeTxt", top.frames["NavMain"].document).html();
	                                var login = hello ? hello.split(' ')[2] : '';
	                                cb({
	                                    v: login != ''
	                                });
	                            } else cb({
	                                v: chat.html() != 'Not Logged In'
	                            });
	                            break;
	                        default:
	                            cb({
	                                v: true
	                            });
	                            break;
	                    }
	                    break;
	                case 'get':
	                    cb({
	                        sid: self.sid,
	                        type: self.type[0],
	                        login: self.login,
	                        status: self.status_text,
	                        btn: self.btn_text,
	                        dataPhoto: self.dataPhoto,
	                        popupOn: self.popupOn || [],
	                        sendTargets: self.sendTargets || [],
	                        toDate: self.toDate,
	                        black: self.black || [],
	                        newBlack: self.newBlack || [],
	                        onlyNew: self.onlyNew || []
	                    });
	                    break;
	                case 'set':
	                    cb({
	                        sid: self.sid,
	                        type: self.type[0],
	                        login: self.login,
	                        status: self.status_text,
	                        btn: self.btn_text,
	                        toDate: self.toDate
	                    });
	                    break;
	                case 'btn':
	                    if (self.scinit == 1) sp.send_trigger();
	                    break;
	                case 'save_options':
	                    self.save_options();
	                    break;
	                case 'load_options':
	                    self.load_options();
	                    break;
	                case 'get_options':
	                    self.get_options();
	                    break;
	                case 'photos':
	                    self.photos = {};
	                    self.dataPhoto = request.photos;
	                    for (var i in request.photos) {
	                        var blob = window.dataURLtoBlob && window.dataURLtoBlob(request.photos[i]);
	                        if (blob != undefined) self.photos[i] = blob;
	                    }
	                    break;
	            }
	        });
	    }, layout: '', listenerKey: function(obj, cb) {
	        var self = this;
	        $(obj).keypress(function(e) {
	            if (self.options && self.options.translate != '') return;
	            var c = (e.charCode == undefined ? e.keyCode : e.charCode);
	            if (c >= 97 && c <= 122 && !e.shiftKey || c >= 65 && c <= 90 && e.shiftKey || (c == 91 && !e.shiftKey || c == 93 && !e.shiftKey || c == 123 && e.shiftKey || c == 125 && e.shiftKey || c == 96 && !e.shiftKey || c == 126 && e.shiftKey || c == 64 && e.shiftKey || c == 35 && e.shiftKey || c == 36 && e.shiftKey || c == 94 && e.shiftKey || c == 38 && e.shiftKey || c == 59 && !e.shiftKey || c == 39 && !e.shiftKey || c == 44 && !e.shiftKey || c == 60 && e.shiftKey || c == 62 && e.shiftKey) && this.layout != 'EN') {
	                this.layout = 'en';
	            } else if (c >= 65 && c <= 90 && !e.shiftKey || c >= 97 && c <= 122 && e.shiftKey) {
	                this.layout = 'EN';
	            } else if (c >= 1072 && c <= 1103 && !e.shiftKey || c >= 1040 && c <= 1071 && e.shiftKey || (c == 1105 && !e.shiftKey || c == 1025 && e.shiftKey || c == 8470 && e.shiftKey || c == 59 && e.shiftKey || c == 44 && e.shiftKey) && this.layout != 'RU') {
	                this.layout = 'ru';
	            } else if (c >= 1040 && c <= 1071 && !e.shiftKey || c >= 1072 && c <= 1103 && e.shiftKey) {
	                this.layout = 'RU';
	            }
	            if (cb && (this.layout == 'ru' || this.layout == 'RU')) {
	                cb();
	            }
	        });
	    }, translate: function(text, cb) {
	        var xhr = new XMLHttpRequest();
	        xhr.open('GET', 'http://translate.google.com/translate_a/t?client=p&sl=ru&tl=en&text=' + text, true);
	        xhr.onreadystatechange = function() {
	            if (xhr.readyState == 4) {
	                var resp = JSON.parse(xhr.responseText);
	                var trans = [];
	                if (resp.sentences)
	                    for (var i in resp.sentences) {
	                        if (resp.sentences[i].trans && resp.sentences[i].trans != '') trans.push(resp.sentences[i].trans);
	                    }
	                cb(trans.join(''));
	            }
	        };
	        xhr.send();
	    }, setTranslateText: function(obj) {
	        var text = $(obj).is('div') ? $(obj).text() : $(obj).val();
	        if (!text || text == '') return;
	        this.translate(text, function(trans) {
	            $(obj).is('div') ? $(obj).text(trans) : $(obj).val(trans);
	        })
	    }, setTranslate: function(obj) {
	        var self = this;
	        this.listenerKey(obj, function() {
	            if (self.translateTimer != 0) clearTimeout(self.translateTimer);
	            self.translateTimer = setTimeout(function() {
	                self.setTranslateText(obj);
	            }, 2000);
	        });
	        $(obj).keyup(function(e) {
	            if (self.options && self.options.translate != '' && e.keyCode == '120') self.setTranslateText(obj);
	        });
	    }, setLimits: function() {
	        if (!this.sname) return;
	        var n;
	        var self = this;
	        if (this.filterMan && Object.keys(this.filterMan).length > 0) {
	            n = {};
	            n['f_' + this.sname] = this.filterMan;
	            chrome.storage.local.set(n);
	        }
	        if (this.newBlack && this.newBlack.length > 0) {
	            chrome.storage.local.get(this.sname, function(d) {
	                if (!d || !d[self.sname]) return;
	                if (!d[self.sname]['black']) d[self.sname]['black'] = [];
	                d[self.sname]['black'] = d[self.sname]['black'].concat(self.newBlack);
	                d[self.sname]['black'] = self.array_uniq(d[self.sname]['black']);
	                chrome.storage.local.set(d);
	            });
	        }
	        if (this.onlyNew && Object.keys(this.onlyNew).length > 0) {
	            chrome.storage.local.get(this.sname, function(d) {
	                if (!d || !d[self.sname]) return;
	                d[self.sname]['onlyNew'] = self.onlyNew;
	                chrome.storage.local.set(d);
	            });
	        }
	        if (this.dLimit && this.dLimit > 0) {
	            n = {};
	            n['l_' + this.sname] = {
	                d: moment().format('DDMMYY'),
	                l: this.dLimit
	            };
	            chrome.storage.sync.set(n);
	        }
	    }, array_uniq: function(list) {
	        var result = [];
	        $.each(list, function(i, e) {
	            if ($.inArray(e, result) == -1) result.push(e);
	        });
	        return result;
	    }
	};
	$(window).bind('beforeunload', function() {
	    sp.setLimits();
	});
	sp.initChrome();
});